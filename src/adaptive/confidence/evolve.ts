import type { ConfidenceLearningPoint, ValueLearningSnapshot } from "@/adaptive/framework/types";
import { listAdaptiveProfiles } from "@/adaptive/preferences/store";
import { listRecommendationLearning } from "@/adaptive/recommendation-learning/store";
import { appendLearningHistory } from "@/adaptive/governance/history";

const trends = new Map<string, ConfidenceLearningPoint[]>();
const valueLearning = new Map<string, ValueLearningSnapshot>();

export function resetConfidenceLearning(): void {
  trends.clear();
  valueLearning.clear();
}

export function recordConfidenceEvolution(input: {
  tenantId: string;
  executiveId: string;
  score: number;
  reason: string;
}): ConfidenceLearningPoint {
  const key = `${input.tenantId}::${input.executiveId}`;
  const point: ConfidenceLearningPoint = {
    at: new Date().toISOString(),
    score: input.score,
    reason: input.reason,
  };
  const list = trends.get(key) ?? [];
  list.push(point);
  trends.set(key, list.slice(-40));
  return point;
}

export function improveValueEstimation(input: {
  tenantId: string;
  executiveId: string;
  confirmedRoi?: boolean;
  feedbackPositive?: boolean;
}): ValueLearningSnapshot {
  const profile = listAdaptiveProfiles(input.tenantId).find(
    (p) => p.executiveId === input.executiveId,
  );
  const learning = listRecommendationLearning(input.tenantId);
  const confirmed = learning.reduce(
    (sum, r) => sum + (r.dispositions.roi_confirmed ?? 0) + (r.dispositions.outcome_confirmed ?? 0),
    0,
  );
  const prior = valueLearning.get(input.tenantId);
  const accuracy = Math.min(
    95,
    (prior?.estimatedValueAccuracy ?? 55) +
      (input.confirmedRoi ? 4 : 0) +
      (input.feedbackPositive ? 2 : 0),
  );

  recordConfidenceEvolution({
    tenantId: input.tenantId,
    executiveId: input.executiveId,
    score: accuracy,
    reason: input.confirmedRoi
      ? "ROI confirmation improved value model confidence"
      : "Value estimation refreshed from adaptive signals",
  });

  const trend = trends.get(`${input.tenantId}::${input.executiveId}`) ?? [];
  const snapshot: ValueLearningSnapshot = {
    tenantId: input.tenantId,
    asOf: new Date().toISOString(),
    estimatedValueAccuracy: accuracy,
    confirmedRoiCount: confirmed + (input.confirmedRoi ? 1 : 0),
    feedbackCount: (prior?.feedbackCount ?? 0) + (input.feedbackPositive ? 1 : 0),
    confidenceTrend: trend,
    explanation: `Value estimation confidence ${accuracy}% using confirmed ROI, feedback, and ${learning.length} recommendation learning records. Profile learning confidence ${profile?.learningConfidence ?? 0}%.`,
  };
  valueLearning.set(input.tenantId, snapshot);
  appendLearningHistory({
    tenantId: input.tenantId,
    executiveId: input.executiveId,
    category: "value",
    summary: snapshot.explanation,
  });
  return snapshot;
}

export function listValueLearning(): ValueLearningSnapshot[] {
  return [...valueLearning.values()];
}

export function getConfidenceTrend(
  tenantId: string,
  executiveId: string,
): ConfidenceLearningPoint[] {
  return [...(trends.get(`${tenantId}::${executiveId}`) ?? [])];
}
