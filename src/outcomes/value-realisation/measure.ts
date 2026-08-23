/**
 * Value realisation — ranges with confidence, not false precision.
 */

import { listRecommendationTracks } from "@/outcomes/recommendation-tracking";
import { listExecutiveOutcomes } from "@/outcomes/business-outcomes";
import { measureDecisionImpact } from "@/outcomes/decision-impact";
import { runScenarioPack } from "@/scenarios";
import type { IntelligenceProfileId } from "@/profiles";
import type {
  ValueRange,
  ValueRealisationSummary,
} from "@/outcomes/framework/types";

function range(
  low: number,
  mid: number,
  high: number,
  unit: ValueRange["unit"],
  confidence: number,
  explanation: string,
): ValueRange {
  return {
    low: Math.round(low),
    mid: Math.round(mid),
    high: Math.round(high),
    unit,
    confidence: Math.max(0, Math.min(100, Math.round(confidence))),
    explanation,
  };
}

export function measureValueRealisation(input: {
  tenantId: string;
  profileId: IntelligenceProfileId;
  asOf?: string;
}): ValueRealisationSummary {
  const asOf = input.asOf ?? new Date().toISOString();
  const recs = listRecommendationTracks(input.tenantId);
  const outcomes = listExecutiveOutcomes(input.tenantId);
  const impact = measureDecisionImpact({ tenantId: input.tenantId, asOf });

  const adopted = recs.filter((r) =>
    ["accepted", "implemented", "observed", "confirmed"].includes(r.status),
  ).length;

  const confirmed = outcomes.filter((o) => o.status === "confirmed");
  const timeOutcomes = outcomes.filter(
    (o) => o.businessOutcomeKind === "executive_time_saved",
  );
  const timeMid = timeOutcomes.reduce(
    (sum, o) => sum + o.estimatedBusinessValue.mid,
    0,
  );
  const timeLow = Math.max(0, timeMid * 0.5);
  const timeHigh = timeMid * 1.6 + adopted * 0.5;

  const usdOutcomes = outcomes.filter(
    (o) => o.estimatedBusinessValue.unit === "usd",
  );
  const usdMid = usdOutcomes.reduce(
    (sum, o) =>
      sum +
      (o.status === "confirmed"
        ? o.estimatedBusinessValue.mid
        : o.estimatedBusinessValue.mid * 0.4),
    0,
  );

  let scenarioSuccess = 50;
  try {
    const run = runScenarioPack({
      tenantId: input.tenantId,
      profileId: input.profileId,
      asOf,
    });
    scenarioSuccess = run.accuracyPct;
  } catch {
    scenarioSuccess = 50;
  }

  const confBase = Math.min(
    70,
    35 + confirmed.length * 8 + (adopted > 0 ? 10 : 0),
  );

  return {
    tenantId: input.tenantId,
    asOf,
    executiveTimeSavedHours: range(
      timeLow || adopted * 0.5,
      timeMid || adopted * 1.5,
      timeHigh || adopted * 3 + 2,
      "hours",
      confBase,
      "Estimated executive time saved — range reflects uncertainty.",
    ),
    businessValueCreated: range(
      usdMid * 0.4,
      usdMid || adopted * 10_000,
      (usdMid || adopted * 10_000) * 2.2,
      "usd",
      Math.min(confBase, 55),
      "Indicative business value created — not financial accounting.",
    ),
    recommendationsAdopted: adopted,
    recommendationsGenerated: recs.length,
    scenarioSuccessRate: range(
      Math.max(0, scenarioSuccess - 15),
      scenarioSuccess,
      Math.min(100, scenarioSuccess + 10),
      "percent",
      confBase,
      "Scenario pack success rate with uncertainty band.",
    ),
    decisionConfidenceImprovement: range(
      Math.max(0, impact.influenceScore - 20),
      Math.min(100, impact.influenceScore * 0.8),
      Math.min(100, impact.influenceScore + 5),
      "percent",
      confBase,
      "Proxy for decision confidence improvement from influence score.",
    ),
    executiveEngagementImprovement: range(
      Math.max(0, adopted * 5),
      Math.min(100, adopted * 12 + confirmed.length * 8),
      Math.min(100, adopted * 18 + confirmed.length * 12),
      "percent",
      confBase,
      "Engagement improvement proxy from adoption and confirmations.",
    ),
    explanation: `Value realisation uses ranges and confidence (${confBase}%) — ${adopted}/${recs.length} recommendations adopted, ${confirmed.length} outcomes confirmed.`,
  };
}
