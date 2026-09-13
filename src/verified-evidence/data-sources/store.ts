/**
 * In-memory Organization Data Source store (tests + local DX).
 * Production SoT: organization_data_sources (migration 014).
 * Manual USER_UPLOAD sources never create a Connection.
 */

import type { UdgMappingDefinition } from "@/data-gateway/contracts/mapping";
import { saveMapping } from "@/data-gateway/mapping/store";
import { recordMemoryEvidence } from "@/verified-evidence/memory-store";
import type { OrganizationEvidence } from "@/verified-evidence/types";
import { compareSnapshotEvidence } from "./compare";
import { computeFreshness, freshnessExecutiveCopy } from "./freshness";
import { detectSchemaChange, fingerprintHeaders } from "./schema";
import type {
  DataSourceCadence,
  DataSourceFreshness,
  EvidenceCompareResult,
  OrganizationDataSource,
  SchemaChangeReport,
  SnapshotLineage,
} from "./types";

const sources = new Map<string, OrganizationDataSource>();
/** snapshotId → summary for comparison */
const snapshotSummaries = new Map<
  string,
  {
    snapshotId: string;
    dataSourceId: string;
    recordCount: number;
    keys?: string[];
  }
>();

function nowIso(): string {
  return new Date().toISOString();
}

function id(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function resetDataSourceMemory(): void {
  sources.clear();
  snapshotSummaries.clear();
}

export function createDataSource(input: {
  organizationId: string;
  name: string;
  sourceType?: string;
  provider?: string | null;
  ingestionMethod?: OrganizationDataSource["ingestionMethod"];
  expectedCadence?: DataSourceCadence | null;
  createdBy?: string | null;
  /** Must remain null for manual weekly uploads. */
  connectionId?: string | null;
}): OrganizationDataSource {
  if (
    (input.ingestionMethod ?? "USER_UPLOAD") === "USER_UPLOAD" &&
    input.connectionId
  ) {
    throw new Error(
      "USER_UPLOAD data sources must not require a Connection record.",
    );
  }

  const existing = findDataSourceByName(input.organizationId, input.name);
  if (existing) return existing;

  const createdAt = nowIso();
  const source: OrganizationDataSource = {
    id: id("ds"),
    organizationId: input.organizationId,
    name: input.name,
    sourceType: input.sourceType ?? "workbook_export",
    provider: input.provider ?? null,
    ingestionMethod: input.ingestionMethod ?? "USER_UPLOAD",
    expectedCadence: input.expectedCadence ?? null,
    schemaVersion: null,
    schemaFingerprint: null,
    mapping: null,
    healthStatus: "unknown",
    lastReceivedAt: null,
    lastValidatedAt: null,
    lastSnapshotAt: null,
    lastSnapshotId: null,
    previousSnapshotId: null,
    connectionId: input.connectionId ?? null,
    createdBy: input.createdBy ?? null,
    createdAt,
    updatedAt: createdAt,
  };
  sources.set(source.id, source);
  return source;
}

export function getDataSource(id: string): OrganizationDataSource | undefined {
  return sources.get(id);
}

export function findDataSourceByName(
  organizationId: string,
  name: string,
): OrganizationDataSource | undefined {
  return Array.from(sources.values()).find(
    (s) => s.organizationId === organizationId && s.name === name,
  );
}

export function listDataSources(
  organizationId: string,
): OrganizationDataSource[] {
  return Array.from(sources.values()).filter(
    (s) => s.organizationId === organizationId,
  );
}

export function setDataSourceCadence(
  dataSourceId: string,
  cadence: DataSourceCadence,
): OrganizationDataSource {
  const source = requireSource(dataSourceId);
  const next = {
    ...source,
    expectedCadence: cadence,
    updatedAt: nowIso(),
  };
  sources.set(dataSourceId, next);
  return next;
}

export function persistDataSourceMapping(
  dataSourceId: string,
  mapping: UdgMappingDefinition,
  headers: string[],
): OrganizationDataSource {
  const source = requireSource(dataSourceId);
  const fp = fingerprintHeaders(headers);
  const saved = saveMapping({
    ...mapping,
    organisationId: source.organizationId,
    sourceKind: source.ingestionMethod,
  });
  const next: OrganizationDataSource = {
    ...source,
    mapping: saved,
    schemaFingerprint: fp.fingerprint,
    schemaVersion: `v${saved.version}`,
    updatedAt: nowIso(),
  };
  sources.set(dataSourceId, next);
  return next;
}

export function inspectUploadSchema(
  dataSourceId: string,
  headers: string[],
): SchemaChangeReport {
  const source = requireSource(dataSourceId);
  const previousHeaders = source.mapping?.fields.map((f) => f.sourceColumn);
  return detectSchemaChange({
    headers,
    previousFingerprint: source.schemaFingerprint,
    previousHeaders: previousHeaders ?? null,
  });
}

/**
 * Resolve mapping for a subsequent weekly upload.
 * Reuses saved mapping when schema is unchanged; otherwise signals confirmation.
 */
export function resolveMappingForUpload(
  dataSourceId: string,
  headers: string[],
): {
  schema: SchemaChangeReport;
  mapping: UdgMappingDefinition | null;
  reuse: boolean;
} {
  const source = requireSource(dataSourceId);
  const schema = inspectUploadSchema(dataSourceId, headers);
  if (!schema.changed && source.mapping) {
    return { schema, mapping: source.mapping, reuse: true };
  }
  if (schema.changed && source.mapping) {
    return { schema, mapping: source.mapping, reuse: false };
  }
  return { schema, mapping: null, reuse: false };
}

/**
 * Record a validated weekly upload as USER_PROVIDED evidence.
 * Does not create or require a Connection.
 */
export function receiveWeeklyUpload(input: {
  dataSourceId: string;
  headers: string[];
  recordCount: number;
  fileName?: string;
  payload?: Record<string, unknown>;
  createdBy?: string | null;
  confirmSchemaChange?: boolean;
}): {
  source: OrganizationDataSource;
  evidence: OrganizationEvidence;
  schema: SchemaChangeReport;
  mappingReused: boolean;
} {
  const source = requireSource(input.dataSourceId);
  if (source.ingestionMethod === "USER_UPLOAD" && source.connectionId) {
    throw new Error("Manual upload must not be tied to a fake Connection.");
  }

  const resolved = resolveMappingForUpload(input.dataSourceId, input.headers);
  if (resolved.schema.requiresConfirmation && !input.confirmSchemaChange) {
    throw new Error(resolved.schema.message);
  }

  if (!source.mapping && !resolved.mapping) {
    throw new Error(
      "No mapping established — confirm field mappings before validating.",
    );
  }

  const mappingReused = resolved.reuse;
  const receivedAt = nowIso();

  const evidence = recordMemoryEvidence({
    id: id("ev"),
    organizationId: source.organizationId,
    connectionId: null,
    dataSourceId: source.id,
    provider: "user_upload",
    sourceSystem: source.provider ?? source.name,
    sourceObjectType: source.sourceType,
    sourceIdentifier:
      input.fileName ?? `weekly-upload:${source.id}:${receivedAt}`,
    observedAt: receivedAt,
    retrievedAt: receivedAt,
    provenance: "USER_PROVIDED",
    evidenceStatus: "active",
    confidence: 0.85,
    contentPayload: {
      dataSourceId: source.id,
      dataSourceName: source.name,
      ingestionMethod: source.ingestionMethod,
      recordCount: input.recordCount,
      schemaFingerprint: resolved.schema.fingerprint,
      mappingId: source.mapping?.id ?? resolved.mapping?.id ?? null,
      mappingReused,
      ...(input.payload ?? {}),
    },
    schemaVersion: source.schemaVersion ?? "v1",
    createdBy: input.createdBy ?? null,
  });

  const next: OrganizationDataSource = {
    ...source,
    schemaFingerprint: resolved.schema.fingerprint,
    lastReceivedAt: receivedAt,
    lastValidatedAt: receivedAt,
    healthStatus: "healthy",
    updatedAt: receivedAt,
  };
  sources.set(source.id, next);

  return {
    source: next,
    evidence,
    schema: resolved.schema,
    mappingReused,
  };
}

/**
 * Attach a NEW immutable executive snapshot to this data source.
 * Never overwrites previousSnapshotId / prior snapshot rows.
 */
export function attachImmutableSnapshot(input: {
  dataSourceId: string;
  snapshotId: string;
  recordCount: number;
  keys?: string[];
}): {
  source: OrganizationDataSource;
  lineage: SnapshotLineage;
  compare: EvidenceCompareResult;
} {
  const source = requireSource(input.dataSourceId);
  const previousId = source.lastSnapshotId;
  const previousSummary = previousId
    ? snapshotSummaries.get(previousId) ?? null
    : null;

  snapshotSummaries.set(input.snapshotId, {
    snapshotId: input.snapshotId,
    dataSourceId: source.id,
    recordCount: input.recordCount,
    keys: input.keys,
  });

  // Previous snapshot summary stays in the map — never deleted/overwritten.
  const compare = compareSnapshotEvidence({
    previous: previousSummary
      ? {
          snapshotId: previousSummary.snapshotId,
          recordCount: previousSummary.recordCount,
          keys: previousSummary.keys,
        }
      : null,
    current: {
      snapshotId: input.snapshotId,
      recordCount: input.recordCount,
      keys: input.keys,
    },
  });

  const attachedAt = nowIso();
  const next: OrganizationDataSource = {
    ...source,
    previousSnapshotId: previousId,
    lastSnapshotId: input.snapshotId,
    lastSnapshotAt: attachedAt,
    updatedAt: attachedAt,
  };
  sources.set(source.id, next);

  return {
    source: next,
    lineage: {
      dataSourceId: source.id,
      previousSnapshotId: previousId,
      currentSnapshotId: input.snapshotId,
    },
    compare,
  };
}

export function getDataSourceFreshness(
  dataSourceId: string,
  now?: Date,
): {
  freshness: DataSourceFreshness;
  executiveCopy: string;
} {
  const source = requireSource(dataSourceId);
  const freshness = computeFreshness(source, now);
  return {
    freshness,
    executiveCopy: freshnessExecutiveCopy(freshness, source.name),
  };
}

function requireSource(dataSourceId: string): OrganizationDataSource {
  const source = sources.get(dataSourceId);
  if (!source) {
    throw new Error(`Data source not found: ${dataSourceId}`);
  }
  return source;
}

/** Test helper: assert prior snapshot summary still present and unchanged. */
export function getSnapshotSummary(snapshotId: string) {
  return snapshotSummaries.get(snapshotId);
}
