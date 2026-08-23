import type { GraphClient } from "@/providers/microsoft365/graph";
import type { BusinessEvent } from "@/connectors/types";
import type { ExecutiveCollaborationSignal } from "@/providers/microsoft365/executive-context/types";

type GraphChatItem = {
  id: string;
  topic?: string;
  lastMessagePreview?: string;
};

export async function syncTeamsContext(
  client: GraphClient,
  asOf: string,
): Promise<{
  conversations: ExecutiveCollaborationSignal[];
  events: BusinessEvent[];
}> {
  const items = await client.paginate<GraphChatItem>({ path: "/me/chats" }, 1);
  const conversations: ExecutiveCollaborationSignal[] = [];
  const events: BusinessEvent[] = [];

  for (const item of items) {
    const topic = item.topic ?? "Executive collaboration";
    conversations.push({
      id: `collab-${item.id}`,
      topic,
      channel: "teams",
      summary:
        "Collaboration signal indicating active executive coordination — preview redacted.",
      stakeholders: [],
      relatedInitiativeIds: /helix|churn|renew/i.test(topic)
        ? ["initiative-reduce_customer_churn"]
        : [],
      urgency: /risk|urgent|escalat/i.test(topic) ? "high" : "moderate",
    });

    events.push({
      id: `evt-m365-teams-${item.id}`,
      timestamp: asOf,
      sourceSystem: "microsoft365",
      entityType: "Signal",
      entityId: item.id,
      eventType: "signal_emitted",
      importance: 70,
      confidence: 78,
      relationships: [],
      payload: {
        kind: "executive_collaboration",
        topic,
        channel: "teams",
      },
      metadata: {
        connectorId: "provider-microsoft365",
        labels: ["executive-context", "teams"],
      },
    });
  }

  return { conversations, events };
}
