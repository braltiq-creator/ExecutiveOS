import type {
  UdgCanonicalRecord,
  UdgConfidenceScore,
  UdgExecutiveSnapshot,
  UdgSnapshotMeta,
  UdgSourceKind,
  UdgValidationStatus,
} from "../contracts";

function simpleHash(input: string): string {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `udg_${(h >>> 0).toString(16).padStart(8, "0")}`;
}

export type CreateSnapshotInput = {
  organisationId: string;
  profileId: string;
  productId: string;
  sourceKind: UdgSourceKind;
  connectorId: string;
  mappingId?: string;
  records: UdgCanonicalRecord[];
  validationStatus: UdgValidationStatus;
  confidence: UdgConfidenceScore;
  version?: number;
  createdAt?: string;
  snapshotId?: string;
};

/**
 * Create an immutable Executive Ingestion Snapshot.
 */
export function createExecutiveSnapshot(
  input: CreateSnapshotInput,
): UdgExecutiveSnapshot {
  const createdAt = input.createdAt ?? new Date().toISOString();
  const body = JSON.stringify(input.records);
  const contentHash = simpleHash(body);
  const snapshotId =
    input.snapshotId ?? `snap_${contentHash}_${Date.now().toString(36)}`;

  const meta: UdgSnapshotMeta = {
    snapshotId,
    version: input.version ?? 1,
    createdAt,
    organisationId: input.organisationId,
    profileId: input.profileId,
    productId: input.productId,
    sourceKind: input.sourceKind,
    connectorId: input.connectorId,
    mappingId: input.mappingId,
    recordCount: input.records.length,
    validationStatus: input.validationStatus,
    confidence: input.confidence,
  };

  return Object.freeze({
    meta: Object.freeze({ ...meta, confidence: Object.freeze({ ...input.confidence }) }),
    records: Object.freeze(input.records.map((r) => Object.freeze({ ...r, fields: Object.freeze({ ...r.fields }) }))),
    contentHash,
    immutable: true as const,
  }) as UdgExecutiveSnapshot;
}
