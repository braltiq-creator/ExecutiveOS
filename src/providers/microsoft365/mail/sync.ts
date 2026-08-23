import type { GraphClient } from "@/providers/microsoft365/graph";
import type { BusinessEvent } from "@/connectors/types";
import type { ExecutiveCommunicationSignal } from "@/providers/microsoft365/executive-context/types";

type GraphMailItem = {
  id: string;
  subject?: string;
  from?: { emailAddress?: { name?: string; address?: string } };
  receivedDateTime?: string;
  bodyPreview?: string;
  importance?: string;
  isRead?: boolean;
};

export async function syncMailContext(
  client: GraphClient,
  asOf: string,
): Promise<{
  communications: ExecutiveCommunicationSignal[];
  events: BusinessEvent[];
}> {
  const items = await client.paginate<GraphMailItem>({ path: "/me/messages" }, 1);
  const communications: ExecutiveCommunicationSignal[] = [];
  const events: BusinessEvent[] = [];

  for (const item of items) {
    const attention =
      item.importance === "high" || !item.isRead ? "critical" : "attention";
    const subject = item.subject ?? "Untitled message";
    const from =
      item.from?.emailAddress?.name ||
      item.from?.emailAddress?.address ||
      "Unknown";

    communications.push({
      id: `comm-${item.id}`,
      subject,
      from,
      receivedAt: item.receivedDateTime ?? asOf,
      attention: attention === "critical" ? "critical" : "attention",
      whyItMatters: /board/i.test(subject)
        ? "Board-related communication requiring executive attention before the meeting."
        : "Executive communication signal — attention required without exposing mail body.",
      relatedDecisionIds: /board|strategy|residency/i.test(subject)
        ? ["decision-residency"]
        : [],
    });

    events.push({
      id: `evt-m365-mail-${item.id}`,
      timestamp: item.receivedDateTime ?? asOf,
      sourceSystem: "microsoft365",
      entityType: "Signal",
      entityId: `mail-signal-${item.id}`,
      eventType: "signal_emitted",
      importance: attention === "critical" ? 75 : 55,
      confidence: 80,
      relationships: [],
      payload: {
        kind: "executive_communication",
        subject,
        from,
        attention,
        // Never include bodyPreview in BusinessEvent payload for security
      },
      metadata: {
        connectorId: "provider-microsoft365",
        labels: ["executive-context", "mail"],
      },
    });
  }

  return { communications, events };
}
