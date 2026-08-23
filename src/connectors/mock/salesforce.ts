import { BaseEnterpriseConnector } from "@/connectors/base-connector";
import type {
  BusinessEvent,
  SyncOptions,
  ValidationResult,
} from "@/connectors/types";

type SalesforceRecord = {
  id: string;
  kind: "opportunity" | "account_risk";
  name: string;
  stage?: string;
  amount?: number;
  accountId?: string;
  relatedEntityIds?: string[];
  importance?: number;
};

/**
 * Salesforce mock connector.
 * Opportunity / account shapes stay inside this boundary.
 */
export class MockSalesforceConnector extends BaseEnterpriseConnector {
  readonly id = "connector-salesforce";
  readonly system = "salesforce";
  readonly label = "Salesforce (mock)";

  private readonly asOf: string;

  constructor(asOf = "2026-07-20T06:15:00+10:00") {
    super();
    this.asOf = asOf;
  }

  validate(raw: unknown): ValidationResult {
    const record = raw as Partial<SalesforceRecord>;
    const issues = [];
    if (!record?.id) {
      issues.push({
        level: "error" as const,
        code: "missing_id",
        message: "Salesforce record missing id",
        path: "id",
      });
    }
    if (!record?.kind) {
      issues.push({
        level: "error" as const,
        code: "missing_kind",
        message: "Salesforce record missing kind",
        path: "kind",
      });
    }
    if (record.kind === "opportunity" && !record.stage) {
      issues.push({
        level: "warning" as const,
        code: "missing_stage",
        message: "Opportunity missing stage",
        path: "stage",
      });
    }
    return { ok: issues.every((issue) => issue.level !== "error"), issues };
  }

  normalise(raw: unknown): BusinessEvent[] {
    const record = raw as SalesforceRecord;

    if (record.kind === "opportunity") {
      const events: BusinessEvent[] = [
        {
          id: `evt-sfdc-${record.id}`,
          timestamp: this.asOf,
          sourceSystem: "salesforce",
          entityType: "Opportunity",
          entityId: record.id,
          eventType: "opportunity_moved",
          importance: record.importance ?? 90,
          confidence: 86,
          relationships: [
            {
              type: "affects",
              targetEntityId: "outcome-enterprise-arr",
              targetEntityType: "Outcome",
            },
            ...(record.accountId
              ? [
                  {
                    type: "relates_to",
                    targetEntityId: record.accountId,
                    targetEntityType: "Customer" as const,
                  },
                ]
              : []),
            ...(record.relatedEntityIds ?? []).map((targetEntityId) => ({
              type: "relates_to",
              targetEntityId,
            })),
          ],
          payload: {
            name: record.name,
            stage: record.stage,
            amount: record.amount,
            system: "salesforce",
          },
          metadata: {
            connectorId: this.id,
            rawRef: record.id,
            labels: ["pipeline", "helix"],
          },
        },
        {
          id: `evt-sfdc-signal-${record.id}`,
          timestamp: this.asOf,
          sourceSystem: "salesforce",
          entityType: "Signal",
          entityId: "signal-helix-slip",
          eventType: "signal_emitted",
          importance: 94,
          confidence: 84,
          relationships: [
            {
              type: "affects",
              targetEntityId: "outcome-enterprise-arr",
              targetEntityType: "Outcome",
            },
            {
              type: "increases",
              targetEntityId: "risk-helix-window",
              targetEntityType: "Risk",
            },
          ],
          payload: {
            label: "Helix opportunity stalled on residency posture",
            stage: record.stage,
            system: "salesforce",
          },
          metadata: {
            connectorId: this.id,
            rawRef: record.id,
            labels: ["overnight", "helix"],
          },
        },
        {
          id: `evt-sfdc-decision-${record.id}`,
          timestamp: this.asOf,
          sourceSystem: "salesforce",
          entityType: "Decision",
          entityId: "decision-residency",
          eventType: "decision_required",
          importance: 96,
          confidence: 90,
          relationships: [
            {
              type: "affects",
              targetEntityId: "outcome-enterprise-arr",
              targetEntityType: "Outcome",
            },
            {
              type: "relates_to",
              targetEntityId: "customer-helix",
              targetEntityType: "Customer",
            },
          ],
          payload: {
            question: "Take a written Helix EU residency position?",
            status: "due_today",
            system: "salesforce",
          },
          metadata: {
            connectorId: this.id,
            rawRef: record.id,
            labels: ["bind", "helix"],
          },
        },
      ];
      return events;
    }

    return [
      {
        id: `evt-sfdc-${record.id}`,
        timestamp: this.asOf,
        sourceSystem: "salesforce",
        entityType: "Risk",
        entityId: record.id,
        eventType: "risk_raised",
        importance: record.importance ?? 80,
        confidence: 78,
        relationships: (record.relatedEntityIds ?? []).map((targetEntityId) => ({
          type: "affects",
          targetEntityId,
        })),
        payload: {
          name: record.name,
          system: "salesforce",
        },
        metadata: {
          connectorId: this.id,
          rawRef: record.id,
          labels: ["account_risk"],
        },
      },
    ];
  }

  protected fetchRaw(_options?: SyncOptions): unknown[] {
    const records: SalesforceRecord[] = [
      {
        id: "opp-helix-expansion",
        kind: "opportunity",
        name: "Helix Industries — EU expansion",
        stage: "Security Review",
        amount: 1_200_000,
        accountId: "customer-helix",
        relatedEntityIds: ["decision-residency", "risk-helix-window"],
        importance: 95,
      },
      {
        id: "risk-helix-window",
        kind: "account_risk",
        name: "Helix residency gap blocking procurement",
        relatedEntityIds: ["outcome-enterprise-arr", "customer-helix"],
        importance: 90,
      },
    ];
    return records;
  }
}

export function createMockSalesforceConnector(
  asOf?: string,
): MockSalesforceConnector {
  return new MockSalesforceConnector(asOf);
}
