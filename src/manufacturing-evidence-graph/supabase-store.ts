import "server-only";

import { createClient } from "@/lib/supabase/server";
import { resolveBoundEvidenceId } from "./binding";
import { compareManufacturingGraphs } from "./compare";
import { factId } from "./identity";
import { projectManufacturingEvidenceGraph } from "./project";
import { MANUFACTURING_GRAPH_PROVENANCE } from "./types";
import type {
  ManufacturingFact,
  ManufacturingFactDraft,
  ManufacturingGraphComparison,
  ManufacturingGraphEntity,
  ManufacturingGraphRelationship,
  ManufacturingRelationshipEvidence,
  ManufacturingSnapshotScope,
} from "./types";

const BATCH = 400;

type ScopeRow = {
  organization_id: string;
  snapshot_id: string;
  organisation_label: string | null;
  evidence_id: string | null;
  provenance: string;
};

type FactRow = {
  id: string;
  organization_id: string;
  snapshot_id: string;
  evidence_id: string | null;
  source_record_id: string;
  period: string | null;
  region: string | null;
  branch: string | null;
  dealer: string | null;
  machine_model: string | null;
  machine_variant: string | null;
  factory: string | null;
  demand_quantity: number | string | null;
  order_quantity: number | string | null;
  inventory_quantity: number | string | null;
  capacity_quantity: number | string | null;
  forecast_quantity: number | string | null;
  provenance: string;
};

type EntityRow = {
  id: string;
  organization_id: string;
  snapshot_id: string;
  evidence_id: string;
  entity_type: ManufacturingGraphEntity["entityType"];
  entity_key: string;
  label: string;
  quantity: number | string | null;
  provenance: string;
  source_record_ids: string[] | null;
};

type RelationshipRow = {
  id: string;
  organization_id: string;
  snapshot_id: string;
  evidence_id: string;
  relationship_type: ManufacturingGraphRelationship["relationshipType"];
  from_entity_id: string;
  to_entity_id: string;
  from_entity_type: ManufacturingGraphEntity["entityType"];
  to_entity_type: ManufacturingGraphEntity["entityType"];
  from_entity_key: string;
  to_entity_key: string;
  provenance: string;
  source_record_ids: string[] | null;
};

