/**
 * Knowledge Graph health assessment.
 */

import type { KnowledgeGraph } from "@/knowledge-graph";
import type { KnowledgeGraphHealth } from "@/validation/types";

export function assessKnowledgeGraphHealth(input: {
  tenantId: string;
  asOf: string;
  graph?: KnowledgeGraph;
  previousEntityCount?: number;
}): KnowledgeGraphHealth {
  const entities = input.graph?.listEntities() ?? [];
  const relationships = input.graph?.listRelationships() ?? [];

  const entityCount = entities.length;
  const relationshipCount = relationships.length;
  const growth = Math.max(
    0,
    entityCount - (input.previousEntityCount ?? Math.max(0, entityCount - 8)),
  );

  const labels = entities.map((e) => e.label.toLowerCase().trim());
  const duplicateEntities = labels.length - new Set(labels).size;
  const missingRelationships = Math.max(
    0,
    Math.round(entityCount * 0.8 - relationshipCount),
  );
  const conflictingEvidence = entities.filter(
    (e) => e.properties?.conflict === true,
  ).length;

  const freshnessHours = Number(
    entities[0]?.properties?.freshnessHours ?? 6,
  );

  const confidence = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        (entityCount > 0 ? 40 : 0) +
          Math.min(30, relationshipCount) +
          Math.min(20, growth * 2) -
          duplicateEntities * 5 -
          conflictingEvidence * 8 -
          Math.min(15, freshnessHours / 4),
      ),
    ),
  );

  const gaps: string[] = [];
  if (missingRelationships > 0) {
    gaps.push(`${missingRelationships} likely missing relationships`);
  }
  if (duplicateEntities > 0) {
    gaps.push(`${duplicateEntities} possible duplicate entities`);
  }
  if (conflictingEvidence > 0) {
    gaps.push(`${conflictingEvidence} conflicting evidence markers`);
  }
  if (freshnessHours > 24) {
    gaps.push("Evidence older than 24 hours");
  }

  return {
    tenantId: input.tenantId,
    asOf: input.asOf,
    entities: entityCount,
    relationships: relationshipCount,
    growth,
    confidence,
    missingRelationships,
    duplicateEntities,
    conflictingEvidence,
    evidenceFreshnessHours: freshnessHours,
    explanation:
      entityCount === 0
        ? "Knowledge Graph is empty — run discovery to bootstrap."
        : `Graph holds ${entityCount} entities and ${relationshipCount} relationships with ${confidence}% health.`,
    gaps,
  };
}
