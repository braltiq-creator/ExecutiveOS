/**
 * Within-tenant scenario benchmarking — never compares business data across tenants.
 */

import type { IntelligenceProfileId } from "@/profiles";
import type { ScenarioBenchmark } from "@/scenarios/framework/types";
import { listScenarioRunsForTenant, runScenarioPack } from "@/scenarios/validation";
import { buildScenarioScorecard } from "@/scenarios/validation/scorecard";
import { getPilotByTenant } from "@/pilot";
import type { ExecutiveSnapshot } from "@/lib/snapshot/types";
import type { IntelligentExecutiveSnapshot } from "@/intelligence/executive-intelligence/types";

export function benchmarkScenarioPerformance(input: {
  tenantId: string;
  profileId: IntelligenceProfileId;
  asOf?: string;
  intelligent?: IntelligentExecutiveSnapshot;
  presentation?: ExecutiveSnapshot;
}): ScenarioBenchmark {
  const asOf = input.asOf ?? new Date().toISOString();
  // Ensure a current point exists
  runScenarioPack(input);
  const scorecard = buildScenarioScorecard(input);
  const runs = listScenarioRunsForTenant(input.tenantId).filter(
    (r) => r.profileId === input.profileId,
  );

  const points = runs.map((r) => ({
    at: r.asOf,
    completionPct: r.completionPct,
    accuracyPct: r.accuracyPct,
    averageConfidence: r.averageConfidence,
    overallSuccess: Math.round(
      r.completionPct * 0.4 + r.accuracyPct * 0.4 + r.averageConfidence * 0.2,
    ),
  }));

  const latest = points[points.length - 1];
  const previous = points.length > 1 ? points[points.length - 2] : latest;
  const trend =
    latest && previous
      ? latest.overallSuccess > previous.overallSuccess + 2
        ? ("up" as const)
        : latest.overallSuccess < previous.overallSuccess - 2
          ? ("down" as const)
          : ("flat" as const)
      : ("flat" as const);

  const pilot = getPilotByTenant(input.tenantId);
  const phase = pilot?.stage ?? "unknown";
  const phaseComparison = [
    {
      phase,
      completionPct: scorecard.scenarioCompletion,
      accuracyPct: scorecard.scenarioAccuracy,
    },
  ];

  // Group historical runs by recorded pilot stage notes is not available;
  // expose current phase vs overall history average as within-tenant view.
  if (points.length > 1) {
    const avgCompletion = Math.round(
      points.reduce((s, p) => s + p.completionPct, 0) / points.length,
    );
    const avgAccuracy = Math.round(
      points.reduce((s, p) => s + p.accuracyPct, 0) / points.length,
    );
    phaseComparison.push({
      phase: "tenant_history_avg",
      completionPct: avgCompletion,
      accuracyPct: avgAccuracy,
    });
  }

  return {
    tenantId: input.tenantId,
    profileId: input.profileId,
    asOf,
    points,
    trend,
    phaseComparison,
    explanation: `Within-tenant scenario trend ${trend} over ${points.length} run(s). Never compares business data across tenants.`,
  };
}
