import type { PersonalisationPlan } from "@/adaptive/framework/types";
import { ensureAdaptiveProfile, getAdaptiveProfile } from "@/adaptive/preferences/store";
import type { IntelligenceProfileId } from "@/profiles";
import { appendLearningHistory } from "@/adaptive/governance/history";

const DEFAULT_SECTIONS = [
  "executive-value",
  "strategic-outcomes",
  "executive-summary",
  "overnight",
  "recommendations",
  "agenda",
  "supporting",
];

export function buildPersonalisationPlan(input: {
  tenantId: string;
  executiveId: string;
  profileId: IntelligenceProfileId;
}): PersonalisationPlan {
  const profile = ensureAdaptiveProfile(input);
  const sections = [...DEFAULT_SECTIONS];
  const preferred = profile.briefingBehaviour.preferredStartSection;
  if (preferred && sections.includes(preferred)) {
    sections.splice(sections.indexOf(preferred), 1);
    sections.unshift(preferred);
  }

  const insightPriority =
    input.profileId === "commercial_executive"
      ? "commercial"
      : input.profileId === "operations_executive"
        ? "operational"
        : "balanced";

  const plan: PersonalisationPlan = {
    tenantId: input.tenantId,
    executiveId: input.executiveId,
    briefSectionOrder: sections,
    recommendationOrdering: profile.enabled ? "learned" : "confidence_first",
    insightPriority:
      profile.businessFocus.includes("revenue") ? "commercial" : insightPriority,
    explanationDepth: profile.preferredDetailLevel,
    evidencePresentation:
      profile.preferredDetailLevel === "deep" ? "expanded" : "compact",
    notificationTiming:
      profile.workingHours.startHour <= 8 ? "morning" : "as_needed",
    reviewCadence:
      profile.reviewCompletionRate >= 60
        ? "daily"
        : profile.reviewCompletionRate >= 30
          ? "few_times_week"
          : "weekly",
    summaryStyle: profile.preferredCommunicationStyle,
    explanations: [
      ...profile.explanations,
      `Brief opens with “${sections[0]}” based on observed behaviour.`,
      `Explanation depth: ${profile.preferredDetailLevel}.`,
    ],
  };

  appendLearningHistory({
    tenantId: input.tenantId,
    executiveId: input.executiveId,
    category: "personalisation",
    summary: `Personalisation plan refreshed — ordering ${plan.recommendationOrdering}, depth ${plan.explanationDepth}`,
  });

  return plan;
}

export function getPersonalisationStatus(input: {
  tenantId: string;
  executiveId: string;
}): { active: boolean; summary: string } {
  const profile = getAdaptiveProfile(input.tenantId, input.executiveId);
  if (!profile) {
    return { active: false, summary: "No adaptive profile yet" };
  }
  return {
    active: profile.enabled,
    summary: profile.enabled
      ? `Learning confidence ${profile.learningConfidence}%`
      : "Adaptive learning disabled",
  };
}
