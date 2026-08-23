/**
 * Immutable Executive Ingestion Snapshot.
 *
 * Distinct from `@/lib/snapshot` presentation snapshots and
 * IntelligentExecutiveSnapshot. This is the UDG canonical artifact.
 * Reality Lab should eventually consume these for replay.
 */

import type { UdgConfidenceScore } from "./confidence";
import type { UdgCanonicalRecord } from "./record";
import type { UdgSourceKind } from "./source";
import type { UdgValidationStatus } from "./validation";

export type UdgSnapshotMeta = {
  snapshotId: string;
  version: number;
  createdAt: string;
  organisationId: string;
  profileId: string;
  productId: string;
  /** Source kind for audit/lineage — not used by intelligence engines. */
  sourceKind: UdgSourceKind;
  connectorId: string;
  mappingId?: string;
  recordCount: number;
  validationStatus: UdgValidationStatus;
  confidence: UdgConfidenceScore;
};

export type UdgExecutiveSnapshot = {
  meta: UdgSnapshotMeta;
  /** Canonical records only — no vendor columns. */
  records: UdgCanonicalRecord[];
  /** Opaque hash of payload for integrity / replay identity. */
  contentHash: string;
  immutable: true;
};

export type UdgSnapshotSummary = Pick<
  UdgSnapshotMeta,
  | "snapshotId"
  | "version"
  | "createdAt"
  | "organisationId"
  | "profileId"
  | "productId"
  | "sourceKind"
  | "recordCount"
  | "validationStatus"
> & {
  confidenceOverall: number;
};
