/**
 * Strategic progress across outcomes.
 */

import { listStrategicOutcomes } from "@/strategy/outcomes";
import { listStrategicInitiatives } from "@/strategy/initiatives";
import { buildAlignmentSnapshot } from "@/strategy/alignment";
import type { OutcomeProgressSnapshot } from "@/strategy/framework/types";

function healthToProgress(health: string): number {
  switch (health) {
    case "achieved":
      return 100;
    case "on_track":
      return 75;
    case "watching":
      return 50;
    case "at_risk":
      return 35;
    case "off_track":
      return 15;
    default:
      return 40;
  }
}

export function measureStrategicProgress(input: {
  tenantId: string;
  asOf?: string;
}): OutcomeProgressSnapshot {
  const asOf = input.asOf ?? new Date().toISOString();
  const outcomes = listStrategicOutcomes(input.tenantId);
  const initiatives = listStrategicInitiatives(input.tenantId);
  const alignment = buildAlignmentSnapshot({
    tenantId: input.tenantId,
    asOf,
  });

  const rows = outcomes.map((outcome) => {
    const related = initiatives.filter((i) => i.outcomeId === outcome.id);
    const initiativeProgress =
      related.length === 0
        ? healthToProgress(outcome.currentHealth)
        : Math.round(
            related.reduce((s, i) => s + i.progressPct, 0) / related.length,
          );
    const recommendationContribution = alignment.recommendationAlignments
      .filter((a) => a.outcomeId === outcome.id)
      .reduce((s, a) => s + a.estimatedContribution, 0);
    const progressPct = Math.round(
      initiativeProgress * 0.6 +
        healthToProgress(outcome.currentHealth) * 0.25 +
        Math.min(100, recommendationContribution / 3) * 0.15,
    );
    return {
      outcomeId: outcome.id,
      name: outcome.name,
      health: outcome.currentHealth,
      progressPct,
      confidence: outcome.confidence,
      initiativeCount: related.length,
      recommendationContribution: Math.min(100, recommendationContribution),
    };
  });

  const overallProgressPct =
    rows.length === 0
      ? 0
      : Math.round(rows.reduce((s, r) => s + r.progressPct, 0) / rows.length);

  return {
    tenantId: input.tenantId,
    asOf,
    outcomes: rows,
    overallProgressPct,
    explanation: `Strategic progress ${overallProgressPct}% across ${rows.length} outcome(s).`,
  };
}
