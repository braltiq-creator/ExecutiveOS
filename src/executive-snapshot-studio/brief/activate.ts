/**
 * Activate existing platform capabilities — no new reasoning.
 */

import { activateDomainAdvisorsForIndustry } from "@/domain-advisors";
import type {
  StudioBriefPreview,
  StudioBusinessProfileId,
  StudioIntelligenceActivation,
  StudioReadiness,
} from "../types";
import { getStudioProfileLabel } from "../profile-detection";

export function activateStudioIntelligence(input: {
  profileId: StudioBusinessProfileId;
  industryLabel: string;
  readiness: StudioReadiness;
  recordCount: number;
  organisationName?: string;
}): StudioIntelligenceActivation {
  const advisors = activateDomainAdvisorsForIndustry(input.industryLabel);
  const advisorNames =
    advisors.fullAdvisors.length > 0
      ? advisors.fullAdvisors.map((a) => a.identity.name)
      : (advisors.catalogue?.entries.map((e) => e.name) ?? []).slice(0, 8);

  const label = getStudioProfileLabel(input.profileId);
  const org = input.organisationName ?? "your organisation";

  return {
    activatedAt: new Date().toISOString(),
    profileId: input.profileId,
    industryLabel: input.industryLabel,
    councilStatus: "Executive Council ready to convene",
    advisorNames:
      advisorNames.length > 0
        ? advisorNames
        : [
            "Manufacturing Advisor",
            "Demand Planning Advisor",
            "Supply Chain Advisor",
          ].slice(0, input.profileId === "manufacturing" ? 3 : 2),
    outcomeEngine: "ready",
    judgementFramework: "ready",
    briefGenerated: true,
    commandCentreHref: "/today",
    narrative: `${label} is active for ${org}. ${input.recordCount} records now inform Outcome Engine, Council, and Domain Advisors — Command Centre is ready.`,
  };
}

export function buildStudioBriefPreview(input: {
  profileId: StudioBusinessProfileId;
  readiness: StudioReadiness;
  confidenceOverall: number;
  recordCount: number;
  intelligence: StudioIntelligenceActivation;
}): StudioBriefPreview {
  const profileLabel = getStudioProfileLabel(input.profileId);
  const judgementCount = Math.max(
    1,
    Math.min(5, Math.round((100 - input.readiness.executiveReadiness) / 18) + 2),
  );

  return {
    title: "Executive Brief generated",
    summary: input.intelligence.narrative,
    readiness: input.readiness.executiveReadiness,
    confidence: input.confidenceOverall,
    judgementCount,
    profileLabel,
    whatChanged: [
      `Business context ingested (${input.recordCount} records).`,
      `${profileLabel} selected for this organisation.`,
      `Executive Readiness scored at ${input.readiness.executiveReadiness}%.`,
    ],
    whatRequiresJudgement: [
      `${judgementCount} priority decisions are prepared in the Command Centre.`,
      "Council perspectives and Domain Advisor observations are available for review.",
      "Open Command Centre to operate the business — not the spreadsheet.",
    ],
    commandCentreHref: "/today",
  };
}
