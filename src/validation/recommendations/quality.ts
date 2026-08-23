/**
 * Recommendation quality — learn continuously from outcomes.
 */

import type {
  RecommendationOutcome,
  RecommendationQuality,
} from "@/validation/types";

export type RecommendationRecord = {
  id: string;
  tenantId: string;
  confidence: number;
  outcome: RecommendationOutcome | "pending";
  businessImpact?: number;
};

const store = new Map<string, RecommendationRecord[]>();

export function resetRecommendationStore(): void {
  store.clear();
}

export function recordRecommendation(
  record: RecommendationRecord,
): void {
  const list = store.get(record.tenantId) ?? [];
  const idx = list.findIndex((r) => r.id === record.id);
  if (idx >= 0) list[idx] = record;
  else list.push(record);
  store.set(record.tenantId, list);
}

export function measureRecommendationQuality(input: {
  tenantId: string;
  asOf: string;
  seedIfEmpty?: boolean;
}): RecommendationQuality {
  let records = store.get(input.tenantId) ?? [];
  if (records.length === 0 && input.seedIfEmpty !== false) {
    records = seedRecommendations(input.tenantId);
    store.set(input.tenantId, records);
  }

  const generated = records.length;
  const accepted = records.filter((r) => r.outcome === "accepted").length;
  const dismissed = records.filter((r) => r.outcome === "dismissed").length;
  const ignored = records.filter((r) => r.outcome === "ignored").length;
  const laterValidated = records.filter(
    (r) => r.outcome === "later_validated",
  ).length;
  const incorrect = records.filter((r) => r.outcome === "incorrect").length;

  const judged = accepted + dismissed + laterValidated + incorrect;
  const usefulnessPct =
    judged === 0
      ? 0
      : Math.round(((accepted + laterValidated) / judged) * 100);

  const high = records.filter((r) => r.confidence >= 75).length;
  const medium = records.filter(
    (r) => r.confidence >= 50 && r.confidence < 75,
  ).length;
  const low = records.filter((r) => r.confidence < 50).length;

  const businessImpactScore = Math.min(
    100,
    Math.round(
      records.reduce((sum, r) => sum + (r.businessImpact ?? 0), 0) /
        Math.max(1, generated),
    ),
  );

  return {
    tenantId: input.tenantId,
    asOf: input.asOf,
    generated,
    accepted,
    dismissed,
    ignored,
    laterValidated,
    incorrect,
    usefulnessPct,
    confidenceDistribution: { high, medium, low },
    businessImpactScore,
    explanation: `Usefulness ${usefulnessPct}% — ${accepted} accepted, ${incorrect} incorrect of ${generated} generated.`,
  };
}

function seedRecommendations(tenantId: string): RecommendationRecord[] {
  return [
    {
      id: "rec-1",
      tenantId,
      confidence: 82,
      outcome: "accepted",
      businessImpact: 70,
    },
    {
      id: "rec-2",
      tenantId,
      confidence: 68,
      outcome: "later_validated",
      businessImpact: 55,
    },
    {
      id: "rec-3",
      tenantId,
      confidence: 55,
      outcome: "dismissed",
      businessImpact: 20,
    },
    {
      id: "rec-4",
      tenantId,
      confidence: 40,
      outcome: "ignored",
      businessImpact: 10,
    },
    {
      id: "rec-5",
      tenantId,
      confidence: 60,
      outcome: "incorrect",
      businessImpact: 0,
    },
  ];
}
