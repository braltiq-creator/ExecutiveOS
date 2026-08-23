/**
 * Production Simpro connection registry — encrypted credentials, isolation, sync state.
 */

import {
  createSimproTokenVault,
  createSimproAuthSession,
  logoutSimproSession,
  validateSimproCredentials,
  type SimproTokenVault,
  type SimproCredentials,
  type EncryptedSimproCredentials,
  type SimproAuthSession,
} from "@/providers/simpro/auth";
import {
  createDefaultSimproConfiguration,
  markSimproConnected,
  markSimproDisconnected,
  type SimproConnectorConfiguration,
} from "@/providers/simpro/configuration";
import {
  createSimproLiveSyncEngine,
  type SimproLiveSyncEngine,
  type SimproSyncRunResult,
} from "@/providers/simpro/sync";
import { createSimproWebhookStore, type SimproWebhookStore } from "@/providers/simpro/webhooks";
import type { OperationalContextBrief } from "@/providers/simpro/executive-context/types";
import type { IntelligentExecutiveSnapshot } from "@/intelligence/executive-intelligence/types";
import type { EnterpriseDigitalTwin } from "@/digital-twin";
import type { KnowledgeGraph } from "@/knowledge-graph";

export type SimproConnectionRecord = {
  id: string;
  config: SimproConnectorConfiguration;
  encryptedCredentials: EncryptedSimproCredentials | null;
  session: SimproAuthSession | null;
  lastBrief: OperationalContextBrief | null;
  lastSync: SimproSyncRunResult | null;
  authStatus: "disconnected" | "connected" | "expired" | "revoked";
  rateLimitRemaining: number | null;
  retryQueueDepth: number;
  errors: Array<{ at: string; message: string }>;
};

export type SimproAdminStatus = {
  tenantStatus: "connected" | "disconnected" | "degraded";
  authenticationStatus: SimproConnectionRecord["authStatus"];
  companyId: string | null;
  authStrategy: string | null;
  permissions: string[];
  syncHealth: "healthy" | "degraded" | "failed" | "idle";
  lastSynchronisation: string | null;
  webhookStatus: ReturnType<SimproWebhookStore["status"]>;
  rateLimits: { remaining: number | null };
  errors: Array<{ at: string; message: string }>;
  retryQueue: number;
  dataQuality: {
    briefPresent: boolean;
    openJobs: number;
    signals: number;
    recommendations: number;
  };
  enabledServices: string[];
  syncFrequency: string;
};

export type SimproConnectionRegistry = {
  getOrCreate(executiveosTenantId: string): SimproConnectionRecord;
  get(executiveosTenantId: string): SimproConnectionRecord | undefined;
  connect(input: {
    executiveosTenantId: string;
    companyId: string;
    credentials: SimproCredentials;
    userId: string;
    scopes: string[];
    asOf: string;
  }): SimproConnectionRecord;
  disconnect(executiveosTenantId: string): SimproConnectionRecord | undefined;
  revoke(executiveosTenantId: string, asOf: string): SimproConnectionRecord | undefined;
  sync(input: {
    executiveosTenantId: string;
    mode?: "full" | "incremental" | "webhook" | "replay";
    snapshot?: IntelligentExecutiveSnapshot;
    twin?: EnterpriseDigitalTwin;
    graph?: KnowledgeGraph;
    asOf?: string;
  }): Promise<SimproSyncRunResult | null>;
  getLiveBrief(executiveosTenantId: string): OperationalContextBrief | null;
  vault(): SimproTokenVault;
  webhooks(): SimproWebhookStore;
  engine(): SimproLiveSyncEngine;
  adminStatus(executiveosTenantId: string): SimproAdminStatus | null;
};

let defaultRegistry: SimproConnectionRegistry | null = null;

export function getSimproConnectionRegistry(): SimproConnectionRegistry {
  if (!defaultRegistry) defaultRegistry = createSimproConnectionRegistry();
  return defaultRegistry;
}

export function resetSimproConnectionRegistry(): void {
  defaultRegistry = null;
}

