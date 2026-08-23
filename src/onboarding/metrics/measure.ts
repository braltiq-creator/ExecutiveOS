/**
 * Onboarding success metrics.
 */

import type { OnboardingMetricsSnapshot } from "@/onboarding/types";
import type { ConfidenceSummary } from "@/onboarding/confidence";
import { accuracyFromValidations } from "@/onboarding/validation";
import type { DiscoveryItem } from "@/onboarding/types";

export function measureOnboarding(input: {
  tenantId: string;
  startedAt: string;
  completedAt: string | null;
  discoveries: DiscoveryItem[];
  confidence: ConfidenceSummary;
  manualConfigurationMinutes?: number;
}): OnboardingMetricsSnapshot {
  const timeToFirstBriefingSeconds =
    input.completedAt == null
      ? null
      : Math.max(
          0,
          Math.round(
            (new Date(input.completedAt).getTime() -
              new Date(input.startedAt).getTime()) /
              1000,
          ),
        );

  return {
    tenantId: input.tenantId,
    timeToFirstBriefingSeconds,
    discoveryAccuracy: accuracyFromValidations(input.discoveries),
    manualConfigurationMinutes: input.manualConfigurationMinutes ?? 2,
    organisationCoverage: input.confidence.organisationCoverage,
    knowledgeGraphCompleteness: input.confidence.knowledgeGraphCompleteness,
    executiveSatisfactionProxy: Math.min(
      100,
      Math.round(
        input.confidence.overall * 0.7 +
          (timeToFirstBriefingSeconds != null &&
          timeToFirstBriefingSeconds < 15 * 60
            ? 30
            : 10),
      ),
    ),
    confidenceGrowth: input.confidence.overall,
    setupCompletionRate: input.completedAt ? 100 : input.confidence.overall,
  };
}
