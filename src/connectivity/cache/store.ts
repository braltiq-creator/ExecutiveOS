/**
 * Connector cache — watermark / cursor / short-lived sync artefacts.
 * Never caches vendor PII payloads long-term.
 */

export type CacheEntry<T = unknown> = {
  key: string;
  value: T;
  expiresAt: string | null;
  createdAt: string;
};

export type ConnectorCache = {
  get<T>(key: string, asOf?: string): T | undefined;
  set<T>(key: string, value: T, ttlMinutes?: number, asOf?: string): void;
  delete(key: string): void;
  clear(): void;
  keys(): string[];
};

export function createConnectorCache(): ConnectorCache {
  const store = new Map<string, CacheEntry>();

  return {
    get<T>(key: string, asOf = new Date().toISOString()) {
      const entry = store.get(key);
      if (!entry) return undefined;
      if (entry.expiresAt && new Date(entry.expiresAt) <= new Date(asOf)) {
        store.delete(key);
        return undefined;
      }
      return entry.value as T;
    },
    set<T>(key: string, value: T, ttlMinutes?: number, asOf = new Date().toISOString()) {
      const expiresAt =
        typeof ttlMinutes === "number"
          ? new Date(new Date(asOf).getTime() + ttlMinutes * 60_000).toISOString()
          : null;
      store.set(key, { key, value, expiresAt, createdAt: asOf });
    },
    delete(key: string) {
      store.delete(key);
    },
    clear() {
      store.clear();
    },
    keys() {
      return [...store.keys()];
    },
  };
}
