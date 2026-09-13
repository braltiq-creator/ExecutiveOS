/**
 * Compare previous vs current snapshot evidence for a logical data source.
 * Immutable snapshots are never overwritten — comparison is read-only.
 */

import type { EvidenceCompareResult } from "./types";

export type SnapshotEvidenceSummary = {
  snapshotId: string;
  recordCount: number;
  /** Optional stable keys present in this snapshot (e.g. opportunity ids). */
  keys?: string[];
  /** Optional metric labels that moved materially (caller-supplied). */
  materialMoves?: string[];
  deteriorated?: string[];
  improved?: string[];
};

export function compareSnapshotEvidence(input: {
  previous: SnapshotEvidenceSummary | null;
  current: SnapshotEvidenceSummary;
}): EvidenceCompareResult {
  const { previous, current } = input;
  const whatChanged: string[] = [];
  const whatAppeared: string[] = [];
  const whatDisappeared: string[] = [];
  const requiresJudgement: string[] = [];

  if (!previous) {
    whatAppeared.push("First validated snapshot for this source.");
    return {
      previousSnapshotId: null,
      currentSnapshotId: current.snapshotId,
      previousRecordCount: null,
      currentRecordCount: current.recordCount,
      volumeDelta: null,
      whatChanged,
      whatAppeared,
      whatDisappeared,
      requiresJudgement: [
        "Confirm this snapshot reflects the intended weekly export.",
      ],
    };
  }

  const volumeDelta = current.recordCount - previous.recordCount;
  if (volumeDelta !== 0) {
    whatChanged.push(
      volumeDelta > 0
        ? `Record volume increased by ${volumeDelta}.`
        : `Record volume decreased by ${Math.abs(volumeDelta)}.`,
    );
  } else {
    whatChanged.push("Record volume unchanged.");
  }

  const prevKeys = new Set(previous.keys ?? []);
  const currKeys = new Set(current.keys ?? []);
  if (prevKeys.size || currKeys.size) {
    for (const k of currKeys) {
      if (!prevKeys.has(k)) whatAppeared.push(k);
    }
    for (const k of prevKeys) {
      if (!currKeys.has(k)) whatDisappeared.push(k);
    }
  }

  for (const m of current.materialMoves ?? []) {
    whatChanged.push(m);
  }
  for (const d of current.deteriorated ?? []) {
    whatChanged.push(`Deteriorated: ${d}`);
    requiresJudgement.push(d);
  }
  for (const i of current.improved ?? []) {
    whatChanged.push(`Improved: ${i}`);
  }

  if (Math.abs(volumeDelta) >= Math.max(10, previous.recordCount * 0.2)) {
    requiresJudgement.push(
      "Material volume shift versus previous week — confirm data completeness.",
    );
  }

  return {
    previousSnapshotId: previous.snapshotId,
    currentSnapshotId: current.snapshotId,
    previousRecordCount: previous.recordCount,
    currentRecordCount: current.recordCount,
    volumeDelta,
    whatChanged,
    whatAppeared,
    whatDisappeared,
    requiresJudgement,
  };
}
