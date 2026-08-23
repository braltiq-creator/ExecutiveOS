import type { GraphClient } from "@/providers/microsoft365/graph";
import type { BusinessEvent } from "@/connectors/types";

type GraphPresence = {
  id: string;
  availability?: string;
  activity?: string;
};

export async function syncPresenceContext(
  client: GraphClient,
  asOf: string,
): Promise<{
  availability: string;
  events: BusinessEvent[];
}> {
  const items = await client.paginate<GraphPresence>(
    { path: "/me/presence" },
    1,
  );
  const presence = items[0];
  const availability = presence?.availability ?? "Unknown";

  return {
    availability,
    events: [
      {
        id: `evt-m365-presence-${presence?.id ?? "self"}`,
        timestamp: asOf,
        sourceSystem: "microsoft365",
        entityType: "Signal",
        entityId: "signal-executive-availability",
        eventType: "signal_emitted",
        importance: availability === "Busy" ? 70 : 50,
        confidence: 88,
        relationships: [],
        payload: {
          kind: "executive_availability",
          availability,
          activity: presence?.activity ?? "Unknown",
        },
        metadata: {
          connectorId: "provider-microsoft365",
          labels: ["executive-context", "presence"],
        },
      },
    ],
  };
}
