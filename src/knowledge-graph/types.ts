/**
 * Executive Knowledge Graph — organisational relationship model.
 * Pure TypeScript. No UI. Future-ready for Neo4j.
 */

export const ENTITY_TYPES = [
  "Outcome",
  "Decision",
  "Risk",
  "Opportunity",
  "Project",
  "Objective",
  "Meeting",
  "Action",
  "Document",
  "Person",
  "Team",
  "Department",
  "Customer",
  "Supplier",
  "System",
  "Signal",
  "Insight",
  "Recommendation",
  "Metric",
  "Policy",
  "StrategicInitiative",
] as const;

export type EntityType = (typeof ENTITY_TYPES)[number];

export const RELATIONSHIP_TYPES = [
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
] as const;

export type RelationshipType = (typeof RELATIONSHIP_TYPES)[number];

export type GraphEntity = {
  id: string;
  type: EntityType;
  label: string;
  /** Free-form attributes — never used as UI state */
  properties?: Record<string, string | number | boolean | null>;
};

export type GraphRelationship = {
  id: string;
  type: RelationshipType;
  fromId: string;
  toId: string;
  /** Optional strength 0–1 for weighted traversals */
  weight?: number;
  properties?: Record<string, string | number | boolean | null>;
};

export type GraphPathStep = {
  entity: GraphEntity;
  via?: {
    relationship: GraphRelationship;
    direction: "outgoing" | "incoming";
  };
};

/** Ordered walk through the organisation. */
export type GraphPath = {
  steps: GraphPathStep[];
  /** Human-readable relationship chain */
  summary: string;
};

export type NeighborHit = {
  entity: GraphEntity;
  relationship: GraphRelationship;
  direction: "outgoing" | "incoming";
};

export type EntityNeighborhood = {
  entity: GraphEntity;
  dependsOn: NeighborHit[];
  affected: NeighborHit[];
  owners: NeighborHit[];
  outcomes: NeighborHit[];
  risks: NeighborHit[];
  recommendations: NeighborHit[];
  evidence: NeighborHit[];
  meetings: NeighborHit[];
  documents: NeighborHit[];
};

export type GraphExplainability = {
  subjectId: string;
  question: string;
  paths: GraphPath[];
  /** Never invent — only materialised relationship chains */
  narrative: string;
  systems: string[];
};

/** Portable snapshot for persistence / Neo4j import. */
export type GraphSnapshot = {
  entities: GraphEntity[];
  relationships: GraphRelationship[];
  asOf: string;
  source: string;
};

export type TraversalOptions = {
  maxDepth?: number;
  relationshipTypes?: RelationshipType[];
  entityTypes?: EntityType[];
  direction?: "outgoing" | "incoming" | "both";
  limit?: number;
};
