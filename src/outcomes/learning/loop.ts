/**
 * Learning loop — feed confirmed outcomes into overlay weights.
 * Does not modify Core architecture; consumers opt-in to read weights.
 */

import type { IntelligenceProfileId } from "@/profiles";
import { listExecutiveOutcomes } from "@/outcomes/business-outcomes";
import type { LearningFeedbackWeights } from "@/outcomes/framework/types";

const weightsByTenant = new Map<string, LearningFeedbackWeights>();

export function resetLearningWeights(): void {
  weightsByTenant.clear();
}

export function getLearningFeedbackWeights(
  tenantId: string,
): LearningFeedbackWeights | undefined {
  return weightsByTenant.get(tenantId);
}

/**
 * Recompute overlay weights from confirmed outcomes and optionally
 * nudge Scenario Pack feedback scores (non-Core).
 */
export function applyConfirmedOutcomesLearning(input: {
  tenantId: string;
  asOf?: string;
}): LearningFeedbackWeights {
  const asOf = input.asOf ?? new Date().toISOString();
  const confirmed = listExecutiveOutcomes(input.tenantId).filter(
    (o) => o.status === "confirmed",
  );

  const scenarioConfidenceBoost: Record<string, number> = {};
  const profileWeightBoost: Partial<Record<IntelligenceProfileId, number>> = {};

  for (const outcome of confirmed) {
    if (outcome.scenarioId) {
      scenarioConfidenceBoost[outcome.scenarioId] = Math.min(
        20,
        (scenarioConfidenceBoost[outcome.scenarioId] ?? 0) + 5,
      );
    }
    profileWeightBoost[outcome.profileId] = Math.min(
      15,
      (profileWeightBoost[outcome.profileId] ?? 0) + 3,
    );
  }

  const recommendationConfidenceBoost = Math.min(15, confirmed.length * 3);
  const knowledgeGraphWeightBoost = Math.min(10, confirmed.length * 2);
  const validationBoost = Math.min(10, confirmed.length * 2);

  const weights: LearningFeedbackWeights = {
    tenantId: input.tenantId,
    asOf,
    scenarioConfidenceBoost,
    recommendationConfidenceBoost,
    profileWeightBoost,
    knowledgeGraphWeightBoost,
    validationBoost,
    explanation: confirmed.length
      ? `Learning from ${confirmed.length} confirmed outcome(s) — boosts applied to scenario/validation/profile/KG overlays.`
      : "No confirmed outcomes yet — learning weights at baseline.",
  };

  weightsByTenant.set(input.tenantId, weights);
  return weights;
}

/** Optional confidence adjustment for recommendation presentation layers. */
export function recommendationConfidenceWithLearning(
  tenantId: string,
  baseConfidence: number,
): number {
  const weights = weightsByTenant.get(tenantId);
  if (!weights) return baseConfidence;
  return Math.min(
    100,
    Math.round(baseConfidence + weights.recommendationConfidenceBoost),
  );
}

/** Optional scenario confidence adjustment. */
export function scenarioConfidenceWithLearning(
  tenantId: string,
  scenarioId: string,
  baseConfidence: number,
): number {
  const weights = weightsByTenant.get(tenantId);
  if (!weights) return baseConfidence;
  return Math.min(
    100,
    Math.round(
      baseConfidence + (weights.scenarioConfidenceBoost[scenarioId] ?? 0),
    ),
  );
}
