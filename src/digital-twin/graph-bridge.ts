import type {
  CanonicalEntityType,
} from "@/connectors/types";
import type { EntityType, KnowledgeGraph, RelationshipType } from "@/knowledge-graph";
import type { EnterpriseDigitalTwin } from "@/digital-twin/twin";

const ENTITY_MAP: Record<CanonicalEntityType, EntityType> = {
  Outcome: "Outcome",
  Decision: "Decision",
  Risk: "Risk",
  Opportunity: "Opportunity",
  Project: "Project",
  Meeting: "Meeting",
  Action: "Action",
  Document: "Document",
  Person: "Person",
  Team: "Team",
  Customer: "Customer",
  Signal: "Signal",
  Recommendation: "Recommendation",
  Metric: "Metric",
  StrategicInitiative: "StrategicInitiative",
  System: "System",
};

const RELATIONSHIP_ALLOWLIST = new Set<RelationshipType>([
  "supports",
  "blocks",
  "depends_on",
  "owned_by",
  "generated_from",
  "mentions",
  "affects",
  "contributes_to",
  "relates_to",
  "derived_from",
  "requires",
  "duplicates",
  "supersedes",
  "creates",
  "mitigates",
  "increases",
  "reduces",
  "scheduled_in",
  "approved_by",
  "delegated_to",
]);

export type GraphBridgeResult = {
  entitiesUpserted: number;
  relationshipsUpserted: number;
  skippedRelationships: number;
};

/**
 * Project Twin state into the Knowledge Graph.
 * KG remains the relationship foundation; Twin is the operational state.
 */
export function updateKnowledgeGraphFromTwin(
  twin: EnterpriseDigitalTwin,
  graph: KnowledgeGraph,
): GraphBridgeResult {
  const state = twin.getState();
  let entitiesUpserted = 0;
  let relationshipsUpserted = 0;
  let skippedRelationships = 0;

  for (const entity of state.entities) {
    graph.addEntity({
      id: entity.id,
      type: ENTITY_MAP[entity.type] ?? "Signal",
      label: entity.label,
      properties: {
        twinVersion: entity.version,
        importance: entity.importance,
        confidence: entity.confidence,
        status: entity.status ?? null,
        sources: entity.sourceSystems.join(","),
      },
    });
    entitiesUpserted += 1;
  }

  for (const rel of state.relationships) {
    const type = mapRelationship(rel.type);
    if (!type) {
      skippedRelationships += 1;
      continue;
    }
    if (!graph.getEntity(rel.fromId) || !graph.getEntity(rel.toId)) {
      skippedRelationships += 1;
      continue;
    }
    // Idempotent overwrite via new id namespace if already present
    if (graph.getRelationship(rel.id)) {
      relationshipsUpserted += 1;
      continue;
    }
    try {
      graph.addRelationship({
        id: rel.id,
        type,
        fromId: rel.fromId,
        toId: rel.toId,
        weight: rel.weight,
        properties: {
          sourceEventId: rel.sourceEventId,
          sourceSystem: rel.sourceSystem,
        },
      });
      relationshipsUpserted += 1;
    } catch {
      skippedRelationships += 1;
    }
  }

  return { entitiesUpserted, relationshipsUpserted, skippedRelationships };
}

function mapRelationship(type: string): RelationshipType | null {
  if (RELATIONSHIP_ALLOWLIST.has(type as RelationshipType)) {
    return type as RelationshipType;
  }
  return "relates_to";
}
