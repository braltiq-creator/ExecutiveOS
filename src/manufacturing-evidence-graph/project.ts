import type { UdgCanonicalRecord } from "@/data-gateway/contracts/record";
import {
  dimensionKey,
  entityId,
  measureKey,
  organisationKey,
  relationshipId,
} from "./identity";
import { normalizeLabel, normalizeQuantity, quantityLabel, sortedUnique } from "./normalize";
import { MANUFACTURING_GRAPH_PROVENANCE } from "./types";
import type {
  ManufacturingEntityType,
  ManufacturingFactDraft,
  ManufacturingGraphEntity,
  ManufacturingGraphProjection,
  ManufacturingGraphRelationship,
  ManufacturingRelationshipType,
} from "./types";

/**
 * Keep only the co-occurring manufacturing dimensions required to rebuild
 * relationships. Other canonical fields are left on the snapshot aggregates.
 */
export function manufacturingFactsFromRecords(
  records: readonly UdgCanonicalRecord[],
): ManufacturingFactDraft[] {
  const facts: ManufacturingFactDraft[] = [];

  for (const record of records) {
    const sourceRecordId = record.recordId?.trim() ?? "";
    if (!sourceRecordId) continue;

    const draft: ManufacturingFactDraft = {
      sourceRecordId,
      period: normalizeLabel(record.fields.period) ?? normalizeLabel(record.fields.asOfDate),
      region: normalizeLabel(record.fields.region),
      branch: normalizeLabel(record.fields.branch),
      dealer: normalizeLabel(record.fields.dealer),
      machineModel: normalizeLabel(record.fields.model),
      machineVariant: normalizeLabel(record.fields.variant),
      factory: normalizeLabel(record.fields.factory),
      demandQuantity: normalizeQuantity(record.fields.actualQuantity),
      orderQuantity: normalizeQuantity(record.fields.orderBankQuantity),
      inventoryQuantity: normalizeQuantity(record.fields.finishedGoods),
      capacityQuantity: normalizeQuantity(record.fields.productionCapacity),
      forecastQuantity: normalizeQuantity(record.fields.forecastQuantity),
    };

    if (!factHasManufacturingGrain(draft)) continue;
    facts.push(draft);
  }

  return facts;
}

function factHasManufacturingGrain(fact: ManufacturingFactDraft): boolean {
  return (
    fact.period != null ||
    fact.region != null ||
    fact.branch != null ||
    fact.dealer != null ||
    fact.machineModel != null ||
    fact.machineVariant != null ||
    fact.factory != null ||
    fact.demandQuantity != null ||
    fact.orderQuantity != null ||
    fact.inventoryQuantity != null ||
    fact.capacityQuantity != null ||
    fact.forecastQuantity != null
  );
}

type EntitySeed = {
  entityType: ManufacturingEntityType;
  entityKey: string;
  label: string;
  quantity: number | null;
  sourceRecordId: string | null;
};

/**
 * Project entities and relationships from one snapshot's fact grain.
 *
 * Dimension entities collapse on canonical label within the snapshot.
 * Measure entities stay tied to the source record so equal quantities on
 * unrelated rows do not become one node (that would invent a cross-row join).
 * A relationship is emitted only from fields co-occurring on that same fact.
 */
