/**
 * Usage tracking — billing-ready meters without payment integration.
 */

export type UsageMetric =
  | "active_users"
  | "ai_requests"
  | "connector_syncs"
  | "decisions"
  | "initiatives"
  | "context_provider_syncs"
  | "storage_gb";

export type UsageCounter = {
  metric: UsageMetric;
  value: number;
  period: string;
};

export type UsageStore = {
  increment(metric: UsageMetric, amount?: number): void;
  snapshot(period?: string): UsageCounter[];
  get(metric: UsageMetric): number;
};

export function createUsageStore(period = "2026-07"): UsageStore {
  const counters = new Map<UsageMetric, number>();
  return {
    increment(metric, amount = 1) {
      counters.set(metric, (counters.get(metric) ?? 0) + amount);
    },
    snapshot(p = period) {
      return [...counters.entries()].map(([metric, value]) => ({
        metric,
        value,
        period: p,
      }));
    },
    get(metric) {
      return counters.get(metric) ?? 0;
    },
  };
}
