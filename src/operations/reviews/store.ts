/**
 * 30 / 60 / 90 day Design Partner reviews.
 */

import type { DesignPartnerReview, ReviewMilestone } from "@/operations/types";

const reviews = new Map<string, DesignPartnerReview>();

export function resetPartnerReviews(): void {
  reviews.clear();
}

export function listReviewsForTenant(tenantId: string): DesignPartnerReview[] {
  return [...reviews.values()]
    .filter((r) => r.tenantId === tenantId)
    .sort((a, b) => a.conductedAt.localeCompare(b.conductedAt));
}

export function recordPartnerReview(input: {
  tenantId: string;
  milestone: ReviewMilestone;
  conductedBy: string;
  achievements: string[];
  challenges: string[];
  featureRequests: string[];
  executiveFeedback: string;
  businessOutcomes: string[];
  nextActions: string[];
  asOf?: string;
}): DesignPartnerReview {
  const review: DesignPartnerReview = {
    id: `review-${input.tenantId}-${input.milestone}`,
    tenantId: input.tenantId,
    milestone: input.milestone,
    conductedAt: input.asOf ?? new Date().toISOString(),
    conductedBy: input.conductedBy,
    achievements: input.achievements,
    challenges: input.challenges,
    featureRequests: input.featureRequests,
    executiveFeedback: input.executiveFeedback,
    businessOutcomes: input.businessOutcomes,
    nextActions: input.nextActions,
  };
  reviews.set(review.id, review);
  return review;
}

export function getReview(
  tenantId: string,
  milestone: ReviewMilestone,
): DesignPartnerReview | undefined {
  return reviews.get(`review-${tenantId}-${milestone}`);
}
