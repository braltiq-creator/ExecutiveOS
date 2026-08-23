import type { UdgExecutiveSnapshot, UdgSnapshotSummary } from "../contracts";
import { containsBinaryWorkbookResidue } from "../uploads/detect-file-type";

const snapshots = new Map<string, UdgExecutiveSnapshot>();
const invalidations = new Map<
  string,
  { reason: string; at: string }
>();

/**
 * Detect snapshots produced by the legacy XLS-as-UTF-8 misparse
 * (binary residue / font metadata appearing as business fields).
 */
export function snapshotLooksLikeCorruptBinaryParse(
  snapshot: UdgExecutiveSnapshot,
): boolean {
  const headerSample: string[] = [];
  const valueSample: string[] = [];
  for (const record of snapshot.records.slice(0, 30)) {
    for (const [key, value] of Object.entries(record.fields)) {
      headerSample.push(key);
      if (typeof value === "string") valueSample.push(value);
    }
  }
  if (containsBinaryWorkbookResidue(headerSample)) return true;
  if (containsBinaryWorkbookResidue(valueSample)) return true;
  // Classic failure signature: OLE .xls UTF-8-decoded into thousands of fake rows
  if (
    snapshot.meta.sourceKind === "excel" &&
    snapshot.meta.recordCount > 5000 &&
    containsBinaryWorkbookResidue(
      snapshot.records
        .slice(0, 50)
        .flatMap((r) =>
          Object.values(r.fields).filter((v): v is string => typeof v === "string"),
        ),
    )
  ) {
    return true;
  }
  return false;
}

export function invalidateSnapshot(
  snapshotId: string,
  reason = "Snapshot invalidated — generated from malformed Excel parse.",
): void {
  invalidations.set(snapshotId, {
    reason,
    at: new Date().toISOString(),
  });
}

export function getSnapshotInvalidation(
  snapshotId: string,
): { reason: string; at: string } | undefined {
  return invalidations.get(snapshotId);
}

export function isSnapshotValidForIntelligence(
  snapshot: UdgExecutiveSnapshot,
): boolean {
  if (invalidations.has(snapshot.meta.snapshotId)) return false;
  if (snapshot.meta.validationStatus === "failed") return false;
  if (snapshotLooksLikeCorruptBinaryParse(snapshot)) {
    invalidateSnapshot(
      snapshot.meta.snapshotId,
      "Obsolete — binary Excel workbook was incorrectly parsed as text.",
    );
    return false;
  }
  return true;
}

export function storeSnapshot(snapshot: UdgExecutiveSnapshot): void {
  snapshots.set(snapshot.meta.snapshotId, snapshot);
  if (snapshotLooksLikeCorruptBinaryParse(snapshot)) {
    invalidateSnapshot(
      snapshot.meta.snapshotId,
      "Obsolete — binary Excel workbook was incorrectly parsed as text.",
    );
  }
}

export function getSnapshot(id: string): UdgExecutiveSnapshot | undefined {
  return snapshots.get(id);
}

export function listSnapshots(organisationId?: string): UdgSnapshotSummary[] {
  const all = Array.from(snapshots.values());
  const filtered = organisationId
    ? all.filter((s) => s.meta.organisationId === organisationId)
    : all;
  return filtered
    .filter((s) => isSnapshotValidForIntelligence(s))
    .map((s) => ({
      snapshotId: s.meta.snapshotId,
      version: s.meta.version,
      createdAt: s.meta.createdAt,
      organisationId: s.meta.organisationId,
      profileId: s.meta.profileId,
      productId: s.meta.productId,
      sourceKind: s.meta.sourceKind,
      recordCount: s.meta.recordCount,
      validationStatus: s.meta.validationStatus,
      confidenceOverall: s.meta.confidence.overall,
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Replay = return frozen snapshot for Reality Lab / reprocessing. */
export function replaySnapshot(
  id: string,
): UdgExecutiveSnapshot | undefined {
  const snapshot = getSnapshot(id);
  if (!snapshot) return undefined;
  if (!isSnapshotValidForIntelligence(snapshot)) return undefined;
  return snapshot;
}

export function clearSnapshotStore(): void {
  snapshots.clear();
  invalidations.clear();
}
