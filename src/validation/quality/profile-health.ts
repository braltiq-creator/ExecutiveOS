/**
 * Executive profile health.
 */

import type { LearnedExecutiveProfile } from "@/onboarding/types";
import type { ExecutiveProfileHealth } from "@/validation/types";

export function assessExecutiveProfileHealth(input: {
  tenantId: string;
  asOf: string;
  profile?: LearnedExecutiveProfile | null;
}): ExecutiveProfileHealth {
  const profile = input.profile;
  if (!profile) {
    return {
      tenantId: input.tenantId,
      asOf: input.asOf,
      preferencesKnown: 0,
      decisionStyle: "Unknown",
      communicationStyle: "Unknown",
      riskProfile: "Unknown",
      briefingConfidence: 0,
      learningProgress: 0,
      confidenceTrend: "flat",
      explanation: "Executive profile not yet learned — complete discovery.",
      gaps: ["Run Executive Discovery", "Provide light feedback on briefings"],
    };
  }

  const known = [
    profile.decisionStyle,
    profile.communicationPreference,
    profile.meetingPreference,
    profile.informationDensity,
    profile.riskTolerance,
    profile.briefingStyle,
    profile.notificationPreference,
  ].filter(Boolean).length;

  const learningProgress = Math.min(
    100,
    profile.confidence + profile.corrections.length * 3,
  );

  return {
    tenantId: input.tenantId,
    asOf: input.asOf,
    preferencesKnown: known,
    decisionStyle: profile.decisionStyle,
    communicationStyle: profile.communicationPreference,
    riskProfile: profile.riskTolerance,
    briefingConfidence: profile.confidence,
    learningProgress,
    confidenceTrend:
      profile.corrections.length > 0
        ? "up"
        : profile.confidence >= 70
          ? "up"
          : "flat",
    explanation: `Profile confidence ${profile.confidence}% across ${known} preference dimensions.`,
    gaps:
      profile.confidence < 70
        ? ["Correct a few discoveries to sharpen the profile"]
        : [],
  };
}
