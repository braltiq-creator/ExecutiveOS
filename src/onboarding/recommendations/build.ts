/**
 * Post-discovery recommendations for the executive.
 */

import type { DiscoveryItem, LearnedExecutiveProfile } from "@/onboarding/types";
import type {
  IntelligenceProfileId,
  ProfileRecommendation,
} from "@/profiles";
import { getIntelligenceProfile } from "@/profiles";

export type OnboardingRecommendation = {
  id: string;
  tenantId: string;
  title: string;
  why: string;
  urgency: "now" | "today" | "this_week";
};

export function buildOnboardingRecommendations(input: {
  tenantId: string;
  profile: LearnedExecutiveProfile;
  discoveries: DiscoveryItem[];
  profileRecommendation?: ProfileRecommendation | null;
  intelligenceProfileId?: IntelligenceProfileId | null;
}): OnboardingRecommendation[] {
  const intelligenceProfileId =
    input.intelligenceProfileId ??
    input.profileRecommendation?.profileId ??
    null;
  const intelligenceProfile = intelligenceProfileId
    ? getIntelligenceProfile(intelligenceProfileId)
    : null;

  const recs: OnboardingRecommendation[] = [
    {
      id: "rec-open-today",
      tenantId: input.tenantId,
      title: "Open your first Executive Briefing",
      why: intelligenceProfile
        ? `I've prepared a ${intelligenceProfile.name} briefing from what I learned — review and correct anything that looks off.`
        : "I've prepared Today from what I learned — review and correct anything that looks off.",
      urgency: "now",
    },
  ];

  if (input.profileRecommendation) {
    recs.push({
      id: "rec-profile",
      tenantId: input.tenantId,
      title: `Use the ${input.profileRecommendation.profileName} profile`,
      why: input.profileRecommendation.explanation,
      urgency: "now",
    });
  }

  if (input.discoveries.some((d) => d.status === "proposed")) {
    recs.push({
      id: "rec-validate",
      tenantId: input.tenantId,
      title: "Confirm a few discoveries",
      why: "Each confirmation improves how I brief you tomorrow.",
      urgency: "today",
    });
  }

  if (
    intelligenceProfileId === "operations_executive" ||
    input.profile.strategicFocus.includes("Operational Excellence")
  ) {
    recs.push({
      id: "rec-capacity",
      tenantId: input.tenantId,
      title: "Review capacity signals",
      why: "Operational excellence depends on field capacity staying visible.",
      urgency: "this_week",
    });
  }

  if (intelligenceProfileId === "commercial_executive") {
    recs.push({
      id: "rec-forecast",
      tenantId: input.tenantId,
      title: "Review forecast confidence",
      why: "Commercial leadership starts with honest forecast pressure.",
      urgency: "this_week",
    });
  }

  return recs;
}
