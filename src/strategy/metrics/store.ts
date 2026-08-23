/**
 * Supporting KPIs / metrics for strategic outcomes.
 */

import type { StrategicMetric } from "@/strategy/framework/types";

const metrics = new Map<string, StrategicMetric>();

export function resetStrategicMetrics(): void {
  metrics.clear();
}

export function listStrategicMetrics(tenantId: string): StrategicMetric[] {
  return [...metrics.values()].filter((m) => m.tenantId === tenantId);
}

export function recordStrategicMetric(input: {
  tenantId: string;
  outcomeId: string;
  label: string;
  currentValue?: number | null;
  targetValue?: number | null;
  unit?: string;
  trend?: StrategicMetric["trend"];
  asOf?: string;
}): StrategicMetric {
  const metric: StrategicMetric = {
    id: `smet-${input.tenantId}-${metrics.size + 1}`,
    tenantId: input.tenantId,
    outcomeId: input.outcomeId,
    label: input.label,
    currentValue: input.currentValue ?? null,
    targetValue: input.targetValue ?? null,
    unit: input.unit ?? "score",
    trend: input.trend ?? "flat",
    asOf: input.asOf ?? new Date().toISOString(),
  };
  metrics.set(metric.id, metric);
  return metric;
}
