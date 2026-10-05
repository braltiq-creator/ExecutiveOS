import type {
  ManufacturingGraphComparison,
  ManufacturingGraphEntity,
  ManufacturingGraphRelationship,
} from "./types";

function entityIdentity(entity: ManufacturingGraphEntity): string {
  return `${entity.entityType}\u001f${entity.entityKey}`;
}

function relationshipIdentity(relationship: ManufacturingGraphRelationship): string {
  return [
    relationship.relationshipType,
    relationship.fromEntityType,
    relationship.fromEntityKey,
    relationship.toEntityType,
    relationship.toEntityKey,
  ].join("\u001f");
}

/**
 * Compare two snapshot projections by canonical identity, not by row id.
 * Ids embed snapshot id, so they are not comparable across weeks.
 */
export function compareManufacturingGraphs(input: {
  currentSnapshotId: string;
  previousSnapshotId: string;
  current: {
    entities: ManufacturingGraphEntity[];
    relationships: ManufacturingGraphRelationship[];
  };
  previous: {
    entities: ManufacturingGraphEntity[];
    relationships: ManufacturingGraphRelationship[];
  };
}): ManufacturingGraphComparison {
  const previousEntities = new Map(
    input.previous.entities.map((entity) => [entityIdentity(entity), entity]),
  );
  const currentEntities = new Map(
    input.current.entities.map((entity) => [entityIdentity(entity), entity]),
  );
  const previousRelationships = new Map(
    input.previous.relationships.map((relationship) => [
      relationshipIdentity(relationship),
      relationship,
    ]),
  );
  const currentRelationships = new Map(
    input.current.relationships.map((relationship) => [
      relationshipIdentity(relationship),
      relationship,
    ]),
  );

  const entitiesAdded = [...currentEntities.entries()]
    .filter(([key]) => !previousEntities.has(key))
    .map(([, entity]) => ({
      entityType: entity.entityType,
      entityKey: entity.entityKey,
      label: entity.label,
    }));
  const entitiesRemoved = [...previousEntities.entries()]
    .filter(([key]) => !currentEntities.has(key))
    .map(([, entity]) => ({
      entityType: entity.entityType,
      entityKey: entity.entityKey,
      label: entity.label,
    }));
  const relationshipsAdded = [...currentRelationships.entries()]
    .filter(([key]) => !previousRelationships.has(key))
    .map(([, relationship]) => ({
      relationshipType: relationship.relationshipType,
      fromEntityType: relationship.fromEntityType,
      fromEntityKey: relationship.fromEntityKey,
      toEntityType: relationship.toEntityType,
      toEntityKey: relationship.toEntityKey,
    }));
  const relationshipsRemoved = [...previousRelationships.entries()]
    .filter(([key]) => !currentRelationships.has(key))
    .map(([, relationship]) => ({
      relationshipType: relationship.relationshipType,
      fromEntityType: relationship.fromEntityType,
      fromEntityKey: relationship.fromEntityKey,
      toEntityType: relationship.toEntityType,
      toEntityKey: relationship.toEntityKey,
    }));

  return {
    currentSnapshotId: input.currentSnapshotId,
    previousSnapshotId: input.previousSnapshotId,
    entitiesAdded,
    entitiesRemoved,
    relationshipsAdded,
    relationshipsRemoved,
  };
}
