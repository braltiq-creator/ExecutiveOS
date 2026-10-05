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
import {
  assertReusableWeeklyEvidence,
  weeklyUploadSourceIdentifier,
} from "./evidence-identity";
import { previousSnapshotForAttach } from "./lineage";
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

const EVIDENCE_COLS =
  "id, organization_id, connection_id, data_source_id, provider, source_system, source_object_type, source_identifier, observed_at, retrieved_at, provenance, evidence_status, confidence, content_payload, schema_version, created_by, created_at";

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
  const sourceIdentifier = weeklyUploadSourceIdentifier(source.id, input.snapshotId);
  const identity = {
    provider: "user_upload",
    sourceSystem: source.provider ?? source.name,
    sourceObjectType: source.sourceType,
    sourceIdentifier,
  };

  const supabase = await createClient();
  const reuse = {
    organizationId: input.organizationId,
    dataSourceId: source.id,
    snapshotId: input.snapshotId,
  };

  let evidence = await findActiveWeeklyEvidence(input.organizationId, identity);
  if (evidence) {
    assertReusableWeeklyEvidence(evidence, reuse);
  } else {
    const { data: evidenceRow, error: evidenceError } = await supabase
      .from("organization_evidence")
      .insert({
        organization_id: input.organizationId,
        connection_id: null,
        data_source_id: source.id,
        provider: identity.provider,
        source_system: identity.sourceSystem,
        source_object_type: identity.sourceObjectType,
        source_identifier: identity.sourceIdentifier,
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
      .select(EVIDENCE_COLS)
      .single();

    if (evidenceError?.code === "23505") {
      evidence = await findActiveWeeklyEvidence(input.organizationId, identity);
      if (!evidence) {
        throw new Error("Unable to persist USER_PROVIDED evidence.");
      }
      assertReusableWeeklyEvidence(evidence, reuse);
    } else if (evidenceError || !evidenceRow) {
      throw new Error("Unable to persist USER_PROVIDED evidence.");
    } else {
      evidence = mapEvidenceRow(evidenceRow as EvidenceRow, source.id);
    }
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

  const lineageDecision = previousSnapshotForAttach(source, input.snapshotId);
  const previousId = lineageDecision.previousSnapshotId;
  if (lineageDecision.alreadyAttached) {
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
    return {
      source,
      lineage: {
        dataSourceId: input.dataSourceId,
        previousSnapshotId: previousId,
        currentSnapshotId: input.snapshotId,
      },
      compare,
    };
  }

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

type EvidenceRow = {
  id: string;
  organization_id: string;
  connection_id: string | null;
  data_source_id: string | null;
  provider: OrganizationEvidence["provider"];
  source_system: string;
  source_object_type: string;
  source_identifier: string;
  observed_at: string | null;
  retrieved_at: string;
  provenance: OrganizationEvidence["provenance"];
  evidence_status: OrganizationEvidence["evidenceStatus"];
  confidence: number | null;
  content_payload: Record<string, unknown> | null;
  schema_version: string;
  created_by: string | null;
  created_at: string;
};

function mapEvidenceRow(row: EvidenceRow, dataSourceId: string): OrganizationEvidence {
  return {
    id: row.id,
    organizationId: row.organization_id,
    connectionId: row.connection_id,
    dataSourceId: row.data_source_id ?? dataSourceId,
    provider: row.provider,
    sourceSystem: row.source_system,
    sourceObjectType: row.source_object_type,
    sourceIdentifier: row.source_identifier,
    observedAt: row.observed_at,
    retrievedAt: row.retrieved_at,
    provenance: row.provenance,
    evidenceStatus: row.evidence_status,
    confidence: row.confidence,
    contentPayload: row.content_payload ?? {},
    schemaVersion: row.schema_version,
    createdBy: row.created_by,
    createdAt: row.created_at,
  };
}

async function findActiveWeeklyEvidence(
  organizationId: string,
  identity: {
    provider: string;
    sourceSystem: string;
    sourceObjectType: string;
    sourceIdentifier: string;
  },
): Promise<OrganizationEvidence | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organization_evidence")
    .select(EVIDENCE_COLS)
    .eq("organization_id", organizationId)
    .eq("provider", identity.provider)
    .eq("source_system", identity.sourceSystem)
    .eq("source_object_type", identity.sourceObjectType)
    .eq("source_identifier", identity.sourceIdentifier)
    .eq("evidence_status", "active")
    .maybeSingle();

  if (error) {
    throw new Error("Unable to persist USER_PROVIDED evidence.");
  }
  if (!data) return null;
  const row = data as EvidenceRow;
  if (row.organization_id !== organizationId) {
    throw new Error("Existing evidence belongs to another organisation.");
  }
  return mapEvidenceRow(row, row.data_source_id ?? "");
}
