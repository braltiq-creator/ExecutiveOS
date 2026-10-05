import "server-only";

import type { UdgCanonicalRecord } from "@/data-gateway/contracts/record";
import { isMemoryManufacturingGraph } from "./backend";
import {
  compareManufacturingEvidenceGraphsMemory,
  getManufacturingGraphRelationshipEvidenceMemory,
  listManufacturingGraphEntitiesMemory,
  listManufacturingGraphRelationshipsForEntityMemory,
  listManufacturingGraphRelationshipsMemory,
  materializeManufacturingEvidenceGraphMemory,
  saveManufacturingFactGrainMemory,
} from "./memory-store";
import { manufacturingFactsFromRecords } from "./project";
import { assertUserProvidedProvenance } from "./provenance";
import { MANUFACTURING_GRAPH_PROVENANCE } from "./types";
import type {
  ManufacturingGraphComparison,
  ManufacturingGraphEntity,
  ManufacturingGraphRelationship,
  ManufacturingRelationshipEvidence,
} from "./types";

export type ManufacturingGraphWriteResult = {
  created: boolean;
  factCount: number;
};

export type ManufacturingGraphMaterializeResult = {
  materialized: boolean;
  missingGrain: boolean;
  entityCount: number;
  relationshipCount: number;
};

function requireScope(organisationId: string, snapshotId: string): void {
  if (!organisationId.trim() || !snapshotId.trim()) {
    throw new Error("Manufacturing evidence graph requires organisation and snapshot.");
  }
}

/**
 * Persist the co-occurrence grain for one snapshot.
 * A second call for the same organisation + snapshot does not overwrite it.
 */
export async function saveManufacturingFactGrain(input: {
  organisationId: string;
  snapshotId: string;
  organisationLabel: string | null;
  records: readonly UdgCanonicalRecord[];
}): Promise<ManufacturingGraphWriteResult> {
  requireScope(input.organisationId, input.snapshotId);
  assertUserProvidedProvenance(MANUFACTURING_GRAPH_PROVENANCE);
  const facts = manufacturingFactsFromRecords(input.records);
  const payload = {
    organisationId: input.organisationId.trim(),
    snapshotId: input.snapshotId.trim(),
    organisationLabel: input.organisationLabel,
    facts,
  };

  if (isMemoryManufacturingGraph()) {
    return saveManufacturingFactGrainMemory(payload);
  }

  const durable = await import("./supabase-store");
  return durable.saveManufacturingFactGrainDurable(payload);
}

/**
 * Bind the stored grain to a USER_PROVIDED evidence row and write entities
 * and relationships. Does not modify any other snapshot.
 */
export async function materializeManufacturingEvidenceGraph(input: {
  organisationId: string;
  snapshotId: string;
  evidenceId: string;
}): Promise<ManufacturingGraphMaterializeResult> {
  requireScope(input.organisationId, input.snapshotId);
  if (!input.evidenceId.trim()) {
    throw new Error("Manufacturing evidence graph requires an evidence id.");
  }
  assertUserProvidedProvenance(MANUFACTURING_GRAPH_PROVENANCE);
  const payload = {
    organisationId: input.organisationId.trim(),
    snapshotId: input.snapshotId.trim(),
    evidenceId: input.evidenceId.trim(),
  };

  if (isMemoryManufacturingGraph()) {
    return materializeManufacturingEvidenceGraphMemory(payload);
  }

  const durable = await import("./supabase-store");
  return durable.materializeManufacturingEvidenceGraphDurable(payload);
}

export async function listManufacturingGraphEntities(
  organisationId: string,
  snapshotId: string,
): Promise<ManufacturingGraphEntity[]> {
  requireScope(organisationId, snapshotId);
  if (isMemoryManufacturingGraph()) {
    return listManufacturingGraphEntitiesMemory(organisationId, snapshotId);
  }
  const durable = await import("./supabase-store");
  return durable.listManufacturingGraphEntitiesDurable(organisationId, snapshotId);
}

export async function listManufacturingGraphRelationships(
  organisationId: string,
  snapshotId: string,
): Promise<ManufacturingGraphRelationship[]> {
  requireScope(organisationId, snapshotId);
  if (isMemoryManufacturingGraph()) {
    return listManufacturingGraphRelationshipsMemory(organisationId, snapshotId);
  }
  const durable = await import("./supabase-store");
  return durable.listManufacturingGraphRelationshipsDurable(
    organisationId,
    snapshotId,
  );
}

export async function listManufacturingGraphRelationshipsForEntity(
  organisationId: string,
  snapshotId: string,
  entityId: string,
): Promise<ManufacturingGraphRelationship[]> {
  requireScope(organisationId, snapshotId);
  if (isMemoryManufacturingGraph()) {
    return listManufacturingGraphRelationshipsForEntityMemory(
      organisationId,
      snapshotId,
      entityId,
    );
  }
  const durable = await import("./supabase-store");
  return durable.listManufacturingGraphRelationshipsForEntityDurable(
    organisationId,
    snapshotId,
    entityId,
  );
}

export async function getManufacturingGraphRelationshipEvidence(
  organisationId: string,
  snapshotId: string,
  relationshipId: string,
): Promise<ManufacturingRelationshipEvidence | null> {
  requireScope(organisationId, snapshotId);
  if (isMemoryManufacturingGraph()) {
    return getManufacturingGraphRelationshipEvidenceMemory(
      organisationId,
      snapshotId,
      relationshipId,
    );
  }
  const durable = await import("./supabase-store");
  return durable.getManufacturingGraphRelationshipEvidenceDurable(
    organisationId,
    snapshotId,
    relationshipId,
  );
}

export async function compareManufacturingEvidenceGraphs(input: {
  organisationId: string;
  snapshotId: string;
  previousSnapshotId: string;
}): Promise<ManufacturingGraphComparison> {
  requireScope(input.organisationId, input.snapshotId);
  requireScope(input.organisationId, input.previousSnapshotId);
  if (isMemoryManufacturingGraph()) {
    return compareManufacturingEvidenceGraphsMemory(input);
  }
  const durable = await import("./supabase-store");
  return durable.compareManufacturingEvidenceGraphsDurable(input);
}
