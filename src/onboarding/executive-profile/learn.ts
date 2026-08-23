/**
 * Adaptive Executive Profile — learned through interaction, not questionnaires.
 */

import type {
  LearnedExecutiveProfile,
  MinimumQuestions,
  PrimaryObjectiveOption,
} from "@/onboarding/types";

const FOCUS_BY_OBJECTIVE: Record<PrimaryObjectiveOption, string[]> = {
  Growth: ["Pipeline", "Market expansion", "Capacity to scale"],
  Profitability: ["Margin", "Cash", "Cost discipline"],
  "Operational Excellence": ["Delivery", "Capacity", "Reliability"],
  "Customer Experience": ["Service quality", "Relationships", "Retention"],
  Safety: ["Risk", "Compliance", "Field safety"],
  Innovation: ["Capability", "Change", "Future options"],
};

export function learnExecutiveProfile(input: {
  tenantId: string;
  userId: string;
  questions: MinimumQuestions;
  discoveryCount: number;
  averageConfidence: number;
}): LearnedExecutiveProfile {
  const role = input.questions.role;
  const decisionStyle =
    role === "CEO" || role === "Managing Director" || role === "Owner"
      ? "Decisive with selective deep-dives"
      : role === "CFO"
        ? "Evidence-led and financially framed"
        : role === "COO"
          ? "Operationally grounded and sequential"
          : "Practical and outcome-oriented";

  const informationDensity =
    role === "CFO" ? "detailed" : role === "COO" ? "balanced" : "concise";

  const riskTolerance =
    input.questions.primaryObjective === "Safety" ||
    input.questions.primaryObjective === "Profitability"
      ? "conservative"
      : input.questions.primaryObjective === "Growth" ||
          input.questions.primaryObjective === "Innovation"
        ? "assertive"
        : "balanced";

  const confidence = Math.min(
    92,
    Math.round(
      40 +
        input.averageConfidence * 0.35 +
        Math.min(20, input.discoveryCount) +
        8,
    ),
  );

  return {
    tenantId: input.tenantId,
    userId: input.userId,
    decisionStyle,
    communicationPreference:
      input.questions.briefingTime === "Morning"
        ? "Morning brief, exceptions through the day"
        : "Afternoon synthesis with overnight capture",
    meetingPreference: "Protect focus blocks; elevate governance only",
    informationDensity,
    riskTolerance,
    strategicFocus: FOCUS_BY_OBJECTIVE[input.questions.primaryObjective],
    notificationPreference: "Critical and decision-ready only",
    briefingStyle:
      informationDensity === "concise"
        ? "Lead judgement first, detail on demand"
        : "Structured chapters with evidence links",
    confidence,
    corrections: [],
  };
}

export function correctExecutiveProfile(
  profile: LearnedExecutiveProfile,
  field: keyof LearnedExecutiveProfile,
  value: string,
  asOf: string,
): LearnedExecutiveProfile {
  return {
    ...profile,
    [field]: value as never,
    confidence: Math.min(98, profile.confidence + 2),
    corrections: [
      ...profile.corrections,
      { field: String(field), value, at: asOf },
    ].slice(-20),
  };
}
