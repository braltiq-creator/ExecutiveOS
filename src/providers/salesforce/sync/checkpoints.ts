export type SalesforceSyncMode =
  | "full"
  | "incremental"
  | "cdc"
  | "webhook"
  | "replay";

export type SalesforceSyncCheckpoint = {
  connectionId: string;
  service: string;
  mode: SalesforceSyncMode;
  watermark: string | null;
  replayId: string | null;
  lastSuccessAt: string | null;
  lastAttemptAt: string | null;
  eventsProduced: number;
  status: "idle" | "running" | "succeeded" | "failed";
  lastError: string | null;
};

export type SalesforceCheckpointStore = {
  get(connectionId: string, service: string): SalesforceSyncCheckpoint | undefined;
  save(checkpoint: SalesforceSyncCheckpoint): void;
  list(connectionId: string): SalesforceSyncCheckpoint[];
};

export function createSalesforceCheckpointStore(): SalesforceCheckpointStore {
  const map = new Map<string, SalesforceSyncCheckpoint>();
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

export function initialSalesforceCheckpoint(
  connectionId: string,
  service: string,
): SalesforceSyncCheckpoint {
  return {
    connectionId,
    service,
    mode: "full",
    watermark: null,
    replayId: null,
    lastSuccessAt: null,
    lastAttemptAt: null,
    eventsProduced: 0,
    status: "idle",
    lastError: null,
  };
}
