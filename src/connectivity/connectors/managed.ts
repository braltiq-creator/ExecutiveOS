/**
 * Managed connector — full lifecycle around Core / Platform connectors.
 */

import type { EnterpriseConnector } from "@/connectors/connector";
import type {
  BusinessEvent,
  ConnectorHealth,
  SyncOptions,
  SyncResult,
  ValidationResult,
} from "@/connectors/types";
import type { PlatformConnector } from "@/platform/contracts/connector";
import {
  authenticateWithStrategy,
  type AuthCredentials,
  type AuthSession,
} from "@/connectivity/authentication";
import {
  createLifecycleState,
  transitionLifecycle,
  type LifecycleState,
} from "@/connectivity/connectors/lifecycle";
import { buildHealthReport, type ConnectorHealthReport } from "@/connectivity/health";
import {
  createRetryState,
  recordFailure,
  type RetryState,
} from "@/connectivity/retry";
import { createConnectorCache, type ConnectorCache } from "@/connectivity/cache";
import { normaliseEventBatch } from "@/connectivity/normalisation";
import type { SyncMode } from "@/connectivity/synchronisation";

export type ManagedConnector = {
  readonly id: string;
  readonly system: string;
  readonly label: string;
  connect(): { ok: boolean; message: string };
  authenticate(credentials: AuthCredentials, asOf?: string): {
    ok: boolean;
    message: string;
    session?: AuthSession;
  };
  validate(raw: unknown): ValidationResult;
  synchronise(options?: SyncOptions & { mode?: SyncMode }): SyncResult;
  sync(options?: SyncOptions): SyncResult;
  normalise(raw: unknown): BusinessEvent[];
  publish(events: BusinessEvent[]): BusinessEvent[];
  health(): ConnectorHealth;
  platformHealth(): ConnectorHealthReport;
  recover(error: string): { ok: boolean; message: string };
  disconnect(): { ok: boolean; message: string };
  lifecycle(): LifecycleState;
  retryState(): RetryState;
  asEnterpriseConnector(): EnterpriseConnector;
};

type InnerConnector = EnterpriseConnector | PlatformConnector;

function resolveId(inner: InnerConnector): string {
  if ("manifest" in inner) return inner.manifest.id;
  return inner.id;
}

function resolveLabel(inner: InnerConnector): string {
  if ("manifest" in inner) return inner.manifest.name;
  return inner.label;
}

/**
 * Wrap any Core or Platform connector with the shared connectivity lifecycle.
 */
export function manageConnector(inner: InnerConnector): ManagedConnector {
  let lifecycle = createLifecycleState();
  let retry = createRetryState();
  let session: AuthSession | undefined;
  let eventsGenerated = 0;
  let lastSyncDurationMs: number | null = null;
  let retryCount = 0;
  const cache: ConnectorCache = createConnectorCache();

  const id = resolveId(inner);
  const system = inner.system;
  const label = resolveLabel(inner);

  const runSync = (options: SyncOptions = {}): SyncResult => {
    const started = Date.now();
    lifecycle = transitionLifecycle(lifecycle, "synchronise", {
      ok: true,
      message: "Synchronising",
    });

    try {
      const result =
        "synchronise" in inner ? inner.synchronise(options) : inner.sync(options);

      lifecycle = transitionLifecycle(lifecycle, "normalise", {
        ok: true,
        message: "Normalising events",
      });
      lifecycle = transitionLifecycle(lifecycle, "map", {
        ok: true,
        message: "Mapping complete",
      });

      const normalised = normaliseEventBatch(result.events);
      eventsGenerated += normalised.events.length;
      lastSyncDurationMs = Date.now() - started;
      cache.set(`watermark:${id}`, options.since ?? new Date().toISOString());

      lifecycle = transitionLifecycle(lifecycle, "publish", {
        ok: true,
        message: `Published ${normalised.events.length} BusinessEvents`,
      });
      lifecycle = transitionLifecycle(lifecycle, "monitor", {
        ok: result.observability.errors.length === 0,
        message: "Monitoring updated",
      });

      return {
        ...result,
        events: normalised.events,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Sync failed";
      retryCount += 1;
      retry = recordFailure(retry, {
        connectorId: id,
        error: message,
        attempt: retryCount,
      });
      lifecycle = transitionLifecycle(lifecycle, "recover", {
        ok: false,
        message,
      });
      throw error;
    }
  };

  const managed: ManagedConnector = {
    id,
    system,
    label,
    connect() {
      const result = inner.connect();
      lifecycle = transitionLifecycle(lifecycle, "connect", {
        ok: result.ok,
        message: result.message,
      });
      return result;
    },
    authenticate(credentials, asOf) {
      const result = authenticateWithStrategy({
        connectorId: id,
        credentials,
        asOf,
      });
      if (result.ok && result.session) {
        session = result.session;
        if ("authenticate" in inner) {
          inner.authenticate();
        }
      }
      lifecycle = transitionLifecycle(lifecycle, "authenticate", {
        ok: result.ok,
        message: result.message,
      });
      return result;
    },
    validate(raw) {
      lifecycle = transitionLifecycle(lifecycle, "validate", {
        ok: true,
        message: "Validating",
      });
      return inner.validate(raw);
    },
    synchronise(options) {
      return runSync(options);
    },
    sync(options) {
      return runSync(options);
    },
    normalise(raw) {
      return inner.normalise(raw);
    },
    publish(events) {
      const normalised = normaliseEventBatch(events);
      eventsGenerated += normalised.events.length;
      lifecycle = transitionLifecycle(lifecycle, "publish", {
        ok: normalised.rejected === 0,
        message: `Published ${normalised.events.length} events`,
      });
      return normalised.events;
    },
    health() {
      return inner.health();
    },
    platformHealth() {
      return buildHealthReport({
        core: inner.health(),
        authStatus: session?.status ?? "none",
        syncDurationMs: lastSyncDurationMs,
        retryCount,
        businessEventsGenerated: eventsGenerated,
        latencyMs: lastSyncDurationMs,
      });
    },
    recover(error) {
      retryCount += 1;
      retry = recordFailure(retry, {
        connectorId: id,
        error,
        attempt: retryCount,
      });
      lifecycle = transitionLifecycle(lifecycle, "recover", {
        ok: true,
        message: `Recovery recorded: ${error}`,
      });
      return { ok: true, message: `Isolated failure for ${id}` };
    },
    disconnect() {
      session = undefined;
      lifecycle = transitionLifecycle(lifecycle, "disconnect", {
        ok: true,
        message: "Disconnected",
      });
      return { ok: true, message: `${label} disconnected` };
    },
    lifecycle: () => lifecycle,
    retryState: () => retry,
    asEnterpriseConnector() {
      return {
        id,
        system,
        label,
        connect: () => managed.connect(),
        validate: (raw) => managed.validate(raw),
        sync: (options) => managed.sync(options),
        normalise: (raw) => managed.normalise(raw),
        health: () => managed.health(),
      };
    },
  };

  return managed;
}

/** Adapt PlatformConnector → EnterpriseConnector for Twin pipelines. */
export function platformToEnterprise(
  connector: PlatformConnector,
): EnterpriseConnector {
  return manageConnector(connector).asEnterpriseConnector();
}
