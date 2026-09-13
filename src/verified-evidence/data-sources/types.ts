/**
 * Phase 37 addendum — Weekly Data Source model.
 * Connection ≠ Data Source ≠ Evidence.
 * Manual USER_UPLOAD sources never require a Connection.
 */

import type { UdgMappingDefinition } from "@/data-gateway/contracts/mapping";

export type DataSourceIngestionMethod =
  | "USER_UPLOAD"
  | "API"
  | "CONNECTOR"
  | "FILE_DROP";

export type DataSourceCadence =
  | "DAILY"
  | "WEEKLY"
  | "FORTNIGHTLY"
  | "MONTHLY"
  | "AD_HOC";

export type DataSourceHealth =
  | "unknown"
  | "healthy"
  | "degraded"
  | "unhealthy";

/**
 * Freshness is derived from expected cadence.
 * Do not invent cadence — if unset, freshness is UNKNOWN (honest).
 */
export type DataSourceFreshness =
  | "UNKNOWN"
  | "CURRENT"
  | "DUE"
  | "OVERDUE"
  | "STALE"
  | "MISSING";

export type OrganizationDataSource = {
  id: string;
  organizationId: string;
  name: string;
  sourceType: string;
  provider: string | null;
  ingestionMethod: DataSourceIngestionMethod;
  expectedCadence: DataSourceCadence | null;
  schemaVersion: string | null;
  schemaFingerprint: string | null;
  mapping: UdgMappingDefinition | null;
  healthStatus: DataSourceHealth;
  lastReceivedAt: string | null;
  lastValidatedAt: string | null;
  lastSnapshotAt: string | null;
  lastSnapshotId: string | null;
  previousSnapshotId: string | null;
  /** Optional — only when a live connector backs this logical source. */
  connectionId: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SchemaColumnSet = {
  headers: string[];
  fingerprint: string;
};

export type SchemaChangeReport = {
  changed: boolean;
  fingerprint: string;
  previousFingerprint: string | null;
  addedColumns: string[];
  removedColumns: string[];
  requiresConfirmation: boolean;
  message: string;
};

export type SnapshotLineage = {
  dataSourceId: string;
  previousSnapshotId: string | null;
  currentSnapshotId: string;
};

export type EvidenceCompareResult = {
  previousSnapshotId: string | null;
  currentSnapshotId: string;
  previousRecordCount: number | null;
  currentRecordCount: number;
  volumeDelta: number | null;
  whatChanged: string[];
  whatAppeared: string[];
  whatDisappeared: string[];
  requiresJudgement: string[];
};
