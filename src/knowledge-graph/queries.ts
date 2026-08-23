import type { KnowledgeGraph } from "@/knowledge-graph/memory-graph";
import type {
  EntityNeighborhood,
  GraphEntity,
  NeighborHit,
  RelationshipType,
} from "@/knowledge-graph/types";
import { traverse } from "@/knowledge-graph/traversal";

const DEPENDENCY_RELS: RelationshipType[] = [
  "depends_on",
  "requires",
  "blocks",
];
const AFFECTS_RELS: RelationshipType[] = [
  "affects",
  "increases",
  "reduces",
  "contributes_to",
  "supports",
  "mitigates",
];
const OWNER_RELS: RelationshipType[] = ["owned_by", "approved_by", "delegated_to"];
const EVIDENCE_RELS: RelationshipType[] = [
  "generated_from",
  "derived_from",
  "mentions",
  "relates_to",
];

/**
 * Graph query API — answer organisational questions without inventing edges.
 */
export function queryDependsOn(
  graph: KnowledgeGraph,
  entityId: string,
): NeighborHit[] {
  return graph.neighbors(entityId, {
    direction: "outgoing",
    relationshipTypes: DEPENDENCY_RELS,
  });
}

export function queryAffectedBy(
  graph: KnowledgeGraph,
  entityId: string,
): NeighborHit[] {
  // Things this entity affects (outgoing) + things that list this as dependency impact
  const outgoing = graph.neighbors(entityId, {
    direction: "outgoing",
    relationshipTypes: AFFECTS_RELS,
  });
  const incomingBlocked = graph.neighbors(entityId, {
    direction: "incoming",
    relationshipTypes: ["blocks", "depends_on", "requires"],
  });
  return dedupeHits([...outgoing, ...incomingBlocked]);
}

export function queryOwners(
  graph: KnowledgeGraph,
  entityId: string,
): NeighborHit[] {
  return graph.neighbors(entityId, {
    direction: "outgoing",
    relationshipTypes: OWNER_RELS,
    entityTypes: ["Person", "Team", "Department"],
  });
}

export function queryLinkedOutcomes(
  graph: KnowledgeGraph,
  entityId: string,
): NeighborHit[] {
  // Direct edges only — never invent relationships.
  return graph.neighbors(entityId, {
    direction: "both",
    entityTypes: ["Outcome"],
  });
}

/** Multi-hop Outcome discovery via traversal (no synthetic edges). */
export function queryReachableOutcomes(
  graph: KnowledgeGraph,
  entityId: string,
  maxDepth = 3,
): GraphEntity[] {
  return traverse(graph, entityId, {
    maxDepth,
    entityTypes: ["Outcome"],
    limit: 20,
  });
}

export function queryLinkedRisks(
  graph: KnowledgeGraph,
  entityId: string,
): NeighborHit[] {
  return graph.neighbors(entityId, {
    direction: "both",
    entityTypes: ["Risk"],
  });
}

export function queryRecommendations(
  graph: KnowledgeGraph,
  entityId: string,
): NeighborHit[] {
  return graph.neighbors(entityId, {
    direction: "both",
    entityTypes: ["Recommendation"],
  });
}

export function queryEvidence(
  graph: KnowledgeGraph,
  entityId: string,
): NeighborHit[] {
  return graph.neighbors(entityId, {
    direction: "both",
    relationshipTypes: EVIDENCE_RELS,
    entityTypes: ["Document", "Signal", "Insight", "Metric"],
  });
}

export function queryMeetings(
  graph: KnowledgeGraph,
  entityId: string,
): NeighborHit[] {
  return graph.neighbors(entityId, {
    direction: "both",
    entityTypes: ["Meeting"],
    relationshipTypes: ["mentions", "scheduled_in", "relates_to"],
  });
}

export function queryDocuments(
  graph: KnowledgeGraph,
  entityId: string,
): NeighborHit[] {
  return graph.neighbors(entityId, {
    direction: "both",
    entityTypes: ["Document"],
  });
}

/** Full neighborhood answer pack for any entity. */
export function queryNeighborhood(
  graph: KnowledgeGraph,
  entityId: string,
): EntityNeighborhood {
  return {
    entity: graph.requireEntity(entityId),
    dependsOn: queryDependsOn(graph, entityId),
    affected: queryAffectedBy(graph, entityId),
    owners: queryOwners(graph, entityId),
    outcomes: queryLinkedOutcomes(graph, entityId),
    risks: queryLinkedRisks(graph, entityId),
    recommendations: queryRecommendations(graph, entityId),
    evidence: queryEvidence(graph, entityId),
    meetings: queryMeetings(graph, entityId),
    documents: queryDocuments(graph, entityId),
  };
}

export function queryByType(
  graph: KnowledgeGraph,
  type: GraphEntity["type"],
): GraphEntity[] {
  return graph.listEntities(type);
}

export function querySearch(
  graph: KnowledgeGraph,
  term: string,
): GraphEntity[] {
  const needle = term.trim().toLowerCase();
  if (!needle) return [];
  return graph
    .listEntities()
    .filter(
      (entity) =>
        entity.id.toLowerCase().includes(needle) ||
        entity.label.toLowerCase().includes(needle),
    );
}

function dedupeHits(hits: NeighborHit[]): NeighborHit[] {
  const seen = new Set<string>();
  const result: NeighborHit[] = [];
  for (const hit of hits) {
    const key = `${hit.entity.id}:${hit.relationship.id}:${hit.direction}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(hit);
  }
  return result;
}
