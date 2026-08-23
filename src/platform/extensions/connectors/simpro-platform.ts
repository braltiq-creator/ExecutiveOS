import type { PlatformConnector } from "@/platform/contracts/connector";
import type { ExtensionManifest } from "@/platform/contracts/identity";
import type {
  BusinessEvent,
  SyncOptions,
  SyncResult,
  ValidationIssue,
  ValidationResult,
} from "@/connectors/types";
import {
  createMockSimproDomainEvents,
  createSimproDomainAdapter,
} from "@/industry/field-services/simpro";
import { createManifest, defaultCompatibility } from "@/platform/sdk";
import { assertBusinessEvent } from "@/platform/contracts";

/**
 * Platform connector wrapping the Simpro domain adapter.
 * Vendor objects stop at the adapter boundary.
 */
export function createSimproPlatformConnector(): PlatformConnector {
  const adapter = createSimproDomainAdapter();
  const journal: BusinessEvent[] = [];
  let status: "disconnected" | "connected" | "degraded" | "error" =
    "disconnected";
  let lastSuccessfulSync: string | null = null;
  let lastAttemptAt: string | null = null;
  let errorCount = 0;
  let warningCount = 0;
  let message = "Not connected";

  const manifest = createManifest({
    id: "connector-simpro",
    name: "Simpro (platform)",
    kind: "connector",
    version: { major: 1, minor: 0, patch: 0 },
    description:
      "Simpro connector via domain adapter — BusinessEvents only above the boundary.",
    compatibility: defaultCompatibility(),
    provides: ["connector", "field-services", "simpro"],
    author: "ExecutiveOS",
  });

  const api: PlatformConnector = {
    manifest,
    system: "simpro",
    authenticate() {
      return api.connect();
    },
    connect() {
      status = "connected";
      message = "Simpro connected (mock)";
      return { ok: true, message };
    },
    validate(raw: unknown): ValidationResult {
      const record = raw as { id?: string; name?: string };
      if (!record?.id) {
        return {
          ok: false,
          issues: [
            {
              level: "error",
              code: "missing_id",
              message: "Simpro domain event missing id",
            },
          ],
        };
      }
      return { ok: true, issues: [] };
    },
    synchronise(options?: SyncOptions): SyncResult {
      return api.sync(options);
    },
    sync(_options?: SyncOptions): SyncResult {
      const startedAt = new Date().toISOString();
      lastAttemptAt = startedAt;
      if (status === "disconnected") api.connect();
      const domainEvents = createMockSimproDomainEvents(startedAt);
      const events: BusinessEvent[] = [];
      const errors: ValidationIssue[] = [];
      const warnings: ValidationIssue[] = [];

      for (const domainEvent of domainEvents) {
        const validation = api.validate(domainEvent);
        if (!validation.ok) {
          errors.push(...validation.issues);
          continue;
        }
        const mapped = adapter.toBusinessEvents(domainEvent);
        for (const event of mapped) {
          assertBusinessEvent(event);
          events.push(event);
          if (!journal.some((item) => item.id === event.id)) {
            journal.push(event);
          }
        }
      }

      lastSuccessfulSync = new Date().toISOString();
      message = "Sync successful";
      warningCount += warnings.length;
      errorCount += errors.length;

      return {
        events,
        observability: {
          connectorId: manifest.id,
          system: "simpro",
          startedAt,
          finishedAt: lastSuccessfulSync,
          latencyMs: 0,
          recordsProcessed: domainEvents.length,
          eventsCreated: events.length,
          errors,
          warnings,
          health: api.health(),
          lastSuccessfulSync,
        },
      };
    },
    normalise(raw: unknown): BusinessEvent[] {
      return adapter.toBusinessEvents(
        raw as Parameters<typeof adapter.toBusinessEvents>[0],
      );
    },
    health() {
      return {
        connectorId: manifest.id,
        system: "simpro",
        status,
        lastSuccessfulSync,
        lastAttemptAt,
        errorCount,
        warningCount,
        message,
      };
    },
    replay(options) {
      return journal
        .filter((event) => event.timestamp >= options.from)
        .filter((event) => !options.to || event.timestamp <= options.to)
        .slice(0, options.limit ?? 100);
    },
  };

  return api;
}
