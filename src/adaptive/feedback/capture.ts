import type { RecommendationDisposition } from "@/adaptive/framework/types";
import { learnRecommendationDisposition } from "@/adaptive/recommendation-learning/store";
import { recordAdaptiveBehaviour } from "@/adaptive/behaviour/store";
import { improveValueEstimation } from "@/adaptive/confidence/evolve";
import type { IntelligenceProfileId } from "@/profiles";

const dispositionToBehaviour = {
  accepted: "recommendation_accept",
  rejected: "recommendation_reject",
  deferred: "recommendation_defer",
  ignored: "recommendation_ignore",
  corrected: "recommendation_reject",
  outcome_confirmed: "value_confirm",
  roi_confirmed: "value_confirm",
} as const;

export function captureExecutiveFeedback(input: {
  tenantId: string;
  executiveId: string;
  profileId: IntelligenceProfileId;
  recommendationId: string;
  disposition: RecommendationDisposition;
}): {
  learning: ReturnType<typeof learnRecommendationDisposition>;
  value?: ReturnType<typeof improveValueEstimation>;
} {
  recordAdaptiveBehaviour({
    tenantId: input.tenantId,
    executiveId: input.executiveId,
    profileId: input.profileId,
    kind: dispositionToBehaviour[input.disposition],
    recommendationId: input.recommendationId,
  });

  const learning = learnRecommendationDisposition({
    tenantId: input.tenantId,
    executiveId: input.executiveId,
    recommendationId: input.recommendationId,
    disposition: input.disposition,
  });

  let value;
  if (
    input.disposition === "roi_confirmed" ||
    input.disposition === "outcome_confirmed"
  ) {
    value = improveValueEstimation({
      tenantId: input.tenantId,
      executiveId: input.executiveId,
      confirmedRoi: input.disposition === "roi_confirmed",
      feedbackPositive: true,
    });
  }

  return { learning, value };
}
