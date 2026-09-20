/**
 * Supabase-backed weekly Data Source + USER_PROVIDED evidence (Production SoT).
 * Uses authenticated createClient() — RLS enforces organisation membership.
 * USER_UPLOAD never sets connection_id.
 */

import type { UdgMappingDefinition } from "@/data-gateway/contracts/mapping";
import { createClient } from "@/lib/supabase/server";
import { assertProvenanceAllowed } from "@/verified-evidence/safety";
import type { OrganizationEvidence } from "@/verified-evidence/types";
import { compareSnapshotEvidence } from "./compare";
import { fingerprintHeaders } from "./schema";
import { resolveMappingForSource } from "./resolve";
import { rowToDataSource, type DataSourceRow } from "./row-map";
import type {
  DataSourceCadence,
  EvidenceCompareResult,
  OrganizationDataSource,
  SchemaChangeReport,
  SnapshotLineage,
} from "./types";

const SELECT_COLS =
  "id, organization_id, name, source_type, provider, ingestion_method, expected_cadence, schema_version, schema_fingerprint, mapping_definition, health_status, last_received_at, last_validated_at, last_snapshot_at, last_snapshot_id, previous_snapshot_id, connection_id, created_by, created_at, updated_at";

function nowIso(): string {
  return new Date().toISOString();
}

export async function listDataSourcesDurable(
  organizationId: string,
): Promise<OrganizationDataSource[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organization_data_sources")
    .select(SELECT_COLS)
    .eq("organization_id", organizationId)
    .order("name", { ascending: true });

  if (error) {
    throw new Error("Unable to load data sources.");
  }
  return (data ?? []).map((row) => rowToDataSource(row as DataSourceRow));
}

export async function findDataSourceByNameDurable(
  organizationId: string,
  name: string,
): Promise<OrganizationDataSource | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organization_data_sources")
    .select(SELECT_COLS)
    .eq("organization_id", organizationId)
    .eq("name", name)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to load data source.");
  }
  if (!data) return null;
  return rowToDataSource(data as DataSourceRow);
}

export async function getDataSourceByIdDurable(
  organizationId: string,
  dataSourceId: string,
): Promise<OrganizationDataSource | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organization_data_sources")
    .select(SELECT_COLS)
    .eq("organization_id", organizationId)
    .eq("id", dataSourceId)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to load data source.");
  }
  if (!data) return null;
  return rowToDataSource(data as DataSourceRow);
}

