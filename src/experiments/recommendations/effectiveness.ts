import type { IntelligenceProfileId } from "@/profiles";
import { listBehaviourEvents } from "@/experiments/behaviour";
import { extractTenantTelemetry } from "@/operations";

export type RecommendationEffectiveness = {
  tenantId: string;
  profileId: IntelligenceProfileId;
  viewed: number;
  accepted: number;
  ignored: number;
  effectivenessPct: number;
  explanation: string;
};

export function measureRecommendationEffectiveness(input: {
  tenantId: string;
  profileId: IntelligenceProfileId;
  asOf?: string;
}): RecommendationEffectiveness {
  const t = extractTenantTelemetry({
    tenantId: input.tenantId,
    profileId: input.profileId,
    asOf: input.asOf,
  });
  const events = listBehaviourEvents(input.tenantId);
  const viewed =
    events.filter((e) => e.kind === "recommendation_view").length +
    t.recommendationsViewed;
  const accepted =
    events.filter((e) => e.kind === "recommendation_accept").length +
    t.recommendationsAccepted;
  const ignored = events.filter((e) => e.kind === "recommendation_ignore").length;
  const denom = Math.max(1, viewed + ignored);
  const effectivenessPct = Math.round((accepted / denom) * 100);

  return {
    tenantId: input.tenantId,
    profileId: input.profileId,
    viewed,
    accepted,
    ignored,
    effectivenessPct,
    explanation:
      "Acceptance relative to views and ignores using anonymised interaction counts — no recommendation text.",
  };
}
