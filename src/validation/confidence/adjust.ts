/**
 * Confidence layer — adjusts maturity with feedback and accuracy.
 */

import type { ExplainedScore } from "@/validation/types";
import { feedbackConfidenceDelta } from "@/validation/feedback";

export function adjustScoreWithFeedback(
  score: ExplainedScore,
  tenantId: string,
): ExplainedScore {
  const delta = feedbackConfidenceDelta(tenantId);
  const next = Math.max(0, Math.min(100, score.score + delta));
  return {
    ...score,
    score: next,
    evidence: [
      ...score.evidence,
      delta === 0
        ? "No recent executive feedback"
        : `Feedback adjustment ${delta > 0 ? "+" : ""}${delta}`,
    ],
    explanation: `${score.explanation} Feedback-adjusted to ${next}.`,
  };
}

export function confidenceBand(score: number): "high" | "medium" | "low" {
  if (score >= 75) return "high";
  if (score >= 50) return "medium";
  return "low";
}
