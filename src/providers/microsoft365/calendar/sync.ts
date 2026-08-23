/** Internal Graph calendar shapes — never exported from provider public API. */
export type GraphCalendarItem = {
  id: string;
  subject?: string;
  start?: { dateTime: string; timeZone: string };
  end?: { dateTime: string; timeZone: string };
  attendees?: Array<{ emailAddress?: { name?: string; address?: string } }>;
  categories?: string[];
  importance?: string;
  isCancelled?: boolean;
};

import type { GraphClient } from "@/providers/microsoft365/graph";
import type { BusinessEvent } from "@/connectors/types";
import type { ExecutiveCommitment } from "@/providers/microsoft365/executive-context/types";

export async function syncCalendarContext(
  client: GraphClient,
  asOf: string,
): Promise<{
  commitments: ExecutiveCommitment[];
  events: BusinessEvent[];
}> {
  const page = await client.delta<GraphCalendarItem>("/me/calendarView");
  const commitments: ExecutiveCommitment[] = [];
  const events: BusinessEvent[] = [];

  for (const item of page.items) {
    if (item.isCancelled) continue;
    const kind = classifyMeeting(item);
    const startsAt = toIso(item.start?.dateTime, asOf);
    const endsAt = toIso(item.end?.dateTime, asOf);
    const stakeholders = (item.attendees ?? [])
      .map((a) => a.emailAddress?.name || a.emailAddress?.address || "")
      .filter(Boolean);

    const commitment: ExecutiveCommitment = {
      id: `commit-${item.id}`,
      title: item.subject ?? "Untitled meeting",
      kind,
      startsAt,
      endsAt,
      stakeholders,
      relatedDecisionIds: inferDecisionLinks(item.subject ?? ""),
      relatedOutcomeIds: inferOutcomeLinks(item.subject ?? ""),
      preparationRisk: preparationRiskFor(kind, item),
      whyItMatters: whyMeetingMatters(kind, item.subject ?? "Meeting"),
    };
    commitments.push(commitment);

    events.push({
      id: `evt-m365-cal-${item.id}`,
      timestamp: startsAt,
      sourceSystem: "microsoft365",
      entityType: "Meeting",
      entityId: item.id,
      eventType: "meeting_scheduled",
      importance: kind === "governance_event" ? 90 : kind === "strategic_coordination" ? 80 : 65,
      confidence: 86,
      relationships: [
        ...commitment.relatedDecisionIds.map((targetEntityId) => ({
          type: "relates_to" as const,
          targetEntityId,
        })),
        ...commitment.relatedOutcomeIds.map((targetEntityId) => ({
          type: "affects" as const,
          targetEntityId,
        })),
      ],
      payload: {
        subject: commitment.title,
        kind: commitment.kind,
        startsAt,
        endsAt,
        attendees: stakeholders,
        preparationRisk: commitment.preparationRisk,
      },
      metadata: {
        connectorId: "provider-microsoft365",
        labels: ["executive-context", "calendar", commitment.kind],
      },
    });
  }

  return { commitments, events };
}

function classifyMeeting(item: GraphCalendarItem): ExecutiveCommitment["kind"] {
  const subject = `${item.subject ?? ""} ${(item.categories ?? []).join(" ")}`;
  if (/board/i.test(subject)) return "governance_event";
  if (/elt|leadership|strategy|executive/i.test(subject)) return "strategic_coordination";
  if (/ops|operating|delivery|reliability/i.test(subject)) return "operational_review";
  if (/customer|helix|renew|account/i.test(subject)) return "customer_engagement";
  if (/focus|deep work/i.test(subject)) return "focus_block";
  return "executive_commitment";
}

function preparationRiskFor(
  kind: ExecutiveCommitment["kind"],
  item: GraphCalendarItem,
): ExecutiveCommitment["preparationRisk"] {
  if (kind === "governance_event") return "high";
  if (item.importance === "high") return "moderate";
  if (kind === "strategic_coordination") return "moderate";
  return "low";
}

function whyMeetingMatters(
  kind: ExecutiveCommitment["kind"],
  title: string,
): string {
  switch (kind) {
    case "governance_event":
      return `"${title}" is a board/governance commitment — preparation quality affects board readiness.`;
    case "strategic_coordination":
      return `"${title}" coordinates leadership on strategic priorities.`;
    case "operational_review":
      return `"${title}" is an operating checkpoint — slippage signals delivery risk.`;
    case "customer_engagement":
      return `"${title}" touches a material customer relationship.`;
    case "focus_block":
      return `"${title}" protects judgement capacity.`;
    default:
      return `"${title}" is an executive commitment on today's calendar.`;
  }
}

function inferDecisionLinks(subject: string): string[] {
  if (/board|strategy|residency|security/i.test(subject)) {
    return ["decision-residency"];
  }
  return [];
}

function inferOutcomeLinks(subject: string): string[] {
  if (/board|arr|growth|cash/i.test(subject)) {
    return ["outcome-enterprise-arr"];
  }
  if (/helix|customer|renew/i.test(subject)) {
    return ["customer-helix"];
  }
  return [];
}

function toIso(value: string | undefined, fallback: string): string {
  if (!value) return fallback;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed.toISOString();
}