export function projectManufacturingEvidenceGraph(input: {
  organisationId: string;
  snapshotId: string;
  evidenceId: string;
  organisationLabel?: string | null;
  facts: readonly ManufacturingFactDraft[];
}): ManufacturingGraphProjection {
  const organisationId = input.organisationId.trim();
  const snapshotId = input.snapshotId.trim();
  const evidenceId = input.evidenceId.trim();
  if (!organisationId || !snapshotId || !evidenceId) {
    throw new Error("Manufacturing evidence graph requires organisation, snapshot, and evidence.");
  }

  const entities = new Map<string, ManufacturingGraphEntity>();
  const relationships = new Map<string, ManufacturingGraphRelationship>();

  const addEntity = (seed: EntitySeed): ManufacturingGraphEntity => {
    const id = entityId(organisationId, snapshotId, seed.entityType, seed.entityKey);
    const existing = entities.get(id);
    if (existing) {
      if (seed.sourceRecordId) {
        existing.sourceRecordIds = sortedUnique([
          ...existing.sourceRecordIds,
          seed.sourceRecordId,
        ]);
      }
      return existing;
    }
    const created: ManufacturingGraphEntity = {
      id,
      organisationId,
      snapshotId,
      evidenceId,
      entityType: seed.entityType,
      entityKey: seed.entityKey,
      label: seed.label,
      quantity: seed.quantity,
      provenance: MANUFACTURING_GRAPH_PROVENANCE,
      sourceRecordIds: seed.sourceRecordId ? [seed.sourceRecordId] : [],
    };
    entities.set(id, created);
    return created;
  };

  const addRelationship = (
    relationshipType: ManufacturingRelationshipType,
    from: ManufacturingGraphEntity,
    to: ManufacturingGraphEntity,
    sourceRecordId: string,
  ): void => {
    if (from.id === to.id) return;
    const id = relationshipId(
      organisationId,
      snapshotId,
      relationshipType,
      from.entityType,
      from.entityKey,
      to.entityType,
      to.entityKey,
    );
    const existing = relationships.get(id);
    if (existing) {
      existing.sourceRecordIds = sortedUnique([
        ...existing.sourceRecordIds,
        sourceRecordId,
      ]);
      return;
    }
    relationships.set(id, {
      id,
      organisationId,
      snapshotId,
      evidenceId,
      relationshipType,
      fromEntityId: from.id,
      toEntityId: to.id,
      fromEntityType: from.entityType,
      toEntityType: to.entityType,
      fromEntityKey: from.entityKey,
      toEntityKey: to.entityKey,
      provenance: MANUFACTURING_GRAPH_PROVENANCE,
      sourceRecordIds: [sourceRecordId],
    });
  };

  const label = input.organisationLabel?.trim().replace(/\s+/g, " ") ?? "";
  addEntity({
    entityType: "Organisation",
    entityKey: organisationKey(organisationId),
    label: label.length > 0 ? label : organisationId,
    quantity: null,
    sourceRecordId: null,
  });

  for (const fact of input.facts) {
    const region = fact.region
      ? addEntity({
          entityType: "Region",
          entityKey: dimensionKey(fact.region),
          label: fact.region,
          quantity: null,
          sourceRecordId: fact.sourceRecordId,
        })
      : null;
    const dealer = fact.dealer
      ? addEntity({
          entityType: "Dealer",
          entityKey: dimensionKey(fact.dealer),
          label: fact.dealer,
          quantity: null,
          sourceRecordId: fact.sourceRecordId,
        })
      : null;
    if (fact.branch) {
      addEntity({
        entityType: "Branch",
        entityKey: dimensionKey(fact.branch),
        label: fact.branch,
        quantity: null,
        sourceRecordId: fact.sourceRecordId,
      });
    }
    const model = fact.machineModel
      ? addEntity({
          entityType: "MachineModel",
          entityKey: dimensionKey(fact.machineModel),
          label: fact.machineModel,
          quantity: null,
          sourceRecordId: fact.sourceRecordId,
        })
      : null;
    const variant = fact.machineVariant
      ? addEntity({
          entityType: "MachineVariant",
          entityKey: dimensionKey(fact.machineVariant),
          label: fact.machineVariant,
          quantity: null,
          sourceRecordId: fact.sourceRecordId,
        })
      : null;
    const factory = fact.factory
      ? addEntity({
          entityType: "Factory",
          entityKey: dimensionKey(fact.factory),
          label: fact.factory,
          quantity: null,
          sourceRecordId: fact.sourceRecordId,
        })
      : null;
    const demand =
      fact.demandQuantity == null
        ? null
        : addEntity({
            entityType: "Demand",
            entityKey: measureKey(fact.sourceRecordId),
            label: quantityLabel(fact.demandQuantity),
            quantity: fact.demandQuantity,
            sourceRecordId: fact.sourceRecordId,
          });
    if (fact.orderQuantity != null) {
      addEntity({
        entityType: "Order",
        entityKey: measureKey(fact.sourceRecordId),
        label: quantityLabel(fact.orderQuantity),
        quantity: fact.orderQuantity,
        sourceRecordId: fact.sourceRecordId,
      });
    }
    if (fact.inventoryQuantity != null) {
      addEntity({
        entityType: "Inventory",
        entityKey: measureKey(fact.sourceRecordId),
        label: quantityLabel(fact.inventoryQuantity),
        quantity: fact.inventoryQuantity,
        sourceRecordId: fact.sourceRecordId,
      });
    }
    const capacity =
      fact.capacityQuantity == null
        ? null
        : addEntity({
            entityType: "Capacity",
            entityKey: measureKey(fact.sourceRecordId),
            label: quantityLabel(fact.capacityQuantity),
            quantity: fact.capacityQuantity,
            sourceRecordId: fact.sourceRecordId,
          });
    const forecast =
      fact.forecastQuantity == null
        ? null
        : addEntity({
            entityType: "Forecast",
            entityKey: measureKey(fact.sourceRecordId),
            label: quantityLabel(fact.forecastQuantity),
            quantity: fact.forecastQuantity,
            sourceRecordId: fact.sourceRecordId,
          });

    const recordId = fact.sourceRecordId;
    if (region && dealer) {
      addRelationship("CONTAINS", region, dealer, recordId);
      addRelationship("LOCATED_IN", dealer, region, recordId);
    }
    if (dealer && model) addRelationship("DEMANDS", dealer, model, recordId);
    if (dealer && variant) addRelationship("DEMANDS", dealer, variant, recordId);
    if (region && model) addRelationship("DEMANDS", region, model, recordId);
    if (region && variant) addRelationship("DEMANDS", region, variant, recordId);
    if (model && variant) addRelationship("HAS_VARIANT", model, variant, recordId);
    if (model && factory) addRelationship("PLANNED_AT", model, factory, recordId);
    if (variant && factory) addRelationship("PLANNED_AT", variant, factory, recordId);
    if (factory && capacity) addRelationship("HAS_CAPACITY", factory, capacity, recordId);
    if (demand && model) addRelationship("FOR_MODEL", demand, model, recordId);
    if (demand && region) addRelationship("FOR_REGION", demand, region, recordId);
    if (demand && dealer) addRelationship("THROUGH_DEALER", demand, dealer, recordId);
    if (forecast && model) addRelationship("FOR_MODEL", forecast, model, recordId);
    if (forecast && region) addRelationship("FOR_REGION", forecast, region, recordId);
    if (forecast && capacity) {
      addRelationship("CONSTRAINED_BY", forecast, capacity, recordId);
    }
  }

  return {
    entities: [...entities.values()].sort(compareEntities),
    relationships: [...relationships.values()].sort(compareRelationships),
  };
}

function compareEntities(
  left: ManufacturingGraphEntity,
  right: ManufacturingGraphEntity,
): number {
  return (
    left.entityType.localeCompare(right.entityType) ||
    left.entityKey.localeCompare(right.entityKey)
  );
}

function compareRelationships(
  left: ManufacturingGraphRelationship,
  right: ManufacturingGraphRelationship,
): number {
  return (
    left.relationshipType.localeCompare(right.relationshipType) ||
    left.fromEntityKey.localeCompare(right.fromEntityKey) ||
    left.toEntityKey.localeCompare(right.toEntityKey)
  );
}
