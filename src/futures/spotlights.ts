import type {
  Future,
  FutureSpotlight,
} from "@/futures/models/types";

/**
 * Choose spotlight futures for Today — deterministic ranking.
 */
export function selectSpotlights(
  futures: Future[],
): Record<FutureSpotlight, string> {
  const byKind = (kind: Future["caseKind"]) =>
    futures.find((f) => f.caseKind === kind);

  const mostLikely =
    byKind("most_likely") ??
    [...futures].sort((a, b) => b.probability - a.probability)[0];

  const greatestRisk =
    byKind("worst_case") ??
    [...futures].sort(
      (a, b) => riskScore(b) - riskScore(a),
    )[0];

  const greatestOpportunity =
    byKind("best_case") ??
    [...futures].sort(
      (a, b) => opportunityScore(b) - opportunityScore(a),
    )[0];

  const fastestEmerging =
    [...futures].sort(
      (a, b) => emergingScore(b) - emergingScore(a),
    )[0] ?? mostLikely;

  const mostStrategic =
    [...futures].sort(
      (a, b) => strategicScore(b) - strategicScore(a),
    )[0] ?? mostLikely;

  return {
    most_likely: mostLikely.id,
    greatest_risk: greatestRisk.id,
    greatest_opportunity: greatestOpportunity.id,
    fastest_emerging: fastestEmerging.id,
    most_strategic: mostStrategic.id,
  };
}

function riskScore(future: Future): number {
  const downside = future.potentialImpacts.filter(
    (i) => i.direction === "negative",
  ).length;
  return (
    downside * 20 +
    (future.caseKind === "worst_case" ? 30 : 0) +
    (future.caseKind === "black_swan" ? 25 : 0) +
    (100 - future.confidence)
  );
}

function opportunityScore(future: Future): number {
  const upside = future.potentialImpacts.filter(
    (i) => i.direction === "positive",
  ).length;
  return (
    upside * 20 +
    (future.caseKind === "best_case" ? 35 : 0) +
    future.recommendedInterventions.filter((i) => i.kind === "high_impact")
      .length *
      5
  );
}

function emergingScore(future: Future): number {
  // Shorter horizons + more leading indicators = faster emerging
  const horizonWeight: Record<string, number> = {
    "24h": 50,
    "7d": 40,
    "30d": 25,
    "90d": 15,
    "12m": 8,
    "3y": 3,
  };
  return (
    (horizonWeight[future.timeHorizon] ?? 10) +
    future.leadingIndicators.length * 4 +
    (future.caseKind === "black_swan" ? 10 : 0)
  );
}

function strategicScore(future: Future): number {
  const strategicDrivers = future.drivers.filter((d) =>
    ["strategic_initiatives", "market_conditions", "technology"].includes(d),
  ).length;
  return (
    strategicDrivers * 15 +
    (future.caseKind === "best_case" ? 10 : 0) +
    (future.caseKind === "most_likely" ? 8 : 0) +
    future.recommendedInterventions.filter((i) => i.impact === "high").length *
      6
  );
}