export async function ensureDataSourceDurable(input: {
  organizationId: string;
  name: string;
  sourceType?: string;
  provider?: string | null;
  expectedCadence?: DataSourceCadence | null;
  createdBy?: string | null;
}): Promise<{ source: OrganizationDataSource; created: boolean }> {
  const existing = await findDataSourceByNameDurable(
    input.organizationId,
    input.name,
  );
  if (existing) {
    if (existing.connectionId) {
      throw new Error("Manual upload must not be tied to a fake Connection.");
    }
    return { source: existing, created: false };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organization_data_sources")
    .insert({
      organization_id: input.organizationId,
      name: input.name,
      source_type: input.sourceType ?? "workbook_export",
      provider: input.provider ?? null,
      ingestion_method: "USER_UPLOAD",
      expected_cadence: input.expectedCadence ?? null,
      mapping_definition: {},
      connection_id: null,
      created_by: input.createdBy ?? null,
      health_status: "unknown",
    })
    .select(SELECT_COLS)
    .single();

  if (error || !data) {
    // Race: another request created the same unique name
    const raced = await findDataSourceByNameDurable(
      input.organizationId,
      input.name,
    );
    if (raced) return { source: raced, created: false };
    throw new Error("Unable to create data source.");
  }

  const source = rowToDataSource(data as DataSourceRow);
  if (source.connectionId) {
    throw new Error("USER_UPLOAD data sources must not require a Connection.");
  }
  return { source, created: true };
}

export async function persistMappingDurable(input: {
  organizationId: string;
  dataSourceId: string;
  mapping: UdgMappingDefinition;
  headers: string[];
}): Promise<OrganizationDataSource> {
  const source = await getDataSourceByIdDurable(
    input.organizationId,
    input.dataSourceId,
  );
  if (!source) throw new Error("Data source not found.");
  if (source.ingestionMethod === "USER_UPLOAD" && source.connectionId) {
    throw new Error("Manual upload must not be tied to a fake Connection.");
  }

  const fp = fingerprintHeaders(input.headers);
  const mapping: UdgMappingDefinition = {
    ...input.mapping,
    organisationId: input.organizationId,
    sourceKind: "USER_UPLOAD",
    updatedAt: nowIso(),
  };
  const version = (source.mapping?.version ?? 0) + 1;
  mapping.version = version;
  if (!mapping.createdAt) mapping.createdAt = nowIso();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organization_data_sources")
    .update({
      mapping_definition: mapping,
      schema_fingerprint: fp.fingerprint,
      schema_version: `v${version}`,
      updated_at: nowIso(),
    })
    .eq("id", input.dataSourceId)
    .eq("organization_id", input.organizationId)
    .select(SELECT_COLS)
    .single();

  if (error || !data) {
    throw new Error("Unable to persist mapping.");
  }
  return rowToDataSource(data as DataSourceRow);
}

export async function recordUserProvidedEvidenceDurable(input: {
  organizationId: string;
  dataSourceId: string;
  headers: string[];
  recordCount: number;
  snapshotId: string;
  fileName?: string;
  createdBy?: string | null;
  confirmSchemaChange?: boolean;
  mapping?: UdgMappingDefinition | null;
}): Promise<{
  source: OrganizationDataSource;
  evidence: OrganizationEvidence;
  schema: SchemaChangeReport;
  mappingReused: boolean;
}> {
  assertProvenanceAllowed("USER_PROVIDED");

  let source = await getDataSourceByIdDurable(
    input.organizationId,
    input.dataSourceId,
  );
  if (!source) throw new Error("Data source not found.");
  if (source.ingestionMethod === "USER_UPLOAD" && source.connectionId) {
    throw new Error("Manual upload must not be tied to a fake Connection.");
  }

  const resolved = resolveMappingForSource(source, input.headers);
  if (resolved.schema.requiresConfirmation && !input.confirmSchemaChange) {
    throw new Error(resolved.schema.message);
  }

  const mapping = source.mapping ?? input.mapping ?? resolved.mapping;
  if (!mapping) {
    throw new Error(
      "No mapping established — confirm field mappings before validating.",
    );
  }

  const mappingReused = resolved.reuse;
  const receivedAt = nowIso();
  const sourceIdentifier = `weekly-upload:${source.id}:${input.snapshotId}`;

  const supabase = await createClient();
  const { data: evidenceRow, error: evidenceError } = await supabase
    .from("organization_evidence")
    .insert({
      organization_id: input.organizationId,
      connection_id: null,
      data_source_id: source.id,
      provider: "user_upload",
      source_system: source.provider ?? source.name,
      source_object_type: source.sourceType,
      source_identifier: sourceIdentifier,
      observed_at: receivedAt,
      retrieved_at: receivedAt,
      provenance: "USER_PROVIDED",
      evidence_status: "active",
      confidence: 0.85,
      content_payload: {
        dataSourceId: source.id,
        dataSourceName: source.name,
        ingestionMethod: source.ingestionMethod,
        recordCount: input.recordCount,
        schemaFingerprint: resolved.schema.fingerprint,
        mappingId: mapping.id,
        mappingReused,
        snapshotId: input.snapshotId,
        fileName: input.fileName ?? null,
      },
      schema_version: source.schemaVersion ?? "v1",
      created_by: input.createdBy ?? null,
    })
    .select(
      "id, organization_id, connection_id, data_source_id, provider, source_system, source_object_type, source_identifier, observed_at, retrieved_at, provenance, evidence_status, confidence, content_payload, schema_version, created_by, created_at",
    )
    .single();

  if (evidenceError || !evidenceRow) {
    throw new Error("Unable to persist USER_PROVIDED evidence.");
  }

  const { data: updated, error: updateError } = await supabase
    .from("organization_data_sources")
    .update({
      schema_fingerprint: resolved.schema.fingerprint,
      last_received_at: receivedAt,
      last_validated_at: receivedAt,
      health_status: "healthy",
      updated_at: receivedAt,
    })
    .eq("id", source.id)
    .eq("organization_id", input.organizationId)
    .select(SELECT_COLS)
    .single();

  if (updateError || !updated) {
    throw new Error("Unable to update data source after evidence write.");
  }

  source = rowToDataSource(updated as DataSourceRow);

  const evidence: OrganizationEvidence = {
    id: evidenceRow.id as string,
    organizationId: evidenceRow.organization_id as string,
    connectionId: evidenceRow.connection_id as string | null,
    dataSourceId: (evidenceRow.data_source_id as string | null) ?? source.id,
    provider: evidenceRow.provider as OrganizationEvidence["provider"],
    sourceSystem: evidenceRow.source_system as string,
    sourceObjectType: evidenceRow.source_object_type as string,
    sourceIdentifier: evidenceRow.source_identifier as string,
    observedAt: evidenceRow.observed_at as string | null,
    retrievedAt: evidenceRow.retrieved_at as string,
    provenance: "USER_PROVIDED",
    evidenceStatus: evidenceRow.evidence_status as OrganizationEvidence["evidenceStatus"],
    confidence: (evidenceRow.confidence as number | null) ?? null,
    contentPayload: (evidenceRow.content_payload as Record<string, unknown>) ?? {},
    schemaVersion: evidenceRow.schema_version as string,
    createdBy: evidenceRow.created_by as string | null,
    createdAt: evidenceRow.created_at as string,
  };

  return {
    source,
    evidence,
    schema: resolved.schema,
    mappingReused,
  };
}

export async function attachSnapshotLineageDurable(input: {
  organizationId: string;
  dataSourceId: string;
  snapshotId: string;
  recordCount: number;
  previousRecordCount?: number | null;
  keys?: string[];
  previousKeys?: string[];
}): Promise<{
  source: OrganizationDataSource;
  lineage: SnapshotLineage;
  compare: EvidenceCompareResult;
}> {
  const source = await getDataSourceByIdDurable(
    input.organizationId,
    input.dataSourceId,
  );
  if (!source) throw new Error("Data source not found.");

  const previousId = source.lastSnapshotId;
  const previousRecordCount =
    input.previousRecordCount ??
    (previousId ? null : null);

  const compare = compareSnapshotEvidence({
    previous: previousId
      ? {
          snapshotId: previousId,
          recordCount:
            typeof input.previousRecordCount === "number"
              ? input.previousRecordCount
              : 0,
          keys: input.previousKeys,
        }
      : null,
    current: {
      snapshotId: input.snapshotId,
      recordCount: input.recordCount,
      keys: input.keys,
    },
  });

  // If we lacked previous volume, still keep lineage; refine compare when counts known
  if (previousId && previousRecordCount == null && input.previousRecordCount == null) {
    // leave compare with 0 previous — caller should pass previousRecordCount from pilot store
  }

  const attachedAt = nowIso();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organization_data_sources")
    .update({
      previous_snapshot_id: previousId,
      last_snapshot_id: input.snapshotId,
      last_snapshot_at: attachedAt,
      updated_at: attachedAt,
    })
    .eq("id", input.dataSourceId)
    .eq("organization_id", input.organizationId)
    .select(SELECT_COLS)
    .single();

  if (error || !data) {
    throw new Error("Unable to update snapshot lineage.");
  }

  return {
    source: rowToDataSource(data as DataSourceRow),
    lineage: {
      dataSourceId: input.dataSourceId,
      previousSnapshotId: previousId,
      currentSnapshotId: input.snapshotId,
    },
    compare,
  };
}
