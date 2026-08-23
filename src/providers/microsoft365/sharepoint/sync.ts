import type { GraphClient } from "@/providers/microsoft365/graph";
import type { BusinessEvent } from "@/connectors/types";
import type { StrategicEvidenceDoc } from "@/providers/microsoft365/executive-context/types";

type GraphDriveItem = {
  id: string;
  name?: string;
  lastModifiedDateTime?: string;
};

export async function syncSharePointContext(
  client: GraphClient,
  asOf: string,
): Promise<{
  documents: StrategicEvidenceDoc[];
  events: BusinessEvent[];
}> {
  const items = await client.paginate<GraphDriveItem>(
    { path: "/me/drive/root/children" },
    1,
  );
  return mapDocuments(items, asOf, "sharepoint");
}

export async function syncDocumentsContext(
  client: GraphClient,
  asOf: string,
): Promise<{
  documents: StrategicEvidenceDoc[];
  events: BusinessEvent[];
}> {
  return syncSharePointContext(client, asOf);
}

function mapDocuments(
  items: GraphDriveItem[],
  asOf: string,
  source: string,
): {
  documents: StrategicEvidenceDoc[];
  events: BusinessEvent[];
} {
  const documents: StrategicEvidenceDoc[] = [];
  const events: BusinessEvent[] = [];

  for (const item of items) {
    const title = item.name ?? "Untitled document";
    const kind = /board/i.test(title)
      ? "board_pack"
      : /strategy/i.test(title)
        ? "strategy"
        : /decision|memo/i.test(title)
          ? "decision_memo"
          : "other";

    documents.push({
      id: `doc-${item.id}`,
      title,
      kind,
      whyItMatters:
        kind === "board_pack"
          ? "Board pack is critical evidence for governance readiness."
          : "Strategic document supporting executive decisions.",
      relatedDecisionIds: kind === "board_pack" ? ["decision-residency"] : [],
      relatedOutcomeIds: [],
    });

    events.push({
      id: `evt-m365-doc-${item.id}`,
      timestamp: item.lastModifiedDateTime ?? asOf,
      sourceSystem: "microsoft365",
      entityType: "Document",
      entityId: item.id,
      eventType: "entity_upserted",
      importance: kind === "board_pack" ? 85 : 60,
      confidence: 82,
      relationships: [],
      payload: {
        title,
        kind,
        source,
      },
      metadata: {
        connectorId: "provider-microsoft365",
        labels: ["executive-context", "document", kind],
      },
    });
  }

  return { documents, events };
}