export function createSimproConnectionRegistry(input?: {
  vault?: SimproTokenVault;
}): SimproConnectionRegistry {
  const vault = input?.vault ?? createSimproTokenVault();
  const connections = new Map<string, SimproConnectionRecord>();
  const engine = createSimproLiveSyncEngine();
  const webhooks = createSimproWebhookStore();

  const ensure = (executiveosTenantId: string): SimproConnectionRecord => {
    const existing = connections.get(executiveosTenantId);
    if (existing) return existing;
    const record: SimproConnectionRecord = {
      id: `simpro-conn-${executiveosTenantId}`,
      config: createDefaultSimproConfiguration(executiveosTenantId),
      encryptedCredentials: null,
      session: null,
      lastBrief: null,
      lastSync: null,
      authStatus: "disconnected",
      rateLimitRemaining: 5000,
      retryQueueDepth: 0,
      errors: [],
    };
    connections.set(executiveosTenantId, record);
    return record;
  };

  return {
    getOrCreate: ensure,
    get: (id) => connections.get(id),
    vault: () => vault,
    webhooks: () => webhooks,
    engine: () => engine,
    connect(input) {
      const record = ensure(input.executiveosTenantId);
      const encrypted = vault.encrypt(input.credentials, input.companyId);
      const session = createSimproAuthSession({
        executiveosTenantId: input.executiveosTenantId,
        companyId: input.companyId,
        strategy: input.credentials.strategy,
        scopes: input.scopes,
        expiresAt:
          input.credentials.strategy === "oauth2"
            ? input.credentials.expiresAt
            : null,
        asOf: input.asOf,
      });
      const next: SimproConnectionRecord = {
        ...record,
        config: markSimproConnected(record.config, {
          companyId: input.companyId,
          authStrategy: input.credentials.strategy,
          scopes: input.scopes,
          userId: input.userId,
          asOf: input.asOf,
        }),
        encryptedCredentials: encrypted,
        session,
        authStatus: "connected",
        errors: [],
      };
      connections.set(input.executiveosTenantId, next);
      return next;
    },
    disconnect(executiveosTenantId) {
      const record = connections.get(executiveosTenantId);
      if (!record) return undefined;
      const next: SimproConnectionRecord = {
        ...record,
        config: markSimproDisconnected(record.config),
        encryptedCredentials: null,
        session: record.session ? logoutSimproSession(record.session) : null,
        authStatus: "disconnected",
        lastBrief: null,
        lastSync: null,
      };
      connections.set(executiveosTenantId, next);
      return next;
    },
    revoke(executiveosTenantId, asOf) {
      const record = connections.get(executiveosTenantId);
      if (!record) return undefined;
      const next: SimproConnectionRecord = {
        ...record,
        config: markSimproDisconnected(record.config),
        encryptedCredentials: null,
        session: record.session ? logoutSimproSession(record.session) : null,
        authStatus: "revoked",
        errors: [
          ...record.errors,
          { at: asOf, message: "Authentication revoked" },
        ].slice(-20),
      };
      connections.set(executiveosTenantId, next);
      return next;
    },
    async sync(input) {
      const record = ensure(input.executiveosTenantId);
      if (!record.config.connected || !record.encryptedCredentials) {
        return null;
      }
      const credentials = vault.decrypt(record.encryptedCredentials);
      const validity = validateSimproCredentials(credentials, input.asOf);
      if (!validity.ok) {
        connections.set(input.executiveosTenantId, {
          ...record,
          authStatus: "expired",
          retryQueueDepth: record.retryQueueDepth + 1,
          errors: [
            ...record.errors,
            {
              at: input.asOf ?? new Date().toISOString(),
              message: validity.reason,
            },
          ].slice(-20),
        });
        if (
          credentials.strategy !== "oauth2" ||
          !credentials.refreshToken
        ) {
          return null;
        }
      }

      const result = await engine.run({
        mode: input.mode ?? "incremental",
        config: record.config,
        snapshot: input.snapshot,
        twin: input.twin,
        graph: input.graph,
        asOf: input.asOf,
      });

      const updated: SimproConnectionRecord = {
        ...record,
        authStatus: result.ok ? "connected" : record.authStatus,
        lastBrief: result.ok ? result.brief : record.lastBrief,
        lastSync: result,
        rateLimitRemaining: Math.max(0, (record.rateLimitRemaining ?? 5000) - 1),
        retryQueueDepth: result.ok ? 0 : record.retryQueueDepth + 1,
        errors: result.ok
          ? record.errors
          : [...record.errors, { at: result.finishedAt, message: result.message }].slice(
              -20,
            ),
      };
      connections.set(input.executiveosTenantId, updated);
      return result;
    },
    getLiveBrief(executiveosTenantId) {
      return connections.get(executiveosTenantId)?.lastBrief ?? null;
    },
    adminStatus(executiveosTenantId) {
      const record = connections.get(executiveosTenantId);
      if (!record) return null;
      const syncHealth =
        !record.config.connected
          ? "idle"
          : record.lastSync == null
            ? "idle"
            : record.lastSync.ok
              ? "healthy"
              : "failed";
      const brief = record.lastBrief;
      return {
        tenantStatus: record.config.connected
          ? syncHealth === "failed"
            ? "degraded"
            : "connected"
          : "disconnected",
        authenticationStatus: record.authStatus,
        companyId: record.config.companyId,
        authStrategy: record.config.authStrategy,
        permissions: record.config.consentedScopes,
        syncHealth,
        lastSynchronisation: record.lastSync?.finishedAt ?? null,
        webhookStatus: webhooks.status(),
        rateLimits: { remaining: record.rateLimitRemaining },
        errors: record.errors,
        retryQueue: record.retryQueueDepth,
        dataQuality: {
          briefPresent: brief != null,
          openJobs: brief?.serviceDelivery.openJobs ?? 0,
          signals: brief?.signals.length ?? 0,
          recommendations: brief?.recommendations.length ?? 0,
        },
        enabledServices: record.config.enabledServices,
        syncFrequency: record.config.syncFrequency,
      };
    },
  };
}
