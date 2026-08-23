import type { KnowledgeGraph } from "@/knowledge-graph/memory-graph";
import {
  queryLinkedOutcomes,
  queryLinkedRisks,
  queryNeighborhood,
  queryReachableOutcomes,
} from "@/knowledge-graph/queries";
import { findPaths, traverse } from "@/knowledge-graph/traversal";
import type { GraphEntity, GraphPath } from "@/knowledge-graph/types";

/**
 * Reasoning helpers — graph-grounded organisational inference.
 * Never invent edges; only derive from materialised relationships.
 */
export function outcomesAffectedBy(
  graph: KnowledgeGraph,
  entityId: string,
): GraphEntity[] {
  return uniqueEntities([
    ...queryLinkedOutcomes(graph, entityId).map((hit) => hit.entity),
    ...queryReachableOutcomes(graph, entityId, 3),
  ]);
}

export function risksIncreasedBy(
  graph: KnowledgeGraph,
  entityId: string,
): GraphEntity[] {
  const direct = queryLinkedRisks(graph, entityId)
    .filter(
      (hit) =>
        hit.relationship.type === "increases" ||
        hit.relationship.type === "affects" ||
        hit.relationship.type === "blocks",
    )
    .map((hit) => hit.entity);

  const via = traverse(graph, entityId, {
    maxDepth: 2,
    entityTypes: ["Risk"],
    relationshipTypes: ["increases", "affects", "blocks", "requires"],
    limit: 15,
  });

  return uniqueEntities([...direct, ...via]);
}

export function recommendationsTouching(
  graph: KnowledgeGraph,
  entityId: string,
): GraphEntity[] {
  return traverse(graph, entityId, {
    maxDepth: 2,
    entityTypes: ["Recommendation"],
    limit: 15,
  });
}

export function shortestImpactPath(
  graph: KnowledgeGraph,
  fromId: string,
  toId: string,
): GraphPath | undefined {
  return findPaths(graph, fromId, toId, { maxDepth: 5, limit: 3 })[0];
}

export function impactClosure(
  graph: KnowledgeGraph,
  entityId: string,
): {
  outcomes: GraphEntity[];
  risks: GraphEntity[];
  decisions: GraphEntity[];
  actions: GraphEntity[];
} {
  const neighborhood = queryNeighborhood(graph, entityId);
  return {
    outcomes: uniqueEntities([
      ...neighborhood.outcomes.map((h) => h.entity),
      ...outcomesAffectedBy(graph, entityId),
    ]),
    risks: uniqueEntities([
      ...neighborhood.risks.map((h) => h.entity),
      ...risksIncreasedBy(graph, entityId),
    ]),
    decisions: traverse(graph, entityId, {
      maxDepth: 2,
      entityTypes: ["Decision"],
      limit: 12,
    }),
    actions: traverse(graph, entityId, {
      maxDepth: 2,
      entityTypes: ["Action"],
      limit: 12,
    }),
  };
}

function uniqueEntities(entities: GraphEntity[]): GraphEntity[] {
  const seen = new Set<string>();
  const result: GraphEntity[] = [];
  for (const entity of entities) {
    if (seen.has(entity.id)) continue;
    seen.add(entity.id);
    result.push(entity);
  }
  return result;
}
