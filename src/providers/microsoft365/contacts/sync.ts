import type { GraphClient } from "@/providers/microsoft365/graph";
import type { BusinessEvent } from "@/connectors/types";
import type { StakeholderRelationship } from "@/providers/microsoft365/executive-context/types";

type GraphPerson = {
  id: string;
  displayName?: string;
  jobTitle?: string | null;
  scoredEmailAddresses?: Array<{ address?: string }>;
};

export async function syncContactsContext(
  client: GraphClient,
  asOf: string,
): Promise<{
  stakeholders: StakeholderRelationship[];
  events: BusinessEvent[];
}> {
  const items = await client.paginate<GraphPerson>({ path: "/me/people" }, 1);
  const stakeholders: StakeholderRelationship[] = [];
  const events: BusinessEvent[] = [];

  for (const item of items) {
    const name = item.displayName ?? "Unknown";
    const relationship = classifyRelationship(name, item.jobTitle ?? "");
    const neglectRisk =
      relationship === "customer" || relationship === "board";

    stakeholders.push({
      id: `stakeholder-${item.id}`,
      name,
      roleHint: item.jobTitle ?? relationship,
      relationship,
      lastTouchAt: asOf,
      neglectRisk,
      relatedEntityIds:
        relationship === "customer" ? ["customer-helix"] : [],
    });

    events.push({
      id: `evt-m365-person-${item.id}`,
      timestamp: asOf,
      sourceSystem: "microsoft365",
      entityType: "Person",
      entityId: item.id,
      eventType: "entity_upserted",
      importance: neglectRisk ? 80 : 55,
      confidence: 84,
      relationships: [],
      payload: {
        name,
        roleHint: item.jobTitle,
        relationship,
      },
      metadata: {
        connectorId: "provider-microsoft365",
        labels: ["executive-context", "stakeholder", relationship],
      },
    });
  }

  return { stakeholders, events };
}

function classifyRelationship(
  name: string,
  title: string,
): StakeholderRelationship["relationship"] {
  const corpus = `${name} ${title}`;
  if (/chair|board/i.test(corpus)) return "board";
  if (/cio|helix|customer|sponsor/i.test(corpus)) return "customer";
  if (/partner/i.test(corpus)) return "partner";
  if (/supplier|vendor/i.test(corpus)) return "supplier";
  if (/coo|cfo|cro|chief|elt/i.test(corpus)) return "executive_team";
  if (/committee/i.test(corpus)) return "committee";
  return "internal";
}
