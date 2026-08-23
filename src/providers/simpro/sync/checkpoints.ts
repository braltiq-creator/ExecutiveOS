export type SimproSyncMode =
  | "full"
  | "incremental"
  | "webhook"
  | "replay";

export type SimproSyncCheckpoint = {
  connectionId: string;
  service: string;
  mode: SimproSyncMode;
  watermark: string | null;
  lastSuccessAt: string | null;
  lastAttemptAt: string | null;
  eventsProduced: number;
  status: "idle" | "running" | "succeeded" | "failed";
  lastError: string | null;
};

export type SimproCheckpointStore = {
  get(connectionId: string, service: string): SimproSyncCheckpoint | undefined;
  save(checkpoint: SimproSyncCheckpoint): void;
  list(connectionId: string): SimproSyncCheckpoint[];
};

export function createSimproCheckpointStore(): SimproCheckpointStore {
  const map = new Map<string, SimproSyncCheckpoint>();
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

export function initialSimproCheckpoint(
  connectionId: string,
  service: string,
): SimproSyncCheckpoint {
  return {
    connectionId,
    service,
    mode: "full",
    watermark: null,
    lastSuccessAt: null,
    lastAttemptAt: null,
    eventsProduced: 0,
    status: "idle",
    lastError: null,
  };
}