function asNumber(value: number | string | null): number | null {
  if (value == null) return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function asIds(value: string[] | null): string[] {
  return value ?? [];
}

function mapScope(row: ScopeRow): ManufacturingSnapshotScope {
  return {
    organisationId: row.organization_id,
    snapshotId: row.snapshot_id,
    organisationLabel: row.organisation_label,
    evidenceId: row.evidence_id,
    provenance: MANUFACTURING_GRAPH_PROVENANCE,
  };
}

function mapFact(row: FactRow): ManufacturingFact {
  return {
    id: row.id,
    organisationId: row.organization_id,
    snapshotId: row.snapshot_id,
    evidenceId: row.evidence_id,
    sourceRecordId: row.source_record_id,
    period: row.period,
    region: row.region,
    branch: row.branch,
    dealer: row.dealer,
    machineModel: row.machine_model,
    machineVariant: row.machine_variant,
    factory: row.factory,
    demandQuantity: asNumber(row.demand_quantity),
    orderQuantity: asNumber(row.order_quantity),
    inventoryQuantity: asNumber(row.inventory_quantity),
    capacityQuantity: asNumber(row.capacity_quantity),
    forecastQuantity: asNumber(row.forecast_quantity),
    provenance: MANUFACTURING_GRAPH_PROVENANCE,
  };
}

function mapEntity(row: EntityRow): ManufacturingGraphEntity {
  return {
    id: row.id,
    organisationId: row.organization_id,
    snapshotId: row.snapshot_id,
    evidenceId: row.evidence_id,
    entityType: row.entity_type,
    entityKey: row.entity_key,
    label: row.label,
    quantity: asNumber(row.quantity),
    provenance: MANUFACTURING_GRAPH_PROVENANCE,
    sourceRecordIds: asIds(row.source_record_ids),
  };
}

function mapRelationship(row: RelationshipRow): ManufacturingGraphRelationship {
  return {
    id: row.id,
    organisationId: row.organization_id,
    snapshotId: row.snapshot_id,
    evidenceId: row.evidence_id,
    relationshipType: row.relationship_type,
    fromEntityId: row.from_entity_id,
    toEntityId: row.to_entity_id,
    fromEntityType: row.from_entity_type,
    toEntityType: row.to_entity_type,
    fromEntityKey: row.from_entity_key,
    toEntityKey: row.to_entity_key,
    provenance: MANUFACTURING_GRAPH_PROVENANCE,
    sourceRecordIds: asIds(row.source_record_ids),
  };
}

async function chunks<T>(
  rows: T[],
  write: (batch: T[]) => Promise<void>,
): Promise<void> {
  for (let index = 0; index < rows.length; index += BATCH) {
    await write(rows.slice(index, index + BATCH));
  }
}

export async function saveManufacturingFactGrainDurable(input: {
  organisationId: string;
  snapshotId: string;
  organisationLabel: string | null;
  facts: readonly ManufacturingFactDraft[];
}): Promise<{ created: boolean; factCount: number }> {
  const supabase = await createClient();
  const { data: existing, error: existingError } = await supabase
    .from("manufacturing_snapshot_scopes")
    .select("snapshot_id")
    .eq("organization_id", input.organisationId)
    .eq("snapshot_id", input.snapshotId)
    .maybeSingle();

  if (existingError) {
    throw new Error("Unable to persist manufacturing evidence graph.");
  }
  if (existing) {
    const { count, error: countError } = await supabase
      .from("manufacturing_snapshot_facts")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", input.organisationId)
      .eq("snapshot_id", input.snapshotId);
    if (countError) {
      throw new Error("Unable to persist manufacturing evidence graph.");
    }
    return { created: false, factCount: count ?? 0 };
  }

  const { error: scopeError } = await supabase
    .from("manufacturing_snapshot_scopes")
    .insert({
      organization_id: input.organisationId,
      snapshot_id: input.snapshotId,
      organisation_label: input.organisationLabel?.trim() || null,
      evidence_id: null,
      provenance: MANUFACTURING_GRAPH_PROVENANCE,
    });
  if (scopeError) {
    throw new Error("Unable to persist manufacturing evidence graph.");
  }

  const rows = input.facts.map((fact) => ({
    id: factId(input.organisationId, input.snapshotId, fact.sourceRecordId),
    organization_id: input.organisationId,
    snapshot_id: input.snapshotId,
    evidence_id: null,
    source_record_id: fact.sourceRecordId,
    period: fact.period,
    region: fact.region,
    branch: fact.branch,
    dealer: fact.dealer,
    machine_model: fact.machineModel,
    machine_variant: fact.machineVariant,
    factory: fact.factory,
    demand_quantity: fact.demandQuantity,
    order_quantity: fact.orderQuantity,
    inventory_quantity: fact.inventoryQuantity,
    capacity_quantity: fact.capacityQuantity,
    forecast_quantity: fact.forecastQuantity,
    provenance: MANUFACTURING_GRAPH_PROVENANCE,
  }));

  await chunks(rows, async (batch) => {
    const { error } = await supabase
      .from("manufacturing_snapshot_facts")
      .insert(batch);
    if (error) {
      throw new Error("Unable to persist manufacturing evidence graph.");
    }
  });

  return { created: true, factCount: rows.length };
}

export async function materializeManufacturingEvidenceGraphDurable(input: {
  organisationId: string;
  snapshotId: string;
  evidenceId: string;
}): Promise<{
  materialized: boolean;
  missingGrain: boolean;
  entityCount: number;
  relationshipCount: number;
}> {
  const supabase = await createClient();
  const { data: scopeRow, error: scopeError } = await supabase
    .from("manufacturing_snapshot_scopes")
    .select("organization_id, snapshot_id, organisation_label, evidence_id, provenance")
    .eq("organization_id", input.organisationId)
    .eq("snapshot_id", input.snapshotId)
    .maybeSingle();

  if (scopeError) {
    throw new Error("Unable to persist manufacturing evidence graph.");
  }
  if (!scopeRow) {
    return {
      materialized: false,
      missingGrain: true,
      entityCount: 0,
      relationshipCount: 0,
    };
  }

  const scope = mapScope(scopeRow as ScopeRow);
  const facts = await listFactsDurable(input.organisationId, input.snapshotId);
  // Evidence insert, lineage update, and these graph writes are separate
  // Supabase requests. There is no transaction across them. Safety is
  // reuse of the existing evidence row, ignore-duplicates on deterministic
  // keys, and a binding check before any stamp. A retry fills missing rows.
  // It does not delete or rebuild.
  const evidenceId = resolveBoundEvidenceId(input.evidenceId, [
    scope.evidenceId,
    ...facts.map((fact) => fact.evidenceId),
    ...(await listGraphEvidenceIds(input.organisationId, input.snapshotId)),
  ]);

  const { error: stampScopeError } = await supabase
    .from("manufacturing_snapshot_scopes")
    .update({ evidence_id: evidenceId })
    .eq("organization_id", input.organisationId)
    .eq("snapshot_id", input.snapshotId)
    .is("evidence_id", null);
  if (stampScopeError) {
    throw new Error("Unable to persist manufacturing evidence graph.");
  }
  const { error: stampFactError } = await supabase
    .from("manufacturing_snapshot_facts")
    .update({ evidence_id: evidenceId })
    .eq("organization_id", input.organisationId)
    .eq("snapshot_id", input.snapshotId)
    .is("evidence_id", null);
  if (stampFactError) {
    throw new Error("Unable to persist manufacturing evidence graph.");
  }

  const { data: stampedScope, error: stampedScopeReadError } = await supabase
    .from("manufacturing_snapshot_scopes")
    .select("evidence_id")
    .eq("organization_id", input.organisationId)
    .eq("snapshot_id", input.snapshotId)
    .maybeSingle();
  if (stampedScopeReadError || !stampedScope) {
    throw new Error("Unable to persist manufacturing evidence graph.");
  }
  const stampedFacts = await listFactsDurable(
    input.organisationId,
    input.snapshotId,
  );
  resolveBoundEvidenceId(evidenceId, [
    stampedScope.evidence_id,
    ...stampedFacts.map((fact) => fact.evidenceId),
  ]);
  if (stampedFacts.some((fact) => fact.evidenceId == null)) {
    throw new Error("Unable to persist manufacturing evidence graph.");
  }

  const projection = projectManufacturingEvidenceGraph({
    organisationId: input.organisationId,
    snapshotId: input.snapshotId,
    evidenceId,
    organisationLabel: scope.organisationLabel,
    facts: stampedFacts,
  });

  await chunks(projection.entities, async (batch) => {
    const { error } = await supabase.from("manufacturing_graph_entities").upsert(
      batch.map((entity) => ({
        id: entity.id,
        organization_id: entity.organisationId,
        snapshot_id: entity.snapshotId,
        evidence_id: entity.evidenceId,
        entity_type: entity.entityType,
        entity_key: entity.entityKey,
        label: entity.label,
        quantity: entity.quantity,
        provenance: MANUFACTURING_GRAPH_PROVENANCE,
        source_record_ids: entity.sourceRecordIds,
      })),
      {
        onConflict: "organization_id,snapshot_id,entity_type,entity_key",
        ignoreDuplicates: true,
      },
    );
    if (error) {
      throw new Error("Unable to persist manufacturing evidence graph.");
    }
  });

  await chunks(projection.relationships, async (batch) => {
    const { error } = await supabase
      .from("manufacturing_graph_relationships")
      .upsert(
        batch.map((relationship) => ({
          id: relationship.id,
          organization_id: relationship.organisationId,
          snapshot_id: relationship.snapshotId,
          evidence_id: relationship.evidenceId,
          relationship_type: relationship.relationshipType,
          from_entity_id: relationship.fromEntityId,
          to_entity_id: relationship.toEntityId,
          from_entity_type: relationship.fromEntityType,
          to_entity_type: relationship.toEntityType,
          from_entity_key: relationship.fromEntityKey,
          to_entity_key: relationship.toEntityKey,
          provenance: MANUFACTURING_GRAPH_PROVENANCE,
          source_record_ids: relationship.sourceRecordIds,
        })),
        {
          onConflict:
            "organization_id,snapshot_id,relationship_type,from_entity_id,to_entity_id",
          ignoreDuplicates: true,
        },
      );
    if (error) {
      throw new Error("Unable to persist manufacturing evidence graph.");
    }
  });

  resolveBoundEvidenceId(evidenceId, [
    ...(await listGraphEvidenceIds(input.organisationId, input.snapshotId)),
  ]);

  return {
    materialized: true,
    missingGrain: false,
    entityCount: projection.entities.length,
    relationshipCount: projection.relationships.length,
  };
}

export async function listManufacturingGraphEntitiesDurable(
  organisationId: string,
  snapshotId: string,
): Promise<ManufacturingGraphEntity[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("manufacturing_graph_entities")
    .select(
      "id, organization_id, snapshot_id, evidence_id, entity_type, entity_key, label, quantity, provenance, source_record_ids",
    )
    .eq("organization_id", organisationId)
    .eq("snapshot_id", snapshotId);
  if (error) throw new Error("Unable to read manufacturing evidence graph.");
  return (data as EntityRow[]).map(mapEntity);
}

export async function listManufacturingGraphRelationshipsDurable(
  organisationId: string,
  snapshotId: string,
): Promise<ManufacturingGraphRelationship[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("manufacturing_graph_relationships")
    .select(
      "id, organization_id, snapshot_id, evidence_id, relationship_type, from_entity_id, to_entity_id, from_entity_type, to_entity_type, from_entity_key, to_entity_key, provenance, source_record_ids",
    )
    .eq("organization_id", organisationId)
    .eq("snapshot_id", snapshotId);
  if (error) throw new Error("Unable to read manufacturing evidence graph.");
  return (data as RelationshipRow[]).map(mapRelationship);
}

export async function listManufacturingGraphRelationshipsForEntityDurable(
  organisationId: string,
  snapshotId: string,
  entityId: string,
): Promise<ManufacturingGraphRelationship[]> {
  const relationships = await listManufacturingGraphRelationshipsDurable(
    organisationId,
    snapshotId,
  );
  return relationships.filter(
    (relationship) =>
      relationship.fromEntityId === entityId ||
      relationship.toEntityId === entityId,
  );
}

export async function getManufacturingGraphRelationshipEvidenceDurable(
  organisationId: string,
  snapshotId: string,
  relationshipId: string,
): Promise<ManufacturingRelationshipEvidence | null> {
  const relationships = await listManufacturingGraphRelationshipsDurable(
    organisationId,
    snapshotId,
  );
  const relationship = relationships.find((item) => item.id === relationshipId);
  if (!relationship) return null;
  const facts = await listFactsDurable(organisationId, snapshotId);
  return {
    relationship,
    evidenceId: relationship.evidenceId,
    provenance: relationship.provenance,
    sourceRecordIds: relationship.sourceRecordIds,
    supportingFacts: facts.filter((fact) =>
      relationship.sourceRecordIds.includes(fact.sourceRecordId),
    ),
  };
}

export async function compareManufacturingEvidenceGraphsDurable(input: {
  organisationId: string;
  snapshotId: string;
  previousSnapshotId: string;
}): Promise<ManufacturingGraphComparison> {
  const [currentEntities, currentRelationships, previousEntities, previousRelationships] =
    await Promise.all([
      listManufacturingGraphEntitiesDurable(input.organisationId, input.snapshotId),
      listManufacturingGraphRelationshipsDurable(
        input.organisationId,
        input.snapshotId,
      ),
      listManufacturingGraphEntitiesDurable(
        input.organisationId,
        input.previousSnapshotId,
      ),
      listManufacturingGraphRelationshipsDurable(
        input.organisationId,
        input.previousSnapshotId,
      ),
    ]);

  return compareManufacturingGraphs({
    currentSnapshotId: input.snapshotId,
    previousSnapshotId: input.previousSnapshotId,
    current: {
      entities: currentEntities,
      relationships: currentRelationships,
    },
    previous: {
      entities: previousEntities,
      relationships: previousRelationships,
    },
  });
}

async function listGraphEvidenceIds(
  organisationId: string,
  snapshotId: string,
): Promise<Array<string | null>> {
  const supabase = await createClient();
  const [entities, relationships] = await Promise.all([
    supabase
      .from("manufacturing_graph_entities")
      .select("evidence_id")
      .eq("organization_id", organisationId)
      .eq("snapshot_id", snapshotId),
    supabase
      .from("manufacturing_graph_relationships")
      .select("evidence_id")
      .eq("organization_id", organisationId)
      .eq("snapshot_id", snapshotId),
  ]);
  if (entities.error || relationships.error) {
    throw new Error("Unable to persist manufacturing evidence graph.");
  }
  return [
    ...((entities.data ?? []) as Array<{ evidence_id: string | null }>),
    ...((relationships.data ?? []) as Array<{ evidence_id: string | null }>),
  ].map((row) => row.evidence_id);
}

async function listFactsDurable(
  organisationId: string,
  snapshotId: string,
): Promise<ManufacturingFact[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("manufacturing_snapshot_facts")
    .select(
      "id, organization_id, snapshot_id, evidence_id, source_record_id, period, region, branch, dealer, machine_model, machine_variant, factory, demand_quantity, order_quantity, inventory_quantity, capacity_quantity, forecast_quantity, provenance",
    )
    .eq("organization_id", organisationId)
    .eq("snapshot_id", snapshotId);
  if (error) throw new Error("Unable to read manufacturing evidence graph.");
  return (data as FactRow[]).map(mapFact);
}
