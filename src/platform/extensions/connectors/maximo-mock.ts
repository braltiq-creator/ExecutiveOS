import type { PlatformConnector } from "@/platform/contracts/connector";
import type { ExtensionManifest } from "@/platform/contracts/identity";
import type {
  BusinessEvent,
  SyncOptions,
  SyncResult,
  ValidationResult,
} from "@/connectors/types";
import { BaseEnterpriseConnector } from "@/connectors/base-connector";
import { createManifest, defaultCompatibility } from "@/platform/sdk";
import { assertBusinessEvent } from "@/platform/contracts";

type VendorRecord = {
  id: string;
  kind: "workorder" | "asset";
  status: string;
  name: string;
  siteId?: string;
};

/**
 * Mock Maximo-style CMMS connector.
 * Proves customers can run SAP-class + Maximo connectors simultaneously —
 * both emit BusinessEvents only.
 */
class MockMaximoConnector
  extends BaseEnterpriseConnector
  implements PlatformConnector
{
  readonly id = "connector-maximo-mock";
  readonly system = "maximo";
  readonly label = "IBM Maximo (mock)";
  readonly manifest: ExtensionManifest & { kind: "connector" };

  private readonly journal: BusinessEvent[] = [];

  constructor() {
    super();
    this.manifest = createManifest({
      id: this.id,
      name: this.label,
      kind: "connector",
      version: { major: 1, minor: 0, patch: 0 },
      description:
        "Mock Maximo connector — emits AssetFailed / ProjectDelayed BusinessEvents.",
      compatibility: defaultCompatibility(),
      provides: ["connector", "cmmms", "assets", "workorders"],
      author: "ExecutiveOS",
    });
  }

  authenticate() {
    const result = this.connect();
    return { ok: result.ok, message: result.message, sessionId: "maximo-mock-session" };
  }

  synchronise(options?: SyncOptions): SyncResult {
    return this.sync(options);
  }

  override sync(options: SyncOptions = {}): SyncResult {
    const result = super.sync(options);
    for (const event of result.events) {
      assertBusinessEvent(event);
      if (!this.journal.some((item) => item.id === event.id)) {
        this.journal.push(event);
      }
    }
    return result;
  }

  replay(options: { from: string; to?: string; limit?: number }): BusinessEvent[] {
    return this.journal
      .filter((event) => event.timestamp >= options.from)
      .filter((event) => !options.to || event.timestamp <= options.to)
      .slice(0, options.limit ?? 100);
  }

  validate(raw: unknown): ValidationResult {
    const record = raw as Partial<VendorRecord>;
    const issues = [];
    if (!record?.id) {
      issues.push({
        level: "error" as const,
        code: "missing_id",
        message: "Maximo record missing id",
      });
    }
    return { ok: issues.length === 0, issues };
  }

  normalise(raw: unknown): BusinessEvent[] {
    const record = raw as VendorRecord;
    if (record.kind === "asset" && record.status === "failed") {
      return [
        {
          id: `evt-maximo-asset-${record.id}`,
          timestamp: "2026-07-20T06:15:00+10:00",
          sourceSystem: "maximo",
          entityType: "Risk",
          entityId: `asset-${record.id}`,
          eventType: "AssetFailed",
          importance: 90,
          confidence: 86,
          relationships: [],
          payload: {
            name: record.name,
            executiveMeaning: "Asset Failed",
            status: record.status,
          },
          metadata: {
            connectorId: this.id,
            rawRef: record.id,
            labels: ["maximo", "asset"],
          },
        },
      ];
    }
    return [
      {
        id: `evt-maximo-wo-${record.id}`,
        timestamp: "2026-07-20T06:15:00+10:00",
        sourceSystem: "maximo",
        entityType: "Project",
        entityId: `workorder-${record.id}`,
        eventType: "ProjectDelayed",
        importance: 78,
        confidence: 82,
        relationships: [],
        payload: {
          name: record.name,
          executiveMeaning: "Project Delayed",
          status: record.status,
        },
        metadata: {
          connectorId: this.id,
          rawRef: record.id,
          labels: ["maximo", "workorder"],
        },
      },
    ];
  }

  protected fetchRaw(): unknown[] {
    return [
      {
        id: "ASSET-9",
        kind: "asset",
        status: "failed",
        name: "Primary crusher",
      },
      {
        id: "WO-441",
        kind: "workorder",
        status: "delayed",
        name: "Shutdown package",
        siteId: "SITE-1",
      },
    ] satisfies VendorRecord[];
  }
}

export function createMockMaximoConnector(): PlatformConnector {
  return new MockMaximoConnector();
}
