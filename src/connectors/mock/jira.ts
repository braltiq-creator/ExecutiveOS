import { BaseEnterpriseConnector } from "@/connectors/base-connector";
import type {
  BusinessEvent,
  SyncOptions,
  ValidationResult,
} from "@/connectors/types";

type JiraRecord = {
  id: string;
  kind: "issue" | "initiative";
  key: string;
  summary: string;
  status: string;
  priority?: string;
  relatedEntityIds?: string[];
  importance?: number;
};

/**
 * Jira mock connector.
 * Issue / initiative shapes stay inside this boundary.
 */
export class MockJiraConnector extends BaseEnterpriseConnector {
  readonly id = "connector-jira";
  readonly system = "jira";
  readonly label = "Jira (mock)";

  private readonly asOf: string;

  constructor(asOf = "2026-07-20T06:15:00+10:00") {
    super();
    this.asOf = asOf;
  }

  validate(raw: unknown): ValidationResult {
    const record = raw as Partial<JiraRecord>;
    const issues = [];
    if (!record?.id) {
      issues.push({
        level: "error" as const,
        code: "missing_id",
        message: "Jira record missing id",
        path: "id",
      });
    }
    if (!record?.key) {
      issues.push({
        level: "error" as const,
        code: "missing_key",
        message: "Jira record missing key",
        path: "key",
      });
    }
    if (!record?.status) {
      issues.push({
        level: "warning" as const,
        code: "missing_status",
        message: "Jira record missing status",
        path: "status",
      });
    }
    return { ok: issues.every((issue) => issue.level !== "error"), issues };
  }

  normalise(raw: unknown): BusinessEvent[] {
    const record = raw as JiraRecord;

    if (record.kind === "initiative") {
      return [
        {
          id: `evt-jira-${record.id}`,
          timestamp: this.asOf,
          sourceSystem: "jira",
          entityType: "StrategicInitiative",
          entityId: record.id,
          eventType: "status_changed",
          importance: record.importance ?? 72,
          confidence: 80,
          relationships: (record.relatedEntityIds ?? []).map((targetEntityId) => ({
            type: "supports",
            targetEntityId,
          })),
          payload: {
            key: record.key,
            summary: record.summary,
            status: record.status,
            system: "jira",
          },
          metadata: {
            connectorId: this.id,
            rawRef: record.key,
            labels: ["initiative"],
          },
        },
      ];
    }

    return [
      {
        id: `evt-jira-${record.id}`,
        timestamp: this.asOf,
        sourceSystem: "jira",
        entityType: "Action",
        entityId: record.id,
        eventType: "issue_updated",
        importance: record.importance ?? 68,
        confidence: 83,
        relationships: [
          {
            type: "depends_on",
            targetEntityId: "decision-residency",
            targetEntityType: "Decision",
          },
          ...(record.relatedEntityIds ?? []).map((targetEntityId) => ({
            type: "relates_to",
            targetEntityId,
          })),
        ],
        payload: {
          key: record.key,
          summary: record.summary,
          status: record.status,
          priority: record.priority,
          system: "jira",
        },
        metadata: {
          connectorId: this.id,
          rawRef: record.key,
          labels: ["delivery", "helix"],
        },
      },
    ];
  }

  protected fetchRaw(_options?: SyncOptions): unknown[] {
    const records: JiraRecord[] = [
      {
        id: "action-counsel-memo",
        kind: "issue",
        key: "SEC-214",
        summary: "Draft Helix compensating-controls exception memo",
        status: "In Progress",
        priority: "High",
        relatedEntityIds: ["decision-residency", "person-sam"],
        importance: 78,
      },
      {
        id: "action-workshop-slot",
        kind: "issue",
        key: "SEC-218",
        summary: "Confirm Helix security workshop agenda",
        status: "To Do",
        priority: "Medium",
        relatedEntityIds: ["meeting-helix-security", "customer-helix"],
        importance: 65,
      },
      {
        id: "initiative-residency-posture",
        kind: "initiative",
        key: "INI-12",
        summary: "EU residency posture programme",
        status: "Active",
        relatedEntityIds: ["outcome-enterprise-arr", "decision-residency"],
        importance: 80,
      },
    ];
    return records;
  }
}

export function createMockJiraConnector(asOf?: string): MockJiraConnector {
  return new MockJiraConnector(asOf);
}
