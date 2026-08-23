/**
 * Onboarding kickoff — reuse Executive Discovery; ask only minimum.
 */

import type { OnboardingKickoff } from "@/provisioning/types";

/**
 * Discovery already asks role, outcomes, briefing time via MinimumQuestions.
 * Provisioning only defines the kickoff contract — does not fork Discovery.
 */
export function buildOnboardingKickoff(input: {
  tenantId: string;
  userId: string;
}): OnboardingKickoff {
  return {
    tenantId: input.tenantId,
    userId: input.userId,
    ask: {
      role: true,
      topThreeStrategicOutcomes: true,
      preferredBriefingTime: true,
    },
    discoverAutomatically: [
      "organisation_structure",
      "executive_team",
      "connectors",
      "operating_rhythm",
      "business_units",
      "customers_and_sites",
      "terminology",
      "intelligence_profile_recommendation",
    ],
    entryPath: "/onboarding",
  };
}
