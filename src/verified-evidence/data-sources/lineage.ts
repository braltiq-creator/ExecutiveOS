/**
 * Retry of the current snapshot must not move previous_snapshot_id onto itself.
 * A different snapshot still chains from the current last snapshot.
 */
export function previousSnapshotForAttach(
  source: {
    lastSnapshotId: string | null;
    previousSnapshotId: string | null;
  },
  snapshotId: string,
): { previousSnapshotId: string | null; alreadyAttached: boolean } {
  if (source.lastSnapshotId === snapshotId) {
    return {
      previousSnapshotId: source.previousSnapshotId,
      alreadyAttached: true,
    };
  }
  return {
    previousSnapshotId: source.lastSnapshotId,
    alreadyAttached: false,
  };
}
