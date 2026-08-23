/**
 * Judgement learning — measure quality and refine thresholds over time.
 * Does not mutate Core. Pure functions for future wiring.
 */

import type {
  JudgementLearningMetricId,
  JudgementLearningSignal,
  JudgementThresholdRefinement,
} from "@/judgement-framework/types";
import type { ExecutiveIntelligenceRoleId } from "@/intelligence-models/types";

export const JUDGEMENT_LEARNING_METRICS: readonly JudgementLearningMetricId[] = [
  "judgement_quality",
  "escalation_accuracy",
  "false_positives",
  "false_negatives",
  "recommendation_timing",
  "decision_outcomes",
  "confidence_calibration",
] as const;

/**
 * Map learning signals into threshold deltas for a role.
 * Positive escalation_accuracy with false_negatives → lower escalate bar slightly.
 * False positives → raise escalate bar / lower action bias.
 */
export function refineJudgementThresholds(
  roleId: ExecutiveIntelligenceRoleId,
  signals: JudgementLearningSignal[],
): JudgementThresholdRefinement {
  const mine = signals.filter((s) => s.roleId === roleId);
  let recommendConfidenceFloorDelta = 0;
  let escalateForceThresholdDelta = 0;
  let actionBiasDelta = 0;
  const rationale: string[] = [];

  for (const signal of mine) {
    switch (signal.metric) {
      case "false_positives":
        if (signal.delta > 0) {
          escalateForceThresholdDelta += 1;
          actionBiasDelta -= 0.5;
          rationale.push(`False positives rising: ${signal.observation}`);
        }
        break;
      case "false_negatives":
        if (signal.delta > 0) {
          escalateForceThresholdDelta -= 1;
          actionBiasDelta += 0.5;
          rationale.push(`False negatives rising: ${signal.observation}`);
        }
        break;
      case "escalation_accuracy":
        if (signal.delta < 0) {
          escalateForceThresholdDelta += 0.5;
          rationale.push(`Escalation accuracy soft: ${signal.observation}`);
        }
        break;
      case "confidence_calibration":
        if (signal.delta < 0) {
          recommendConfidenceFloorDelta += 1;
          rationale.push(`Overconfidence: ${signal.observation}`);
        } else if (signal.delta > 0) {
          recommendConfidenceFloorDelta -= 0.5;
          rationale.push(`Under-confidence: ${signal.observation}`);
        }
        break;
      case "recommendation_timing":
        if (signal.delta < 0) {
          actionBiasDelta += 0.25;
          rationale.push(`Late recommendations: ${signal.observation}`);
        } else if (signal.delta > 0) {
          actionBiasDelta -= 0.25;
          rationale.push(`Early recommendations: ${signal.observation}`);
        }
        break;
      case "judgement_quality":
      case "decision_outcomes":
        if (signal.delta < 0) {
          recommendConfidenceFloorDelta += 0.5;
          rationale.push(`Outcome/quality drag: ${signal.observation}`);
        }
        break;
      default:
        break;
    }
  }

  if (rationale.length === 0) {
    rationale.push("No material threshold refinement from supplied signals.");
  }

  return {
    roleId,
    recommendConfidenceFloorDelta,
    escalateForceThresholdDelta,
    actionBiasDelta,
    rationale,
  };
}

export function recordLearningSignal(
  partial: Omit<JudgementLearningSignal, "asOf"> & { asOf?: string },
): JudgementLearningSignal {
  return {
    ...partial,
    asOf: partial.asOf ?? new Date().toISOString(),
  };
}
