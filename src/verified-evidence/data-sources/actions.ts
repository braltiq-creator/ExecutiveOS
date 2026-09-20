/**
 * Snapshot Studio server actions — durable weekly Data Source / Evidence.
 * Organisation always derived from requireStudioActor (never client authority).
 */

"use server";

import type { UdgMappingDefinition } from "@/data-gateway/contracts/mapping";
import { requireStudioActor } from "@/executive-snapshot-studio/server/auth";
import type { StudioBusinessProfileId } from "@/executive-snapshot-studio/types";
import { getPilotPersistence } from "@/pilot-persistence";
import { computeFreshness, freshnessExecutiveCopy } from "./freshness";
import {
  defaultCadenceForLogicalSource,
  logicalDataSourceNameForProfile,
} from "./logical-source";
import { resolveMappingForSource } from "./resolve";
import { useMemoryWeeklyIngestion } from "./backend";
import {
  attachImmutableSnapshot,
  createDataSource,
  findDataSourceByName,
  getDataSource,
  persistDataSourceMapping,
  receiveWeeklyUpload,
  setDataSourceCadence,
} from "./store";
import {
  attachSnapshotLineageDurable,
  ensureDataSourceDurable,
  findDataSourceByNameDurable,
  getDataSourceByIdDurable,
  persistMappingDurable,
  recordUserProvidedEvidenceDurable,
} from "./supabase-store";
import type {
  EvidenceCompareResult,
  OrganizationDataSource,
  SchemaChangeReport,
} from "./types";

export type WeeklyResolveResult =
  | {
      ok: true;
      source: OrganizationDataSource;
      created: boolean;
      logicalName: string;
      schema: SchemaChangeReport;
      mapping: UdgMappingDefinition | null;
      mappingReused: boolean;
      freshness: ReturnType<typeof computeFreshness>;
      freshnessCopy: string;
      requiresSchemaConfirmation: boolean;
    }
  | { ok: false; error: string; code?: "UNAUTHENTICATED" | "FORBIDDEN" };

export type WeeklyPersistMappingResult =
  | { ok: true; source: OrganizationDataSource }
  | { ok: false; error: string; code?: "UNAUTHENTICATED" | "FORBIDDEN" };

export type WeeklyFinalizeResult =
  | {
      ok: true;
      source: OrganizationDataSource;
      evidenceId: string;
      lineage: {
        previousSnapshotId: string | null;
        currentSnapshotId: string;
      };
      compare: EvidenceCompareResult;
      mappingReused: boolean;
    }
  | { ok: false; error: string; code?: "UNAUTHENTICATED" | "FORBIDDEN" };

/**
 * Resolve or create the logical Data Source for this Studio profile + headers.
 */
export async function resolveStudioWeeklySourceAction(input: {
  organisationId?: string;
  profileId: StudioBusinessProfileId | string;
  headers: string[];
}): Promise<WeeklyResolveResult> {
  const actor = await requireStudioActor(input.organisationId);
  if (!actor.ok) {
    return { ok: false, error: actor.error, code: actor.code };
  }

  try {
    const logicalName = logicalDataSourceNameForProfile(input.profileId);
    const cadence = defaultCadenceForLogicalSource(logicalName);
    const memory = useMemoryWeeklyIngestion();

    let source: OrganizationDataSource;
    let created: boolean;

    if (memory) {
      const existing = findDataSourceByName(actor.organisationId, logicalName);
      source = createDataSource({
        organizationId: actor.organisationId,
        name: logicalName,
        provider: null,
        expectedCadence: cadence,
        createdBy: actor.userId,
        connectionId: null,
      });
      created = !existing;
      if (cadence && !source.expectedCadence) {
        source = setDataSourceCadence(source.id, cadence);
      }
    } else {
      const ensured = await ensureDataSourceDurable({
        organizationId: actor.organisationId,
        name: logicalName,
        expectedCadence: cadence,
        createdBy: actor.userId,
      });
      source = ensured.source;
      created = ensured.created;
    }

    if (source.connectionId) {
      return {
        ok: false,
        error: "USER_UPLOAD data sources must not require a Connection.",
      };
    }

    const resolved = resolveMappingForSource(source, input.headers);
    const freshness = computeFreshness(source);
    return {
      ok: true,
      source,
      created,
      logicalName,
      schema: resolved.schema,
      mapping: resolved.mapping,
      mappingReused: resolved.reuse,
      freshness,
      freshnessCopy: freshnessExecutiveCopy(freshness, source.name),
      requiresSchemaConfirmation: resolved.schema.requiresConfirmation,
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Unable to resolve data source.",
    };
  }
}

/** Persist confirmed mapping onto the durable Data Source. */
export async function persistStudioWeeklyMappingAction(input: {
  organisationId?: string;
  dataSourceId: string;
  mapping: UdgMappingDefinition;
  headers: string[];
  confirmSchemaChange?: boolean;
}): Promise<WeeklyPersistMappingResult> {
  const actor = await requireStudioActor(input.organisationId);
  if (!actor.ok) {
    return { ok: false, error: actor.error, code: actor.code };
  }

  try {
    const memory = useMemoryWeeklyIngestion();
    let source: OrganizationDataSource | undefined | null;

    if (memory) {
      source = getDataSource(input.dataSourceId);
      if (!source || source.organizationId !== actor.organisationId) {
        return { ok: false, error: "Data source not found." };
      }
      const resolved = resolveMappingForSource(source, input.headers);
      if (resolved.schema.requiresConfirmation && !input.confirmSchemaChange) {
        return { ok: false, error: resolved.schema.message };
      }
      source = persistDataSourceMapping(
        input.dataSourceId,
        input.mapping,
        input.headers,
      );
    } else {
      source = await getDataSourceByIdDurable(
        actor.organisationId,
        input.dataSourceId,
      );
      if (!source) return { ok: false, error: "Data source not found." };
      const resolved = resolveMappingForSource(source, input.headers);
      if (resolved.schema.requiresConfirmation && !input.confirmSchemaChange) {
        return { ok: false, error: resolved.schema.message };
      }
      source = await persistMappingDurable({
        organizationId: actor.organisationId,
        dataSourceId: input.dataSourceId,
        mapping: input.mapping,
        headers: input.headers,
      });
    }

    if (source.connectionId) {
      return {
        ok: false,
        error: "USER_UPLOAD data sources must not require a Connection.",
      };
    }

    return { ok: true, source };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Unable to persist mapping.",
    };
  }
}

