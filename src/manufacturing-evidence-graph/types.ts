/**
 * Manufacturing Evidence Graph — snapshot-scoped relationship layer.
 * Distinct from the executive knowledge graph and from ManufacturingAnalysis aggregates.
 */

export const MANUFACTURING_GRAPH_PROVENANCE = "USER_PROVIDED" as const;

export type ManufacturingGraphProvenance = typeof MANUFACTURING_GRAPH_PROVENANCE;

export const MANUFACTURING_ENTITY_TYPES = [
  "Organisation",
  "Region",
  "Dealer",
  "Branch",
  "MachineModel",
  "MachineVariant",
  "Factory",
  "Demand",
  "Order",
  "Inventory",
  "Capacity",
  "Forecast",
] as const;

export type ManufacturingEntityType = (typeof MANUFACTURING_ENTITY_TYPES)[number];

export const MANUFACTURING_RELATIONSHIP_TYPES = [
  "CONTAINS",
  "LOCATED_IN",
  "DEMANDS",
  "HAS_VARIANT",
  "PLANNED_AT",
  "HAS_CAPACITY",
  "FOR_MODEL",
  "FOR_REGION",
  "THROUGH_DEALER",
  "CONSTRAINED_BY",
] as const;

export type ManufacturingRelationshipType =
  (typeof MANUFACTURING_RELATIONSHIP_TYPES)[number];

/** Row grain kept so co-occurrence can be replayed. Absent fields stay null. */
export type ManufacturingFactDraft = {
  sourceRecordId: string;
  period: string | null;
  region: string | null;
  branch: string | null;
  dealer: string | null;
  machineModel: string | null;
  machineVariant: string | null;
  factory: string | null;
  demandQuantity: number | null;
  orderQuantity: number | null;
  inventoryQuantity: number | null;
  capacityQuantity: number | null;
  forecastQuantity: number | null;
};

export type ManufacturingFact = ManufacturingFactDraft & {
  id: string;
  organisationId: string;
  snapshotId: string;
  evidenceId: string | null;
  provenance: ManufacturingGraphProvenance;
};

export type ManufacturingSnapshotScope = {
  organisationId: string;
  snapshotId: string;
  organisationLabel: string | null;
  evidenceId: string | null;
  provenance: ManufacturingGraphProvenance;
};

export type ManufacturingGraphEntity = {
  id: string;
  organisationId: string;
  snapshotId: string;
  evidenceId: string;
  entityType: ManufacturingEntityType;
  entityKey: string;
  label: string;
  quantity: number | null;
  provenance: ManufacturingGraphProvenance;
  sourceRecordIds: string[];
};

export type ManufacturingGraphRelationship = {
  id: string;
  organisationId: string;
  snapshotId: string;
  evidenceId: string;
  relationshipType: ManufacturingRelationshipType;
  fromEntityId: string;
  toEntityId: string;
  fromEntityType: ManufacturingEntityType;
  toEntityType: ManufacturingEntityType;
  fromEntityKey: string;
  toEntityKey: string;
  provenance: ManufacturingGraphProvenance;
  sourceRecordIds: string[];
};

export type ManufacturingGraphProjection = {
  entities: ManufacturingGraphEntity[];
  relationships: ManufacturingGraphRelationship[];
};

export type ManufacturingGraphComparison = {
  currentSnapshotId: string;
  previousSnapshotId: string;
  entitiesAdded: Array<
    Pick<ManufacturingGraphEntity, "entityType" | "entityKey" | "label">
  >;
  entitiesRemoved: Array<
    Pick<ManufacturingGraphEntity, "entityType" | "entityKey" | "label">
  >;
  relationshipsAdded: Array<
    Pick<
      ManufacturingGraphRelationship,
      "relationshipType" | "fromEntityType" | "fromEntityKey" | "toEntityType" | "toEntityKey"
    >
  >;
  relationshipsRemoved: Array<
    Pick<
      ManufacturingGraphRelationship,
      "relationshipType" | "fromEntityType" | "fromEntityKey" | "toEntityType" | "toEntityKey"
    >
  >;
};

export type ManufacturingRelationshipEvidence = {
  relationship: ManufacturingGraphRelationship;
  evidenceId: string;
  provenance: ManufacturingGraphProvenance;
  sourceRecordIds: string[];
  supportingFacts: ManufacturingFact[];
};
