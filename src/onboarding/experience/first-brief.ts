/**
 * First Executive Brief — generated automatically after discovery.
 */

import type {
  DiscoveryItem,
  FirstExecutiveBrief,
  LearnedExecutiveProfile,
  OrganisationInference,
} from "@/onboarding/types";
import type { ConfidenceSummary } from "@/onboarding/confidence";

export function generateFirstExecutiveBrief(input: {
  tenantId: string;
  asOf: string;
  organisation: OrganisationInference;
  profile: LearnedExecutiveProfile;
  discoveries: DiscoveryItem[];
  confidence: ConfidenceSummary;
}): FirstExecutiveBrief {
  const confirmed = input.discoveries.filter((d) => d.status !== "ignored");
  const governance = confirmed
    .filter((d) =>
      ["board_meeting", "leadership_meeting", "governance_meeting"].includes(
        d.kind,
      ),
    )
    .map((d) => d.summary.replace(/^We've identified /, "").replace(/\.$/, ""));

  const relationships = confirmed
    .filter((d) => d.kind === "executive_team_member")
    .map((d) => d.editableValue ?? d.label);

  const customerRisks = confirmed
    .filter((d) => d.kind === "customer" || d.kind === "job")
    .slice(0, 3)
    .map((d) => d.summary);

  const operationalRisks = confirmed
    .filter((d) =>
      ["supplier", "asset", "technician", "project"].includes(d.kind),
    )
    .slice(0, 3)
    .map((d) => d.label);

  return {
    tenantId: input.tenantId,
    asOf: input.asOf,
    executiveSummary: [
      `I've learned ${input.organisation.organisationName} by connecting to your existing systems.`,
      `Your focus is ${input.profile.strategicFocus.join(", ").toLowerCase()}.`,
      `Operating rhythm: ${input.organisation.primaryOperatingRhythm}.`,
    ].join(" "),
    businessHealth:
      input.confidence.overall >= 70
        ? "Business signals are forming clearly from collaboration and operations."
        : "Early signals are in place — confidence will rise as systems sync.",
    operationalHealth: confirmed.some((d) => d.source === "simpro")
      ? "Operational platform connected — capacity, delivery, and cash signals are active."
      : "Connect your operational platform to enrich field intelligence.",
    strategicPriorities: input.profile.strategicFocus,
    executiveAgenda: [
      "Confirm today's priority decisions",
      "Protect focus around governance commitments",
      ...input.organisation.executiveResponsibilities.slice(0, 2),
    ],
    upcomingGovernance: governance.length
      ? governance
      : ["Leadership cadence to be confirmed"],
    keyRelationships: relationships.length
      ? relationships
      : ["Executive team mapping in progress"],
    customerRisks: customerRisks.length
      ? customerRisks
      : ["No elevated customer risks identified yet"],
    operationalRisks: operationalRisks.length
      ? operationalRisks
      : ["Operational risks will surface as field data syncs"],
    cashSignals: confirmed.some((d) => d.source === "simpro")
      ? ["Collections and invoice position under watch from operations"]
      : ["Cash signals available once operational systems connect"],
    capacitySignals: confirmed.some((d) => d.kind === "technician")
      ? ["Field capacity inferred from technician availability"]
      : ["Capacity signals pending operational sync"],
    strategicOpportunities: input.organisation.strategicThemes.slice(0, 3),
    confidenceSummary: `Discovery confidence ${input.confidence.discoveryConfidence}% · Organisation coverage ${input.confidence.organisationCoverage}% · Profile ${input.confidence.executiveProfileConfidence}%.`,
    whatWeLearned: [
      `Organisation: ${input.organisation.organisationName}`,
      `Scale: ${input.organisation.businessScale}`,
      `Complexity: ${input.organisation.operationalComplexity}`,
      `Decision style: ${input.profile.decisionStyle}`,
      `Briefing style: ${input.profile.briefingStyle}`,
      ...confirmed.slice(0, 4).map((d) => d.summary),
    ],
  };
}
