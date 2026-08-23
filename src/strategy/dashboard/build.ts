/**
 * Strategic Outcomes administration dashboard.
 */

import { listStrategicOutcomes } from "@/strategy/outcomes";
import { listStrategicInitiatives } from "@/strategy/initiatives";
import { listStrategicMetrics } from "@/strategy/metrics";
import { buildAlignmentSnapshot } from "@/strategy/alignment";
import { measureStrategicProgress } from "@/strategy/progress";
import { validateStrategicAlignment } from "@/strategy/validation";
import { buildStrategyRoadmap } from "@/strategy/roadmaps";
import type { StrategyDashboard } from "@/strategy/framework/types";

export function buildStrategyDashboard(input: {
  tenantId: string;
  recommendations?: Array<{ id: string; title: string; detail?: string }>;
  asOf?: string;
}): StrategyDashboard {
  const asOf = input.asOf ?? new Date().toISOString();
  return {
    asOf,
    tenantId: input.tenantId,
    outcomes: listStrategicOutcomes(input.tenantId),
    initiatives: listStrategicInitiatives(input.tenantId),
    alignment: buildAlignmentSnapshot({
      tenantId: input.tenantId,
      recommendations: input.recommendations,
      asOf,
    }),
    progress: measureStrategicProgress({
      tenantId: input.tenantId,
      asOf,
    }),
    validation: validateStrategicAlignment({
      tenantId: input.tenantId,
      recommendations: input.recommendations,
      asOf,
    }),
    metrics: listStrategicMetrics(input.tenantId),
    roadmaps: buildStrategyRoadmap(input.tenantId),
  };
}
