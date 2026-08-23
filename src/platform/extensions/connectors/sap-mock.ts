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

type SapRecord = {
  id: string;
  kind: "invoice" | "order";
  status: string;
  name: string;
  amount?: number;
};

/**
 * Mock SAP-style ERP connector — coexists with Maximo.
 * Both emit only BusinessEvents into the Twin.
 */
class MockSapConnector
  extends BaseEnterpriseConnector
  implements PlatformConnector
{
  readonly id = "connector-sap-mock";
  readonly system = "sap";
  readonly label = "SAP ERP (mock)";
  readonly manifest: ExtensionManifest & { kind: "connector" };
  private readonly journal: BusinessEvent[] = [];

  constructor() {
    super();
    this.manifest = createManifest({
      id: this.id,
      name: this.label,
      kind: "connector",
      version: { major: 1, minor: 0, patch: 0 },
      description: "Mock SAP connector — InvoicePaid / ContractAwarded events.",
      compatibility: defaultCompatibility(),
      provides: ["connector", "erp", "finance", "orders"],
      author: "ExecutiveOS",
    });
  }

  authenticate() {
    const result = this.connect();
    return { ok: result.ok, message: result.message, sessionId: "sap-mock-session" };
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
    const record = raw as Partial<SapRecord>;
    const issues = [];
    if (!record?.id) {
      issues.push({
        level: "error" as const,
        code: "missing_id",
        message: "SAP record missing id",
      });
    }
    return { ok: issues.length === 0, issues };
  }

  normalise(raw: unknown): BusinessEvent[] {
    const record = raw as SapRecord;
    if (record.kind === "invoice" && record.status === "paid") {
      return [
        {
          id: `evt-sap-inv-${record.id}`,
          timestamp: "2026-07-20T06:15:00+10:00",
          sourceSystem: "sap",
          entityType: "Metric",
          entityId: `invoice-${record.id}`,
          eventType: "InvoicePaid",
          importance: 70,
          confidence: 90,
          relationships: [],
          payload: {
            name: record.name,
            amount: record.amount,
            executiveMeaning: "Invoice Paid",
          },
          metadata: {
            connectorId: this.id,
            rawRef: record.id,
            labels: ["sap", "invoice"],
          },
        },
      ];
    }
    return [
      {
        id: `evt-sap-order-${record.id}`,
        timestamp: "2026-07-20T06:15:00+10:00",
        sourceSystem: "sap",
        entityType: "Opportunity",
        entityId: `order-${record.id}`,
        eventType: "ContractAwarded",
        importance: 85,
        confidence: 88,
        relationships: [],
        payload: {
          name: record.name,
          amount: record.amount,
          executiveMeaning: "Contract Awarded",
        },
        metadata: {
          connectorId: this.id,
          rawRef: record.id,
          labels: ["sap", "order"],
        },
      },
    ];
  }

  protected fetchRaw(): unknown[] {
    return [
      {
        id: "INV-100",
        kind: "invoice",
        status: "paid",
        name: "Q2 services invoice",
        amount: 120000,
      },
      {
        id: "SO-55",
        kind: "order",
        status: "awarded",
        name: "Site services contract",
        amount: 2_400_000,
      },
    ] satisfies SapRecord[];
  }
}

export function createMockSapConnector(): PlatformConnector {
  return new MockSapConnector();
}
