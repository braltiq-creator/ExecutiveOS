/**
 * Relationship graph enrichment — vendor-free edges for the Knowledge Graph.
 */

import type { KnowledgeGraph } from "@/knowledge-graph";
import type { EntityType } from "@/knowledge-graph/types";
import type { ExecutiveContextBrief } from "@/providers/microsoft365/executive-context/types";

export type RelationshipEnrichmentResult = {
  entitiesUpserted: number;
  relationshipsUpserted: number;
};

/**
 * Enrich KG with people, meetings, board, documents, decisions — no Microsoft types.
 * Missing related entities are created as lightweight stubs so relationships can attach.
 */
export function enrichRelationshipGraph(
  graph: KnowledgeGraph,
  brief: ExecutiveContextBrief,
): RelationshipEnrichmentResult {
  let entitiesUpserted = 0;
  let relationshipsUpserted = 0;

  const ensure = (
    id: string,
    type: EntityType,
    label: string,
    importance = 50,
  ) => {
    if (!graph.getEntity(id)) {
      graph.addEntity({
        id,
        type,
        label,
        properties: { importance, stub: true },
      });
      entitiesUpserted += 1;
    }
  };

  for (const commitment of brief.commitments) {
    ensure(commitment.id, "Meeting", commitment.title, 80);
    entitiesUpserted += 1;
    // Re-add/update label entity (addEntity overwrites map)
    graph.addEntity({
      id: commitment.id,
      type: "Meeting",
      label: commitment.title,
      properties: { kind: commitment.kind, importance: 80 },
    });

    for (const decisionId of commitment.relatedDecisionIds) {
      ensure(decisionId, "Decision", decisionId, 70);
      graph.addRelationship({
        id: `rel-${commitment.id}-${decisionId}`,
        type: "relates_to",
        fromId: commitment.id,
        toId: decisionId,
        weight: 0.8,
      });
      relationshipsUpserted += 1;
    }
    for (const outcomeId of commitment.relatedOutcomeIds) {
      ensure(outcomeId, "Outcome", outcomeId, 70);
      graph.addRelationship({
        id: `rel-${commitment.id}-${outcomeId}`,
        type: "affects",
        fromId: commitment.id,
        toId: outcomeId,
        weight: 0.7,
      });
      relationshipsUpserted += 1;
    }
  }

  for (const person of brief.stakeholders) {
    graph.addEntity({
      id: person.id,
      type: "Person",
      label: person.name,
      properties: {
        relationship: person.relationship,
        neglectRisk: person.neglectRisk,
      },
    });
    entitiesUpserted += 1;
    for (const relatedId of person.relatedEntityIds) {
      ensure(relatedId, "Customer", relatedId, 65);
      graph.addRelationship({
        id: `rel-${person.id}-${relatedId}`,
        type: "relates_to",
        fromId: person.id,
        toId: relatedId,
        weight: 0.6,
      });
      relationshipsUpserted += 1;
    }
  }

  for (const doc of brief.documents) {
    graph.addEntity({
      id: doc.id,
      type: "Document",
      label: doc.title,
      properties: { kind: doc.kind },
    });
    entitiesUpserted += 1;
    for (const decisionId of doc.relatedDecisionIds) {
      ensure(decisionId, "Decision", decisionId, 70);
      graph.addRelationship({
        id: `rel-${doc.id}-${decisionId}`,
        type: "mentions",
        fromId: doc.id,
        toId: decisionId,
        weight: 0.75,
      });
      relationshipsUpserted += 1;
    }
  }

  return { entitiesUpserted, relationshipsUpserted };
}
