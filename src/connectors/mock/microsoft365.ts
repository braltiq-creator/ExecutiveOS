import { BaseEnterpriseConnector } from "@/connectors/base-connector";
import type {
  BusinessEvent,
  SyncOptions,
  ValidationResult,
} from "@/connectors/types";

type M365Record = {
  id: string;
  kind: "meeting" | "mail_signal" | "focus_block";
  subject: string;
  startsAt?: string;
  endsAt?: string;
  attendees?: string[];
  relatedEntityIds?: string[];
  importance?: number;
};

/**
 * Microsoft 365 mock connector.
 * Vendor calendar/mail shapes stay inside this file.
 */
export class MockMicrosoft365Connector extends BaseEnterpriseConnector {
  readonly id = "connector-m365";
  readonly system = "microsoft365";
  readonly label = "Microsoft 365 (mock)";

  private readonly asOf: string;

  constructor(asOf = "2026-07-20T06:15:00+10:00") {
    super();
    this.asOf = asOf;
  }

  validate(raw: unknown): ValidationResult {
    const record = raw as Partial<M365Record>;
    const issues = [];
    if (!record?.id) {
      issues.push({
        level: "error" as const,
        code: "missing_id",
        message: "M365 record missing id",
        path: "id",
      });
    }
    if (!record?.kind) {
      issues.push({
        level: "error" as const,
        code: "missing_kind",
        message: "M365 record missing kind",
        path: "kind",
      });
    }
    if (!record?.subject) {
      issues.push({
        level: "warning" as const,
        code: "missing_subject",
        message: "M365 record missing subject",
        path: "subject",
      });
    }
    return { ok: issues.every((issue) => issue.level !== "error"), issues };
  }

  normalise(raw: unknown): BusinessEvent[] {
    const record = raw as M365Record;
    if (record.kind === "meeting") {
      return [
        {
          id: `evt-m365-${record.id}`,
          timestamp: record.startsAt ?? this.asOf,
          sourceSystem: "microsoft365",
          entityType: "Meeting",
          entityId: record.id,
          eventType: "meeting_scheduled",
          importance: record.importance ?? 70,
          confidence: 88,
          relationships: (record.relatedEntityIds ?? []).map((targetEntityId) => ({
            type: "relates_to",
            targetEntityId,
          })),
          payload: {
            subject: record.subject,
            startsAt: record.startsAt,
            endsAt: record.endsAt,
            attendees: record.attendees ?? [],
            system: "microsoft365",
          },
          metadata: {
            connectorId: this.id,
            rawRef: record.id,
            labels: ["calendar", "m365"],
          },
        },
      ];
    }

    if (record.kind === "focus_block") {
      return [
        {
          id: `evt-m365-${record.id}`,
          timestamp: record.startsAt ?? this.asOf,
          sourceSystem: "microsoft365",
          entityType: "Signal",
          entityId: "signal-meeting-load",
          eventType: "signal_emitted",
          importance: 75,
          confidence: 82,
          relationships: [
            { type: "affects", targetEntityId: "outcome-efficiency", targetEntityType: "Outcome" },
          ],
          payload: {
            label: record.subject,
            deepWorkMinutes: 90,
            system: "microsoft365",
          },
          metadata: {
            connectorId: this.id,
            rawRef: record.id,
            labels: ["capacity", "deep_work"],
          },
        },
      ];
    }

    return [
      {
        id: `evt-m365-${record.id}`,
        timestamp: this.asOf,
        sourceSystem: "microsoft365",
        entityType: "Signal",
        entityId: record.id,
        eventType: "signal_emitted",
        importance: record.importance ?? 55,
        confidence: 70,
        relationships: [],
        payload: { subject: record.subject, system: "microsoft365" },
        metadata: {
          connectorId: this.id,
          rawRef: record.id,
          labels: ["mail"],
        },
      },
    ];
  }

  protected fetchRaw(_options?: SyncOptions): unknown[] {
    const records: M365Record[] = [
      {
        id: "meeting-helix-security",
        kind: "meeting",
        subject: "Helix security workshop",
        startsAt: "2026-07-21T14:00:00+10:00",
        endsAt: "2026-07-21T15:00:00+10:00",
        attendees: ["person-alex", "person-amelia", "customer-helix"],
        relatedEntityIds: [
          "decision-residency",
          "customer-helix",
          "outcome-enterprise-arr",
        ],
        importance: 92,
      },
      {
        id: "meeting-board-prep",
        kind: "meeting",
        subject: "Board pack working session",
        startsAt: "2026-07-22T09:00:00+10:00",
        endsAt: "2026-07-22T10:30:00+10:00",
        attendees: ["person-alex", "person-priya"],
        relatedEntityIds: ["outcome-board", "decision-board-risk"],
        importance: 85,
      },
      {
        id: "focus-monday",
        kind: "focus_block",
        subject: "Protected morning deep-work block",
        startsAt: "2026-07-20T08:00:00+10:00",
        endsAt: "2026-07-20T09:30:00+10:00",
        importance: 70,
      },
    ];
    return records;
  }
}

export function createMockMicrosoft365Connector(
  asOf?: string,
): MockMicrosoft365Connector {
  return new MockMicrosoft365Connector(asOf);
}
