/**
 * Executive Knowledge Graph (EKG)
 *
 * Permanent organisational relationship foundation beneath the
 * Executive Intelligence Engine. Pure TypeScript. No UI.
 */

export type * from "@/knowledge-graph/types";
export { ENTITY_TYPES, RELATIONSHIP_TYPES } from "@/knowledge-graph/types";

export { KnowledgeGraph } from "@/knowledge-graph/memory-graph";
export { GraphBuilder } from "@/knowledge-graph/graph-builder";
export type { KnowledgeGraphProvider } from "@/knowledge-graph/provider";

export {
  traverse,
  findPaths,
  summarisePath,
} from "@/knowledge-graph/traversal";

export {
  queryDependsOn,
  queryAffectedBy,
  queryOwners,
  queryLinkedOutcomes,
  queryReachableOutcomes,
  queryLinkedRisks,
  queryRecommendations,
  queryEvidence,
  queryMeetings,
  queryDocuments,
  queryNeighborhood,
  queryByType,
  querySearch,
} from "@/knowledge-graph/queries";

export {
  outcomesAffectedBy,
  risksIncreasedBy,
  recommendationsTouching,
  shortestImpactPath,
  impactClosure,
} from "@/knowledge-graph/reasoning";

export {
  explainEntity,
  explainRecommendation,
  explainBetween,
  formatExplainability,
  graphPathsForEntity,
  ownersOf,
  evidenceFor,
  outcomeLabelsAffected,
  riskLabelsIncreased,
} from "@/knowledge-graph/explainability";

export { buildNorthlineKnowledgeGraph } from "@/knowledge-graph/mock/northline-graph";
export { createMockKnowledgeGraphProvider } from "@/knowledge-graph/mock/mock-graph-provider";

import { createMockKnowledgeGraphProvider } from "@/knowledge-graph/mock/mock-graph-provider";
import type { KnowledgeGraph } from "@/knowledge-graph/memory-graph";
import type { KnowledgeGraphProvider } from "@/knowledge-graph/provider";

/** Default singleton-style accessor for app wiring. */
let defaultProvider: KnowledgeGraphProvider | null = null;

export function getKnowledgeGraphProvider(): KnowledgeGraphProvider {
  if (!defaultProvider) {
    defaultProvider = createMockKnowledgeGraphProvider();
  }
  return defaultProvider;
}

export function setKnowledgeGraphProvider(
  provider: KnowledgeGraphProvider,
): void {
  defaultProvider = provider;
}

export function getKnowledgeGraph(): KnowledgeGraph {
  return getKnowledgeGraphProvider().getGraph();
}
