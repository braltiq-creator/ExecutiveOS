/**
 * Organisation inference from discoveries + connected system evidence.
 */

import type { DiscoveryItem, OrganisationInference } from "@/onboarding/types";

export function inferOrganisation(input: {
  tenantId: string;
  discoveries: DiscoveryItem[];
  /** ExecutiveOS account organisation name — not external-system evidence. */
  knownOrganisationName?: string;
}): OrganisationInference {
  const discoveredName = input.discoveries.find(
    (d) => d.kind === "organisation_name",
  )?.label;
  const knownName = input.knownOrganisationName?.trim();
  const name = discoveredName ?? (knownName || "Your organisation");

  const leaders = input.discoveries
    .filter((d) => d.kind === "executive_team_member")
    .map((d) => d.editableValue ?? d.label);

  const themes = input.discoveries
    .filter((d) =>
      ["project", "strategic_theme", "customer"].includes(d.kind),
    )
    .map((d) => d.label)
    .slice(0, 4);

  const hasOps = input.discoveries.some((d) => d.source === "simpro");
  const hasCollab = input.discoveries.some((d) => d.source === "microsoft365");

  const confidences = input.discoveries.map((d) => d.confidence);
  const confidence =
    confidences.length === 0
      ? 0
      : Math.round(
          confidences.reduce((a, b) => a + b, 0) / confidences.length,
        );

  return {
    tenantId: input.tenantId,
    organisationName: name,
    reportingLines: leaders.length
      ? [`CEO → ${leaders[0]}`, "CEO → Finance", "CEO → Commercial"]
      : ["CEO → Executive team"],
    leadershipHierarchy: ["CEO", ...leaders.map((l) => l.split("—")[0]?.trim() ?? l)],
    operationalStructure: hasOps
      ? ["Field operations", "Projects", "Service delivery"]
      : ["Corporate functions"],
    businessScale: hasOps
      ? "Multi-site field services enterprise"
      : "Knowledge organisation",
    operationalComplexity: hasOps && hasCollab ? "high" : hasOps ? "moderate" : "low",
    executiveResponsibilities: [
      "Strategic priorities",
      "Governance cadence",
      ...(hasOps ? ["Operational capacity", "Customer delivery"] : []),
    ],
    strategicThemes: themes.length
      ? themes
      : ["Growth", "Operational excellence"],
    primaryOperatingRhythm:
      input.discoveries.find((d) => d.kind === "operating_rhythm")?.label ??
      "Weekly leadership rhythm",
    confidence,
    evidence: input.discoveries.flatMap((d) => d.evidence).slice(0, 8),
  };
}
