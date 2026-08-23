import type { UsageValueSection } from "@/organisation-portal/types";

export function buildUsageValueSection(input: {
  organisationName: string;
  executivesActive: number;
  packsInstalled: number;
  connectorsConnected: number;
}): UsageValueSection {
  const base =
    55 +
    input.executivesActive * 8 +
    input.packsInstalled * 10 +
    input.connectorsConnected * 6;
  const executiveValueScore = Math.min(96, base);

  return {
    executiveValueScore,
    roiLabel:
      executiveValueScore >= 80
        ? "Strong early ROI signal"
        : "Building measurable value",
    hoursSaved: 6 + input.executivesActive * 4 + input.connectorsConnected * 3,
    recommendationsAccepted: 3 + input.executivesActive * 2,
    businessOutcomes: [
      "Clearer morning judgement surface",
      "Faster cross-functional decisions",
      `${input.organisationName} executive rhythm establishing`,
    ],
    adoption: {
      score: Math.min(95, 50 + input.executivesActive * 12 + input.connectorsConnected * 8),
      label:
        input.executivesActive > 1 ? "Expanding adoption" : "Owner activated",
    },
    health: {
      score: Math.min(94, 70 + input.packsInstalled * 8),
      label: "Organisation health positive",
    },
  };
}
