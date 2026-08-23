/**
 * Production connection registry — encrypted tokens, tenant isolation, sync state.
 */

import {
  createTokenVault,
  type TokenVault,
  type TokenSet,
  type EncryptedTokenSet,
  type AuthSession,
  type EntraAppRegistration,
  createAuthSession,
  logoutSession,
  validateAccessToken,
} from "@/providers/microsoft365/auth";
import {
  createDefaultConnectorConfiguration,
  markConnected,
  markDisconnected,
  type M365ConnectorConfiguration,
} from "@/providers/microsoft365/configuration";
import { createCheckpointStore, type CheckpointStore } from "@/providers/microsoft365/sync/checkpoints";
import { createLiveSyncEngine, type LiveSyncEngine, type SyncRunResult } from "@/providers/microsoft365/sync/engine";
import { createWebhookStore, type WebhookStore } from "@/providers/microsoft365/webhooks";
import type { ExecutiveContextBrief } from "@/providers/microsoft365/executive-context/types";
import type { IntelligentExecutiveSnapshot } from "@/intelligence/executive-intelligence/types";
import type { EnterpriseDigitalTwin } from "@/digital-twin";
import type { KnowledgeGraph } from "@/knowledge-graph";

export type M365ConnectionRecord = {
  id: string;
  config: M365ConnectorConfiguration;
  encryptedTokens: EncryptedTokenSet | null;
  session: AuthSession | null;
  lastBrief: ExecutiveContextBrief | null;
  lastSync: SyncRunResult | null;
  authStatus: "disconnected" | "connected" | "expired" | "revoked";
  rateLimitRemaining: number | null;
  retryQueueDepth: number;
  errors: Array<{ at: string; message: string }>;
};

export type M365ConnectionRegistry = {
  getOrCreate(executiveosTenantId: string): M365ConnectionRecord;
  get(executiveosTenantId: string): M365ConnectionRecord | undefined;
  connect(input: {
    executiveosTenantId: string;
    microsoftTenantId: string;
    tokens: TokenSet;
    userId: string;
    scopes: string[];
    asOf: string;
  }): M365ConnectionRecord;
  disconnect(executiveosTenantId: string): M365ConnectionRecord | undefined;
  revokeConsent(executiveosTenantId: string, asOf: string): M365ConnectionRecord | undefined;
  sync(input: {
    executiveosTenantId: string;
    mode?: "full" | "incremental" | "delta" | "webhook" | "replay";
    snapshot?: IntelligentExecutiveSnapshot;
    twin?: EnterpriseDigitalTwin;
    graph?: KnowledgeGraph;
    asOf?: string;
  }): Promise<SyncRunResult | null>;
  getLiveBrief(executiveosTenantId: string): ExecutiveContextBrief | null;
  vault(): TokenVault;
  webhooks(): WebhookStore;
  checkpoints(): CheckpointStore;
  engine(): LiveSyncEngine;
  adminStatus(executiveosTenantId: string): M365AdminStatus | null;
};

export type M365AdminStatus = {
  tenantStatus: "connected" | "disconnected" | "degraded";
  authenticationStatus: M365ConnectionRecord["authStatus"];
  microsoftTenantId: string | null;
  permissions: string[];
  syncHealth: "healthy" | "degraded" | "failed" | "idle";
  lastSynchronisation: string | null;
  webhookStatus: ReturnType<WebhookStore["status"]>;
  rateLimits: { remaining: number | null };
  errors: Array<{ at: string; message: string }>;
  retryQueue: number;
  dataQuality: {
    briefPresent: boolean;
    commitments: number;
    signals: number;
    documents: number;
  };
  enabledServices: string[];
  syncFrequency: string;
};

/** Process-local default registry (tests / Reality Lab). */
let defaultRegistry: M365ConnectionRegistry | null = null;

export function getM365ConnectionRegistry(): M365ConnectionRegistry {
  if (!defaultRegistry) {
    defaultRegistry = createM365ConnectionRegistry();
  }
  return defaultRegistry;
}

export function resetM365ConnectionRegistry(): void {
  defaultRegistry = null;
}

