/**
 * Sync checkpoints / watermarks for recovery and incremental sync.
 */

export type SyncMode = "full" | "incremental" | "delta" | "webhook" | "replay";

export type SyncCheckpoint = {
  connectionId: string;
  service: string;
  mode: SyncMode;
  watermark: string | null;
  deltaToken: string | null;
  lastSuccessAt: string | null;
  lastAttemptAt: string | null;
  eventsProduced: number;
  status: "idle" | "running" | "succeeded" | "failed";
  lastError: string | null;
};

export type CheckpointStore = {
  get(connectionId: string, service: string): SyncCheckpoint | undefined;
  save(checkpoint: SyncCheckpoint): void;
  list(connectionId: string): SyncCheckpoint[];
};

export function createCheckpointStore(): CheckpointStore {
  const map = new Map<string, SyncCheckpoint>();
  const key = (connectionId: string, service: string) =>
    `${connectionId}:${service}`;
  return {
    get(connectionId, service) {
      return map.get(key(connectionId, service));
    },
    save(checkpoint) {
      map.set(key(checkpoint.connectionId, checkpoint.service), checkpoint);
    },
    list(connectionId) {
      return [...map.values()].filter((c) => c.connectionId === connectionId);
    },
  };
}

export function initialCheckpoint(
  connectionId: string,
  service: string,
): SyncCheckpoint {
  return {
    connectionId,
    service,
    mode: "full",
    watermark: null,
    deltaToken: null,
    lastSuccessAt: null,
    lastAttemptAt: null,
    eventsProduced: 0,
    status: "idle",
    lastError: null,
  };
}
