/**
 * Profile-specific validation scenarios for Design Partner success criteria.
 */

import type { IntelligentExecutiveSnapshot } from "@/intelligence/executive-intelligence/types";
import type { IntelligenceProfileId } from "@/profiles/framework/types";
import { getIntelligenceProfile } from "@/profiles/catalog";

export type ProfileScenarioResult = {
  id: string;
  label: string;
  profileId: IntelligenceProfileId;
  passed: boolean;
  evidence: string[];
  explanation: string;
};

export type ProfileValidationReport = {
  profileId: IntelligenceProfileId;
  profileName: string;
  asOf: string;
  tenantId: string;
  scenarios: ProfileScenarioResult[];
  passCount: number;
  totalCount: number;
  ready: boolean;
};

export function runProfileValidationScenarios(input: {
  tenantId: string;
  profileId: IntelligenceProfileId;
  snapshot: IntelligentExecutiveSnapshot;
  asOf?: string;
}): ProfileValidationReport {
  const asOf = input.asOf ?? input.snapshot.asOf;
  const profile = getIntelligenceProfile(input.profileId);
  const scenarios =
    input.profileId === "operations_executive"
      ? runOperationsScenarios(input.snapshot)
      : runCommercialScenarios(input.snapshot);

  const passCount = scenarios.filter((s) => s.passed).length;
  return {
    profileId: input.profileId,
    profileName: profile.name,
    asOf,
    tenantId: input.tenantId,
    scenarios,
    passCount,
    totalCount: scenarios.length,
    ready: passCount === scenarios.length,
  };
}

function runOperationsScenarios(
  snapshot: IntelligentExecutiveSnapshot,
): ProfileScenarioResult[] {
  const ops = snapshot.operationalContextBrief;
  return [
    {
      id: "ops-bottlenecks",
      label: "Can ExecutiveOS identify operational bottlenecks?",
      profileId: "operations_executive",
      passed: Boolean(ops && ops.bottlenecks.length > 0),
      evidence: ops?.bottlenecks.slice(0, 3).map((b) => b.title) ?? [],
      explanation: ops
        ? ops.bottlenecks.length > 0
          ? `Identified ${ops.bottlenecks.length} bottleneck(s).`
          : "Operational brief present but no bottlenecks flagged."
        : "Operational context unavailable.",
    },
    {
      id: "ops-delivery-risk",
      label: "Can it predict delivery risk?",
      profileId: "operations_executive",
      passed: Boolean(
        ops && (ops.jobsAtRisk.length > 0 || ops.serviceDelivery.criticalJobs > 0),
      ),
      evidence: [
        ...(ops?.jobsAtRisk.slice(0, 2).map((j) => j.title) ?? []),
        ops
          ? `${ops.serviceDelivery.criticalJobs} critical open`
          : "No service delivery signal",
      ],
      explanation: ops
        ? "Delivery risk derived from jobs at risk and critical commitments."
        : "Operational context unavailable.",
    },
    {
      id: "ops-technician-constraints",
      label: "Can it identify technician constraints?",
      profileId: "operations_executive",
      passed: Boolean(
        ops &&
          (ops.capacity.unavailableTechnicians > 0 ||
            ops.technicianUtilisation.utilisedPct > 0),
      ),
      evidence: [
        ops?.capacity.detail ?? "No capacity",
        ops?.technicianUtilisation.detail ?? "No utilisation",
      ],
      explanation: ops
        ? "Technician constraints visible via capacity and utilisation."
        : "Operational context unavailable.",
    },
  ];
}

function runCommercialScenarios(
  snapshot: IntelligentExecutiveSnapshot,
): ProfileScenarioResult[] {
  const commercial = snapshot.commercialContextBrief;
  return [
    {
      id: "commercial-forecast-risk",
      label: "Can ExecutiveOS identify forecast risk?",
      profileId: "commercial_executive",
      passed: Boolean(
        commercial &&
          (commercial.revenueForecast.accuracyPct < 80 ||
            commercial.commercialRisks.some((r) => r.kind === "forecast") ||
            commercial.largeDealsAtRisk.length > 0),
      ),
      evidence: [
        commercial
          ? `Forecast confidence ${commercial.revenueForecast.accuracyPct}%`
          : "No forecast",
        ...(commercial?.largeDealsAtRisk.slice(0, 1).map((d) => d.title) ?? []),
      ],
      explanation: commercial
        ? "Forecast risk derived from confidence and at-risk pursuits."
        : "Commercial context unavailable.",
    },
    {
      id: "commercial-strategic-accounts",
      label: "Can it identify strategic account issues?",
      profileId: "commercial_executive",
      passed: Boolean(
        commercial &&
          (commercial.strategicAccounts.length > 0 ||
            commercial.renewalRisks.length > 0),
      ),
      evidence:
        commercial?.strategicAccounts.slice(0, 3).map((a) => a.name) ?? [],
      explanation: commercial
        ? "Strategic account attention derived from commercial context."
        : "Commercial context unavailable.",
    },
    {
      id: "commercial-executive-intervention",
      label: "Can it recommend executive intervention?",
      profileId: "commercial_executive",
      passed: Boolean(
        commercial &&
          commercial.recommendations.some(
            (r) => r.urgency === "now" || r.urgency === "today",
          ),
      ),
      evidence:
        commercial?.recommendations.slice(0, 3).map((r) => r.title) ?? [],
      explanation: commercial
        ? "Executive recommendations prioritised for intervention."
        : "Commercial context unavailable.",
    },
  ];
}
