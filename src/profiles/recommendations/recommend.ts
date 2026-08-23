/**
 * Recommend an Intelligence Profile from discovery signals.
 * Integrations stay invisible — executives hear the outcome.
 */

import type {
  ExecutiveRoleOption,
  PrimaryObjectiveOption,
} from "@/onboarding/types";
import type {
  IntelligenceProfileId,
  ProfileRecommendation,
  ProviderId,
} from "@/profiles/framework/types";
import { getIntelligenceProfile } from "@/profiles/catalog";

export function recommendIntelligenceProfile(input: {
  role?: ExecutiveRoleOption | string;
  primaryObjective?: PrimaryObjectiveOption | string;
  industry?: string;
  connectedProviders?: ProviderId[];
}): ProfileRecommendation {
  const connected = new Set(input.connectedProviders ?? []);
  const role = (input.role ?? "").toLowerCase();
  const objective = (input.primaryObjective ?? "").toLowerCase();
  const industry = (input.industry ?? "").toLowerCase();

  let operationsScore = 40;
  let commercialScore = 40;

  if (connected.has("simpro")) operationsScore += 35;
  if (connected.has("salesforce")) commercialScore += 35;
  if (connected.has("microsoft365")) {
    operationsScore += 5;
    commercialScore += 5;
  }

  if (
    /coo|operations|owner|managing director/.test(role) ||
    role === "operations manager"
  ) {
    operationsScore += 20;
  }
  if (/ceo|cro|vp sales|revenue/.test(role)) {
    commercialScore += 20;
  }
  if (role.includes("managing director")) {
    // MD can go either way — lean on systems
    operationsScore += 5;
    commercialScore += 5;
  }

  if (
    /operational|safety|customer experience/.test(objective) ||
    objective.includes("operational excellence")
  ) {
    operationsScore += 15;
  }
  if (/growth|profitability|innovation/.test(objective)) {
    commercialScore += 15;
  }

  if (/field|trade|facilit|asset|service/.test(industry)) {
    operationsScore += 15;
  }
  if (/tech|saas|software|b2b|professional/.test(industry)) {
    commercialScore += 10;
  }

  const profileId: IntelligenceProfileId =
    operationsScore >= commercialScore
      ? "operations_executive"
      : "commercial_executive";
  const profile = getIntelligenceProfile(profileId);
  const altId: IntelligenceProfileId =
    profileId === "operations_executive"
      ? "commercial_executive"
      : "operations_executive";
  const alt = getIntelligenceProfile(altId);

  const confidence = Math.min(
    95,
    Math.max(55, Math.abs(operationsScore - commercialScore) + 55),
  );

  const explanation =
    profileId === "operations_executive"
      ? connected.has("simpro")
        ? "We recommend the Operations Executive profile because your organisation primarily operates using Simpro."
        : /coo|operations|owner/.test(role) ||
            objective.includes("operational")
          ? "We recommend the Operations Executive profile because your role and focus centre on operating the business."
          : "We recommend the Operations Executive profile for overnight operational health, capacity, and delivery risk."
      : connected.has("salesforce")
        ? "We recommend the Commercial Executive profile because Salesforce is your primary commercial platform."
        : /ceo|cro|vp sales|revenue/.test(role) ||
            /growth|profitability/.test(objective)
          ? "We recommend the Commercial Executive profile because your focus centres on revenue and growth."
          : "We recommend the Commercial Executive profile for forecast, pipeline, and strategic account intelligence.";

  return {
    profileId,
    profileName: profile.name,
    confidence,
    explanation,
    alternatives: [
      {
        profileId: altId,
        profileName: alt.name,
        why:
          altId === "operations_executive"
            ? "Choose this if overnight operational health and delivery risk are your primary bind."
            : "Choose this if forecast, pipeline, and strategic accounts are your primary bind.",
      },
    ],
  };
}
