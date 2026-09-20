/**
 * Map organization_data_sources rows ↔ OrganizationDataSource.
 */

import type { UdgMappingDefinition } from "@/data-gateway/contracts/mapping";
import type {
  DataSourceCadence,
  DataSourceHealth,
  DataSourceIngestionMethod,
  OrganizationDataSource,
} from "./types";

export type DataSourceRow = {
  id: string;
  organization_id: string;
  name: string;
  source_type: string;
  provider: string | null;
  ingestion_method: string;
  expected_cadence: string | null;
  schema_version: string | null;
  schema_fingerprint: string | null;
  mapping_definition: unknown;
  health_status: string;
  last_received_at: string | null;
  last_validated_at: string | null;
  last_snapshot_at: string | null;
  last_snapshot_id: string | null;
  previous_snapshot_id: string | null;
  connection_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

function asMapping(value: unknown): UdgMappingDefinition | null {
  if (!value || typeof value !== "object") return null;
  const obj = value as Record<string, unknown>;
  if (!Array.isArray(obj.fields) || typeof obj.id !== "string") return null;
  return value as UdgMappingDefinition;
}

export function rowToDataSource(row: DataSourceRow): OrganizationDataSource {
  const mapping = asMapping(row.mapping_definition);
  return {
    id: row.id,
    organizationId: row.organization_id,
    name: row.name,
    sourceType: row.source_type,
    provider: row.provider,
    ingestionMethod: row.ingestion_method as DataSourceIngestionMethod,
    expectedCadence: (row.expected_cadence as DataSourceCadence | null) ?? null,
    schemaVersion: row.schema_version,
    schemaFingerprint: row.schema_fingerprint,
    mapping,
    healthStatus: row.health_status as DataSourceHealth,
    lastReceivedAt: row.last_received_at,
    lastValidatedAt: row.last_validated_at,
    lastSnapshotAt: row.last_snapshot_at,
    lastSnapshotId: row.last_snapshot_id,
    previousSnapshotId: row.previous_snapshot_id,
    connectionId: row.connection_id,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
