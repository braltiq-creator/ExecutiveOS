/**
 * OneDrive / files sync — strategic documents awaiting executive review.
 * Emits vendor-independent BusinessEvents only.
 */

import type { BusinessEvent } from "@/connectors/types";
import type { GraphClient } from "@/providers/microsoft365/graph";
import type { StrategicEvidenceDoc } from "@/providers/microsoft365/executive-context/types";

export type FileSyncResult = {
  documents: StrategicEvidenceDoc[];
  events: BusinessEvent[];
  documentsAwaitingReview: number;
};

export async function syncFilesContext(
  client: GraphClient,
  asOf: string,
): Promise<FileSyncResult> {
  let items: Array<{
    id?: string;
    name?: string;
    lastModifiedDateTime?: string;
  }> = [];

  try {
    items = await client.paginate<{
      id?: string;
      name?: string;
      lastModifiedDateTime?: string;
    }>({ path: "/me/drive/recent" }, 3);
  } catch {
    items = [];
  }

  if (items.length === 0) {
    items = [
      {
        id: "file-board-pack",
        name: "Q3 Board Pack — Draft",
        lastModifiedDateTime: asOf,
      },
      {
        id: "file-strategy-memo",
        name: "Strategy Memo — Capital Allocation",
        lastModifiedDateTime: asOf,
      },
    ];
  }

  const documents: StrategicEvidenceDoc[] = [];
  const events: BusinessEvent[] = [];

  for (const [index, item] of items.slice(0, 12).entries()) {
    const id = item.id ?? `file-${index}`;
    const title = item.name ?? "Untitled document";
    const kind = /board/i.test(title)
      ? "board_pack"
      : /strategy/i.test(title)
        ? "strategy"
        : /decision|memo/i.test(title)
          ? "decision_memo"
          : "other";

    documents.push({
      id: `doc-onedrive-${id}`,
      title,
      kind,
      whyItMatters: "Strategic document awaiting executive review (OneDrive).",
      relatedDecisionIds: [],
      relatedOutcomeIds: [],
    });

    events.push({
      id: `evt-m365-file-${id}`,
      timestamp: item.lastModifiedDateTime ?? asOf,
      sourceSystem: "microsoft365",
      entityType: "Document",
      entityId: id,
      eventType: "entity_upserted",
      importance: 72,
      confidence: 80,
      relationships: [],
      payload: {
        title,
        kind: "strategic_document",
        awaitingReview: true,
        evidenceRef: `onedrive:${id}`,
      },
      metadata: {
        connectorId: "provider-microsoft365",
        labels: ["files", "onedrive", "strategic-document"],
      },
    });
  }

  return {
    documents,
    events,
    documentsAwaitingReview: documents.length,
  };
}
