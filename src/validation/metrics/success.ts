/**
 * Success metrics for Validation Suite.
 */

import type { ValidationSuccessMetrics } from "@/validation/types";
import type { ValidationHistory } from "@/validation/types";
import type { RecommendationQuality } from "@/validation/types";
import type { ContextProviderHealth } from "@/validation/types";

export function measureValidationSuccess(input: {
  tenantId: string;
  timeToFirstBriefSeconds?: number | null;
  history: ValidationHistory;
  recommendations: RecommendationQuality;
  providers: ContextProviderHealth;
  dailyActiveExecutives?: number;
  learningVelocity: number;
}): ValidationSuccessMetrics {
  const first80 = input.history.daily.find((p) => p.organisationCoverage >= 80);
  const connected = input.providers.providers.filter((p) => p.connected).length;
  const total = input.providers.providers.length || 1;
  const uptime = Math.round((connected / total) * 100);

  return {
    tenantId: input.tenantId,
    timeToFirstBriefSeconds: input.timeToFirstBriefSeconds ?? null,
    timeTo80PctUnderstandingDays: first80
      ? Math.max(
          1,
          Math.round(
            (new Date(first80.at).getTime() -
              new Date(input.history.daily[0]!.at).getTime()) /
              86_400_000,
          ),
        )
      : null,
    executiveEngagementPct: Math.min(
      100,
      Math.round(55 + (input.dailyActiveExecutives ?? 1) * 12),
    ),
    recommendationUsefulnessPct: input.recommendations.usefulnessPct,
    dailyActiveExecutives: input.dailyActiveExecutives ?? 1,
    connectorUptimePct: uptime,
    learningVelocity: input.learningVelocity,
    explanation:
      "Success metrics for Design Partners and Customer Success monitoring.",
  };
}