export function createM365ConnectionRegistry(input?: {
  vault?: TokenVault;
  app?: EntraAppRegistration;
}): M365ConnectionRegistry {
  const vault = input?.vault ?? createTokenVault();
  const connections = new Map<string, M365ConnectionRecord>();
  const engine = createLiveSyncEngine();
  const webhooks = createWebhookStore();

  const ensure = (executiveosTenantId: string): M365ConnectionRecord => {
    const existing = connections.get(executiveosTenantId);
    if (existing) return existing;
    const record: M365ConnectionRecord = {
      id: `m365-conn-${executiveosTenantId}`,
      config: createDefaultConnectorConfiguration(executiveosTenantId),
      encryptedTokens: null,
      session: null,
      lastBrief: null,
      lastSync: null,
      authStatus: "disconnected",
      rateLimitRemaining: 10000,
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
    checkpoints: () => engine.checkpoints(),
    engine: () => engine,
    connect(input) {
      const record = ensure(input.executiveosTenantId);
      const encrypted = vault.encrypt(input.tokens);
      const session = createAuthSession({
        executiveosTenantId: input.executiveosTenantId,
        microsoftTenantId: input.microsoftTenantId,
        userPrincipalName: input.userId,
        scopes: input.scopes,
        expiresAt: input.tokens.expiresAt,
        asOf: input.asOf,
      });
      const next: M365ConnectionRecord = {
        ...record,
        config: markConnected(record.config, {
          microsoftTenantId: input.microsoftTenantId,
          scopes: input.scopes,
          userId: input.userId,
          asOf: input.asOf,
        }),
        encryptedTokens: encrypted,
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
      const next: M365ConnectionRecord = {
        ...record,
        config: markDisconnected(record.config),
        encryptedTokens: null,
        session: record.session ? logoutSession(record.session) : null,
        authStatus: "disconnected",
        lastBrief: null,
        lastSync: null,
      };
      connections.set(executiveosTenantId, next);
      return next;
    },
    revokeConsent(executiveosTenantId, asOf) {
      const record = connections.get(executiveosTenantId);
      if (!record) return undefined;
      const next: M365ConnectionRecord = {
        ...record,
        config: markDisconnected(record.config),
        encryptedTokens: null,
        session: record.session ? logoutSession(record.session) : null,
        authStatus: "revoked",
        errors: [
          ...record.errors,
          { at: asOf, message: "Consent revoked by tenant administrator" },
        ].slice(-20),
      };
      connections.set(executiveosTenantId, next);
      return next;
    },
    async sync(input) {
      const record = ensure(input.executiveosTenantId);
      if (!record.config.connected || !record.encryptedTokens) {
        return null;
      }

      const tokens = vault.decrypt(record.encryptedTokens);
      const validity = validateAccessToken({
        token: tokens,
        asOf: input.asOf,
      });
      if (!validity.ok) {
        const expired: M365ConnectionRecord = {
          ...record,
          authStatus: "expired",
          errors: [
            ...record.errors,
            { at: input.asOf ?? new Date().toISOString(), message: validity.reason },
          ].slice(-20),
          retryQueueDepth: record.retryQueueDepth + 1,
        };
        connections.set(input.executiveosTenantId, expired);
        if (!tokens.refreshToken) return null;
      }

      const result = await engine.run({
        mode: input.mode ?? "incremental",
        config: record.config,
        snapshot: input.snapshot,
        twin: input.twin,
        graph: input.graph,
        asOf: input.asOf,
      });

      const updated: M365ConnectionRecord = {
        ...record,
        authStatus: result.ok ? "connected" : record.authStatus,
        lastBrief: result.ok ? result.brief : record.lastBrief,
        lastSync: result,
        rateLimitRemaining: Math.max(0, (record.rateLimitRemaining ?? 10000) - 1),
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
      const lastSyncAt = record.lastSync?.finishedAt ?? null;
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
        microsoftTenantId: record.config.microsoftTenantId,
        permissions: record.config.consentedScopes,
        syncHealth,
        lastSynchronisation: lastSyncAt,
        webhookStatus: webhooks.status(),
        rateLimits: { remaining: record.rateLimitRemaining },
        errors: record.errors,
        retryQueue: record.retryQueueDepth,
        dataQuality: {
          briefPresent: brief != null,
          commitments: brief?.commitments.length ?? 0,
          signals: brief?.signals.length ?? 0,
          documents: brief?.documents.length ?? 0,
        },
        enabledServices: record.config.enabledServices,
        syncFrequency: record.config.syncFrequency,
      };
    },
  };
}