/**
 * After immutable pilot snapshot persist: evidence + lineage + compare.
 * Fails closed — caller must not claim durable lineage if this fails.
 */
export async function finalizeStudioWeeklyIngestionAction(input: {
  organisationId?: string;
  dataSourceId: string;
  snapshotId: string;
  recordCount: number;
  headers: string[];
  mapping: UdgMappingDefinition;
  fileName?: string;
  confirmSchemaChange?: boolean;
}): Promise<WeeklyFinalizeResult> {
  const actor = await requireStudioActor(input.organisationId);
  if (!actor.ok) {
    return { ok: false, error: actor.error, code: actor.code };
  }

  try {
    const memory = useMemoryWeeklyIngestion();

    // Confirm pilot snapshot exists for this org (immutability SoT).
    const pilot = getPilotPersistence();
    const snap = await pilot.getSnapshot(
      actor.organisationId,
      input.snapshotId,
    );
    if (!snap) {
      return {
        ok: false,
        error: "Executive Snapshot must be persisted before data source lineage.",
      };
    }

    let previousRecordCount: number | null = null;
    let previousKeys: string[] | undefined;

    if (memory) {
      const source = getDataSource(input.dataSourceId);
      if (!source || source.organizationId !== actor.organisationId) {
        return { ok: false, error: "Data source not found." };
      }
      if (source.lastSnapshotId) {
        const prev = await pilot.getSnapshot(
          actor.organisationId,
          source.lastSnapshotId,
        );
        previousRecordCount = prev?.recordCount ?? null;
      }

      const upload = receiveWeeklyUpload({
        dataSourceId: input.dataSourceId,
        headers: input.headers,
        recordCount: input.recordCount,
        fileName: input.fileName,
        createdBy: actor.userId,
        confirmSchemaChange: input.confirmSchemaChange,
        payload: { snapshotId: input.snapshotId },
      });

      const attached = attachImmutableSnapshot({
        dataSourceId: input.dataSourceId,
        snapshotId: input.snapshotId,
        recordCount: input.recordCount,
      });

      // Prefer pilot-backed volume when available
      if (previousRecordCount != null && attached.compare.previousSnapshotId) {
        attached.compare.previousRecordCount = previousRecordCount;
        attached.compare.volumeDelta =
          input.recordCount - previousRecordCount;
      }

      return {
        ok: true,
        source: attached.source,
        evidenceId: upload.evidence.id,
        lineage: {
          previousSnapshotId: attached.lineage.previousSnapshotId,
          currentSnapshotId: attached.lineage.currentSnapshotId,
        },
        compare: attached.compare,
        mappingReused: upload.mappingReused,
      };
    }

    const sourceBefore = await getDataSourceByIdDurable(
      actor.organisationId,
      input.dataSourceId,
    );
    if (!sourceBefore) {
      return { ok: false, error: "Data source not found." };
    }
    if (sourceBefore.lastSnapshotId) {
      const prev = await pilot.getSnapshot(
        actor.organisationId,
        sourceBefore.lastSnapshotId,
      );
      previousRecordCount = prev?.recordCount ?? null;
    }

    const upload = await recordUserProvidedEvidenceDurable({
      organizationId: actor.organisationId,
      dataSourceId: input.dataSourceId,
      headers: input.headers,
      recordCount: input.recordCount,
      snapshotId: input.snapshotId,
      fileName: input.fileName,
      createdBy: actor.userId,
      confirmSchemaChange: input.confirmSchemaChange,
      mapping: input.mapping,
    });

    const attached = await attachSnapshotLineageDurable({
      organizationId: actor.organisationId,
      dataSourceId: input.dataSourceId,
      snapshotId: input.snapshotId,
      recordCount: input.recordCount,
      previousRecordCount,
      previousKeys,
    });

    return {
      ok: true,
      source: attached.source,
      evidenceId: upload.evidence.id,
      lineage: {
        previousSnapshotId: attached.lineage.previousSnapshotId,
        currentSnapshotId: attached.lineage.currentSnapshotId,
      },
      compare: attached.compare,
      mappingReused: upload.mappingReused,
    };
  } catch (e) {
    return {
      ok: false,
      error:
        e instanceof Error
          ? e.message
          : "Unable to finalise weekly data source lineage.",
    };
  }
}

/** Test helper — resolve by name using durable or memory. */
export async function findStudioWeeklySourceForTests(
  organisationId: string,
  name: string,
): Promise<OrganizationDataSource | null> {
  if (useMemoryWeeklyIngestion()) {
    return findDataSourceByName(organisationId, name) ?? null;
  }
  return findDataSourceByNameDurable(organisationId, name);
}
