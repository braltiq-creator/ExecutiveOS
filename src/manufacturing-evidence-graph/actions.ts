"use server";

import { requireStudioActor } from "@/executive-snapshot-studio/server/auth";
import {
  compareManufacturingEvidenceGraphs,
  getManufacturingGraphRelationshipEvidence,
  listManufacturingGraphEntities,
  listManufacturingGraphRelationships,
  listManufacturingGraphRelationshipsForEntity,
} from "./store";
import type {
  ManufacturingGraphComparison,
  ManufacturingGraphEntity,
  ManufacturingGraphRelationship,
  ManufacturingRelationshipEvidence,
} from "./types";

type ReadFailure = {
  ok: false;
  error: string;
  code?: "UNAUTHENTICATED" | "FORBIDDEN";
};

/**
 * Snapshot-scoped reads. Organisation comes from requireStudioActor.
 * A client organisation id is only a hint and is rejected when it disagrees
 * with the authenticated membership.
 */
export async function listManufacturingGraphEntitiesAction(input: {
  organisationId?: string | null;
  snapshotId: string;
}): Promise<{ ok: true; entities: ManufacturingGraphEntity[] } | ReadFailure> {
  const actor = await requireStudioActor(input.organisationId);
  if (!actor.ok) return { ok: false, error: actor.error, code: actor.code };
  try {
    const entities = await listManufacturingGraphEntities(
      actor.organisationId,
      input.snapshotId,
    );
    return { ok: true, entities };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to read manufacturing evidence graph.",
    };
  }
}

export async function listManufacturingGraphRelationshipsAction(input: {
  organisationId?: string | null;
  snapshotId: string;
}): Promise<
  { ok: true; relationships: ManufacturingGraphRelationship[] } | ReadFailure
> {
  const actor = await requireStudioActor(input.organisationId);
  if (!actor.ok) return { ok: false, error: actor.error, code: actor.code };
  try {
    const relationships = await listManufacturingGraphRelationships(
      actor.organisationId,
      input.snapshotId,
    );
    return { ok: true, relationships };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to read manufacturing evidence graph.",
    };
  }
}

export async function listManufacturingGraphRelationshipsForEntityAction(input: {
  organisationId?: string | null;
  snapshotId: string;
  entityId: string;
}): Promise<
  { ok: true; relationships: ManufacturingGraphRelationship[] } | ReadFailure
> {
  const actor = await requireStudioActor(input.organisationId);
  if (!actor.ok) return { ok: false, error: actor.error, code: actor.code };
  try {
    const relationships = await listManufacturingGraphRelationshipsForEntity(
      actor.organisationId,
      input.snapshotId,
      input.entityId,
    );
    return { ok: true, relationships };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to read manufacturing evidence graph.",
    };
  }
}

export async function getManufacturingGraphRelationshipEvidenceAction(input: {
  organisationId?: string | null;
  snapshotId: string;
  relationshipId: string;
}): Promise<
  { ok: true; evidence: ManufacturingRelationshipEvidence | null } | ReadFailure
> {
  const actor = await requireStudioActor(input.organisationId);
  if (!actor.ok) return { ok: false, error: actor.error, code: actor.code };
  try {
    const evidence = await getManufacturingGraphRelationshipEvidence(
      actor.organisationId,
      input.snapshotId,
      input.relationshipId,
    );
    return { ok: true, evidence };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to read manufacturing evidence graph.",
    };
  }
}

export async function compareManufacturingEvidenceGraphsAction(input: {
  organisationId?: string | null;
  snapshotId: string;
  previousSnapshotId: string;
}): Promise<{ ok: true; comparison: ManufacturingGraphComparison } | ReadFailure> {
  const actor = await requireStudioActor(input.organisationId);
  if (!actor.ok) return { ok: false, error: actor.error, code: actor.code };
  try {
    const comparison = await compareManufacturingEvidenceGraphs({
      organisationId: actor.organisationId,
      snapshotId: input.snapshotId,
      previousSnapshotId: input.previousSnapshotId,
    });
    return { ok: true, comparison };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to read manufacturing evidence graph.",
    };
  }
}
