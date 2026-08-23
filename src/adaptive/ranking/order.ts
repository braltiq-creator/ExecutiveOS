import type { SnapshotAction } from "@/lib/snapshot/types";
import { getRecommendationLearning } from "@/adaptive/recommendation-learning/store";
import { getAdaptiveProfile } from "@/adaptive/preferences/store";
import type { PersonalisationPlan } from "@/adaptive/framework/types";

/**
 * Re-order and annotate recommendations for presentation only.
 * Does not change Core recommendation generation.
 */
export function rankRecommendationsForExecutive(input: {
  tenantId: string;
  executiveId: string;
  actions: SnapshotAction[];
  plan?: PersonalisationPlan;
}): SnapshotAction[] {
  const profile = getAdaptiveProfile(input.tenantId, input.executiveId);
  if (profile && !profile.enabled) {
    return input.actions;
  }

  const threshold = profile?.preferredConfidenceThreshold ?? 0;
  const mode = input.plan?.recommendationOrdering ?? "learned";

  const scored = input.actions.map((action, index) => {
    const learning = getRecommendationLearning(input.tenantId, action.id);
    const baseConfidence = action.confidence ?? action.strategyConfidence ?? 50;
    const adjustedConfidence = Math.max(
      5,
      Math.min(99, baseConfidence + (learning?.confidenceAdjust ?? 0)),
    );
    let score = 100 - index;
    if (mode === "learned" || mode === "value_first") {
      score += learning?.priorityBoost ?? 0;
    }
    if (mode === "confidence_first") {
      score += adjustedConfidence;
    }
    if (mode === "urgency_first" && action.potentialRisk) {
      score += 12;
    }
    if (adjustedConfidence < threshold) {
      score -= 20;
    }

    const next: SnapshotAction = {
      ...action,
      confidence: adjustedConfidence,
      adaptivePriorityBoost: learning?.priorityBoost ?? 0,
      adaptivePresentationHint: learning?.presentationHint,
      adaptiveEvidenceEmphasis: learning?.evidenceEmphasis,
      adaptiveExplanation: learning?.explanation,
    };
    return { action: next, score };
  });

  return scored.sort((a, b) => b.score - a.score).map((s) => s.action);
}
