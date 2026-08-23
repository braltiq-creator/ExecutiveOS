import type {
  ExecutiveReviewRecord,
  ExecutiveReviewVerdict,
} from "@/trust/framework/types";

const reviews = new Map<string, ExecutiveReviewRecord>();

export function resetTrustReviews(): void {
  reviews.clear();
}

export function recordExecutiveReview(input: {
  tenantId: string;
  explanationId: string;
  recommendationId: string;
  verdict: ExecutiveReviewVerdict;
  note?: string | null;
  recordedBy?: string;
  recordedAt?: string;
}): ExecutiveReviewRecord {
  const id = `review-${reviews.size + 1}-${Date.now().toString(36)}`;
  const record: ExecutiveReviewRecord = {
    id,
    tenantId: input.tenantId,
    explanationId: input.explanationId,
    recommendationId: input.recommendationId,
    verdict: input.verdict,
    note: input.note ?? null,
    recordedBy: input.recordedBy ?? "executive",
    recordedAt: input.recordedAt ?? new Date().toISOString(),
  };
  reviews.set(id, record);
  return record;
}

export function listExecutiveReviews(
  tenantId: string,
): ExecutiveReviewRecord[] {
  return [...reviews.values()]
    .filter((item) => item.tenantId === tenantId)
    .sort((a, b) => b.recordedAt.localeCompare(a.recordedAt));
}

export function listReviewsForExplanation(
  explanationId: string,
): ExecutiveReviewRecord[] {
  return [...reviews.values()]
    .filter((item) => item.explanationId === explanationId)
    .sort((a, b) => b.recordedAt.localeCompare(a.recordedAt));
}
