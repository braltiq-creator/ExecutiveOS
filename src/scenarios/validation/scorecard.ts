/**
 * Design Partner scenario scorecards.
 */

import type { IntelligenceProfileId } from "@/profiles";
import type { ExecutiveSnapshot } from "@/lib/snapshot/types";
import type { IntelligentExecutiveSnapshot } from "@/intelligence/executive-intelligence/types";
import { getScenarioPackForProfile, getScenarioById } from "@/scenarios/framework";
import type { ScenarioScorecard } from "@/scenarios/framework/types";
import { runScenarioPack } from "@/scenarios/validation";
import { getPilotByTenant } from "@/pilot";

export function buildScenarioScorecard(input: {
  tenantId: string;
  profileId: IntelligenceProfileId;
  asOf?: string;
  intelligent?: IntelligentExecutiveSnapshot;
  presentation?: ExecutiveSnapshot;
}): ScenarioScorecard {
  const asOf = input.asOf ?? new Date().toISOString();
  const pack = getScenarioPackForProfile(input.profileId);
  const run = runScenarioPack(input);
  const acceptance = Math.round(
    run.results.reduce((sum, r) => sum + r.recommendationQuality, 0) /
      run.results.length,
  );
  const outcomes = Math.round(
    run.results.reduce((sum, r) => sum + r.businessOutcomeScore, 0) /
      run.results.length,
  );
  const feedbackScores = run.results
    .map((r) => r.executiveFeedback)
    .filter((v): v is number => v != null);
  const executiveConfidence =
    feedbackScores.length > 0
      ? Math.round(
          feedbackScores.reduce((a, b) => a + b, 0) / feedbackScores.length,
        )
      : run.averageConfidence;

  const overallSuccess = Math.round(
    run.completionPct * 0.25 +
      run.accuracyPct * 0.3 +
      executiveConfidence * 0.15 +
      acceptance * 0.15 +
      outcomes * 0.15,
  );

  const weakScenarios = run.results
    .filter((r) => !r.passed)
    .map((r) => {
      const def = getScenarioById(r.scenarioId);
      return {
        scenarioId: r.scenarioId,
        name: def?.name ?? r.scenarioId,
        reason: r.explanation,
      };
    });

  const pilot = getPilotByTenant(input.tenantId);
  const packLabel =
    input.profileId === "commercial_executive"
      ? "Commercial Pilot"
      : "Operations Pilot";

  return {
    id: `scorecard-${input.tenantId}-${input.profileId}`,
    tenantId: input.tenantId,
    profileId: input.profileId,
    packName: `${packLabel} — ${pack.name}`,
    asOf,
    scenarioCompletion: run.completionPct,
    scenarioAccuracy: run.accuracyPct,
    executiveConfidence,
    recommendationAcceptance: acceptance,
    businessOutcomes: outcomes,
    overallSuccess,
    weakScenarios,
    explanation: [
      `${packLabel} success ${overallSuccess}/100`,
      `completion ${run.completionPct}%`,
      `accuracy ${run.accuracyPct}%`,
      pilot ? `stage ${pilot.stage}` : "no pilot record",
      weakScenarios.length
        ? `${weakScenarios.length} weak scenario(s)`
        : "all scenarios meeting gate",
    ].join(" · "),
  };
}
