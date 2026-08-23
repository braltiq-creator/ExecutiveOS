import type { EnterpriseConnector } from "@/connectors/connector";
import type {
  BusinessEvent,
  ConnectorHealth,
  ConnectorStatus,
  SyncOptions,
  SyncResult,
  ValidationIssue,
  ValidationResult,
} from "@/connectors/types";

/**
 * Shared connector mechanics — subclasses supply vendor fetch + normalise.
 */
export abstract class BaseEnterpriseConnector implements EnterpriseConnector {
  abstract readonly id: string;
  abstract readonly system: string;
  abstract readonly label: string;

  protected status: ConnectorStatus = "disconnected";
  protected lastSuccessfulSync: string | null = null;
  protected lastAttemptAt: string | null = null;
  protected errorCount = 0;
  protected warningCount = 0;
  protected message = "Not connected";

  connect(): { ok: boolean; message: string } {
    this.status = "connected";
    this.message = `${this.label} connected (mock)`;
    return { ok: true, message: this.message };
  }

  abstract validate(raw: unknown): ValidationResult;
  abstract normalise(raw: unknown): BusinessEvent[];

  /** Vendor-specific pull — returns raw records (never leave the connector). */
  protected abstract fetchRaw(options?: SyncOptions): unknown[];

  sync(options: SyncOptions = {}): SyncResult {
    const startedAt = nowIso();
    const startedMs = Date.now();
    this.lastAttemptAt = startedAt;

    if (this.status === "disconnected") {
      this.connect();
    }

    const errors: ValidationIssue[] = [];
    const warnings: ValidationIssue[] = [];
    const events: BusinessEvent[] = [];
    let recordsProcessed = 0;

    try {
      const rawRecords = this.fetchRaw(options);
      const limited =
        typeof options.limit === "number"
          ? rawRecords.slice(0, options.limit)
          : rawRecords;

      for (const raw of limited) {
        recordsProcessed += 1;
        const validation = this.validate(raw);
        for (const issue of validation.issues) {
          if (issue.level === "error") errors.push(issue);
          else warnings.push(issue);
        }
        if (!validation.ok) continue;
        if (options.dryRun) continue;
        events.push(...this.normalise(raw));
      }

      if (errors.length > 0) {
        this.status = "degraded";
        this.message = `Sync completed with ${errors.length} error(s)`;
        this.errorCount += errors.length;
      } else {
        this.status = "connected";
        this.message = "Sync successful";
        if (!options.dryRun) {
          this.lastSuccessfulSync = nowIso();
        }
      }
      this.warningCount += warnings.length;
    } catch (error) {
      this.status = "error";
      this.errorCount += 1;
      const message =
        error instanceof Error ? error.message : "Unknown sync failure";
      this.message = message;
      errors.push({
        level: "error",
        code: "sync_failed",
        message,
      });
    }

    const finishedAt = nowIso();
    const health = this.health();

    return {
      events,
      observability: {
        connectorId: this.id,
        system: this.system,
        startedAt,
        finishedAt,
        latencyMs: Math.max(0, Date.now() - startedMs),
        recordsProcessed,
        eventsCreated: events.length,
        errors,
        warnings,
        health,
        lastSuccessfulSync: this.lastSuccessfulSync,
      },
    };
  }

  health(): ConnectorHealth {
    return {
      connectorId: this.id,
      system: this.system,
      status: this.status,
      lastSuccessfulSync: this.lastSuccessfulSync,
      lastAttemptAt: this.lastAttemptAt,
      errorCount: this.errorCount,
      warningCount: this.warningCount,
      message: this.message,
    };
  }
}

function nowIso(): string {
  return new Date().toISOString();
}
