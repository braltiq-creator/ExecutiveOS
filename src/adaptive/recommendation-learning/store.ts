import type {
  RecommendationDisposition,
  RecommendationLearningRecord,
} from "@/adaptive/framework/types";
import { appendLearningHistory } from "@/adaptive/governance/history";

const records = new Map<string, RecommendationLearningRecord>();

function key(tenantId: string, recommendationId: string): string {
  return `${tenantId}::${recommendationId}`;
}

export function resetRecommendationLearning(): void {
  records.clear();
}

export function learnRecommendationDisposition(input: {
  tenantId: string;
  executiveId: string;
  recommendationId: string;
  disposition: RecommendationDisposition;
}): RecommendationLearningRecord {
  const id = key(input.tenantId, input.recommendationId);
  const current = records.get(id) ?? {
    recommendationId: input.recommendationId,
    tenantId: input.tenantId,
    dispositions: {},
    priorityBoost: 0,
    confidenceAdjust: 0,
    evidenceEmphasis: "medium" as const,
    presentationHint: "standard",
    lastDisposition: null,
    updatedAt: new Date().toISOString(),
    explanation: "No learning yet",
  };

  const dispositions = {
    ...current.dispositions,
    [input.disposition]: (current.dispositions[input.disposition] ?? 0) + 1,
  };

  let priorityBoost = current.priorityBoost;
  let confidenceAdjust = current.confidenceAdjust;
  let evidenceEmphasis = current.evidenceEmphasis;
  let presentationHint = current.presentationHint;

  if (input.disposition === "accepted" || input.disposition === "outcome_confirmed") {
    priorityBoost = Math.min(25, priorityBoost + 5);
    confidenceAdjust = Math.min(10, confidenceAdjust + 2);
    presentationHint = "elevate";
  }
  if (input.disposition === "ignored" || input.disposition === "rejected") {
    priorityBoost = Math.max(-25, priorityBoost - 6);
    confidenceAdjust = Math.max(-12, confidenceAdjust - 3);
    evidenceEmphasis = "high";
    presentationHint = "needs_stronger_evidence";
  }
  if (input.disposition === "deferred") {
    priorityBoost = Math.max(-10, priorityBoost - 2);
    presentationHint = "defer_friendly";
  }
  if (input.disposition === "roi_confirmed") {
    priorityBoost = Math.min(30, priorityBoost + 8);
    confidenceAdjust = Math.min(15, confidenceAdjust + 4);
    presentationHint = "value_first";
  }
  if (input.disposition === "corrected") {
    evidenceEmphasis = "high";
    confidenceAdjust = Math.max(-15, confidenceAdjust - 5);
    presentationHint = "show_assumptions";
  }

  const next: RecommendationLearningRecord = {
    ...current,
    dispositions,
    priorityBoost,
    confidenceAdjust,
    evidenceEmphasis,
    presentationHint,
    lastDisposition: input.disposition,
    updatedAt: new Date().toISOString(),
    explanation: `Presentation adjusted from ${input.disposition.replace(/_/g, " ")} — priority boost ${priorityBoost}, confidence adjust ${confidenceAdjust}. Core recommendation unchanged.`,
  };
  records.set(id, next);
  appendLearningHistory({
    tenantId: input.tenantId,
    executiveId: input.executiveId,
    category: "recommendation",
    summary: next.explanation,
  });
  return next;
}

export function getRecommendationLearning(
  tenantId: string,
  recommendationId: string,
): RecommendationLearningRecord | undefined {
  return records.get(key(tenantId, recommendationId));
}

export function listRecommendationLearning(
  tenantId?: string,
): RecommendationLearningRecord[] {
  return [...records.values()]
    .filter((r) => (tenantId ? r.tenantId === tenantId : true))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
