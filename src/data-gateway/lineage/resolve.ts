import type {
  UdgCanonicalRecord,
  UdgLineagePointer,
  UdgLineageQuery,
  UdgMappingDefinition,
  UdgSourceKind,
} from "../contracts";

const lineage = new Map<string, UdgLineagePointer>();

export function buildLineageForSnapshot(input: {
  snapshotId: string;
  organisationId: string;
  sourceKind: UdgSourceKind;
  connectorId: string;
  mapping?: UdgMappingDefinition;
  records: UdgCanonicalRecord[];
  timestamp: string;
}): UdgLineagePointer[] {
  const pointers: UdgLineagePointer[] = [];

  for (const record of input.records) {
    const fieldEntries = Object.keys(record.fields);
    for (const canonicalField of fieldEntries) {
      const map = input.mapping?.fields.find(
        (f) => f.canonicalField === canonicalField,
      );
      const pointer: UdgLineagePointer = {
        lineageId: `lin_${input.snapshotId}_${record.recordId}_${canonicalField}`,
        snapshotId: input.snapshotId,
        recordId: record.recordId,
        rowIndex: record.rowIndex,
        sourceKind: input.sourceKind,
        connectorId: input.connectorId,
        mappingId: input.mapping?.id,
        mappingField: canonicalField,
        sourceColumn: map?.sourceColumn,
        timestamp: input.timestamp,
        organisationId: input.organisationId,
      };
      pointers.push(pointer);
      lineage.set(pointer.lineageId, pointer);
    }
  }

  return pointers;
}

export function queryLineage(query: UdgLineageQuery): UdgLineagePointer[] {
  return Array.from(lineage.values()).filter((p) => {
    if (query.snapshotId && p.snapshotId !== query.snapshotId) return false;
    if (query.recordId && p.recordId !== query.recordId) return false;
    if (query.rowIndex !== undefined && p.rowIndex !== query.rowIndex)
      return false;
    if (query.organisationId && p.organisationId !== query.organisationId)
      return false;
    return true;
  });
}

export function explainRecordOrigin(
  snapshotId: string,
  recordId: string,
): {
  upload: string;
  row?: number;
  source?: string;
  mapping?: string;
  timestamp?: string;
  columns: Array<{ canonical: string; sourceColumn?: string }>;
} {
  const rows = queryLineage({ snapshotId, recordId });
  const first = rows[0];
  return {
    upload: snapshotId,
    row: first?.rowIndex,
    source: first?.sourceKind,
    mapping: first?.mappingId,
    timestamp: first?.timestamp,
    columns: rows.map((r) => ({
      canonical: r.mappingField ?? "",
      sourceColumn: r.sourceColumn,
    })),
  };
}

export function clearLineageStore(): void {
  lineage.clear();
}
