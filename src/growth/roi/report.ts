import type { ExecutiveValueReport } from "@/growth/framework/types";
import {
  computeExecutiveValueScore,
  listValueEstimates,
} from "@/growth/executive-value";

const reports = new Map<string, ExecutiveValueReport>();
let seq = 0;

export function resetGrowthRoiReports(): void {
  reports.clear();
  seq = 0;
}

export function generateExecutiveValueReport(input: {
  organizationId: string;
  period?: ExecutiveValueReport["period"];
}): ExecutiveValueReport {
  const evs = computeExecutiveValueScore({
    organizationId: input.organizationId,
  });
  const estimates = listValueEstimates(input.organizationId);
  const period = input.period ?? "monthly";
  seq += 1;

  const report: ExecutiveValueReport = {
    id: `groi-${seq}`,
    organizationId: input.organizationId,
    asOf: evs.asOf,
    period,
    financialValue:
      evs.breakdown.revenueGenerated +
      evs.breakdown.revenueProtected +
      evs.breakdown.costSavings,
    operationalValue: evs.breakdown.operationalEfficiency,
    strategicValue: evs.breakdown.strategicOutcomeContribution,
    timeSavingsHours: evs.breakdown.executiveHoursSaved,
    recommendationsAdopted:
      estimates.find((e) => e.dimension === "recommendation_adoption")
        ?.amount ?? 0,
    businessOutcomes:
      estimates.find((e) => e.dimension === "business_outcomes_confirmed")
        ?.amount ?? 0,
    confidence: evs.confidence,
    evidence: estimates.flatMap((e) => e.evidence).slice(0, 8),
    narrative: `In the last period ExecutiveOS delivered an estimated $${evs.last30Days.toLocaleString()} in financial value signals, ${evs.breakdown.executiveHoursSaved} executive hours saved, and ${evs.breakdown.strategicOutcomeContribution}% strategic outcome contribution — with ${evs.confidence}% average confidence.`,
    suitableFor: [
      "monthly_review",
      "executive_meeting",
      "board_pack",
      "renewal",
    ],
  };
  reports.set(report.id, report);
  return report;
}

export function listGrowthRoiReports(
  organizationId: string,
): ExecutiveValueReport[] {
  return [...reports.values()]
    .filter((r) => r.organizationId === organizationId)
    .sort((a, b) => b.asOf.localeCompare(a.asOf));
}
