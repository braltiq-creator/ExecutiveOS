/**
 * Pure mapping resolution against a loaded Data Source (memory or Supabase).
 */

import type { UdgMappingDefinition } from "@/data-gateway/contracts/mapping";
import { detectSchemaChange } from "./schema";
import type { OrganizationDataSource, SchemaChangeReport } from "./types";

export function inspectSourceSchema(
  source: OrganizationDataSource,
  headers: string[],
): SchemaChangeReport {
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
export function resolveMappingForSource(
  source: OrganizationDataSource,
  headers: string[],
): {
  schema: SchemaChangeReport;
  mapping: UdgMappingDefinition | null;
  reuse: boolean;
} {
  const schema = inspectSourceSchema(source, headers);
  if (!schema.changed && source.mapping) {
    return { schema, mapping: source.mapping, reuse: true };
  }
  if (schema.changed && source.mapping) {
    return { schema, mapping: source.mapping, reuse: false };
  }
  return { schema, mapping: null, reuse: false };
}
