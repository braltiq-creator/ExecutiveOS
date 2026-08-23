import type {
  CommercialEditionId,
  CustomerRoiReport,
  RoiEstimateRange,
} from "@/commercial/framework/types";
import { extractTenantTelemetry } from "@/operations";
import { getEdition } from "@/commercial/editions";

const reports = new Map<string, CustomerRoiReport>();
let seq = 0;

export function resetRoiReports(): void {
  reports.clear();
  seq = 0;
}

function range(
  mid: number,
  unit: RoiEstimateRange["unit"],
  confidence: number,
  evidence: string[],
  spread = 0.2,
): RoiEstimateRange {
  return {
    low: Math.max(0, Math.round(mid * (1 - spread))),
    mid: Math.round(mid),
    high: Math.round(mid * (1 + spread)),
    unit,
    confidence,
    evidence,
  };
}

export function generateCustomerRoiReport(input: {
  tenantId: string;
  editionId: CommercialEditionId;
  asOf?: string;
}): CustomerRoiReport {
  const asOf = input.asOf ?? new Date().toISOString();
  const edition = getEdition(input.editionId);
  const t = extractTenantTelemetry({
    tenantId: input.tenantId,
    profileId: edition?.intelligenceProfileId ?? "operations_executive",
    asOf,
  });

  const hours =
    t.averageSessionMinutes *
    0.35 *
    Math.max(1, t.dailyActiveExecutives) *
    20;
  const adopted = t.recommendationsAccepted * 4;
  const outcomes = Math.round(t.validationProgressPct / 12);
  const decisionConfidence = t.recommendationAccuracy;
  const operational =
    input.editionId === "operations_executive"
      ? Math.round((t.readinessScore + t.engagementPct) / 2)
      : Math.round(t.engagementPct * 0.6);
  const commercial =
    input.editionId === "commercial_executive"
      ? Math.round((t.recommendationAccuracy + t.engagementPct) / 2)
      : Math.round(t.engagementPct * 0.55);
  const strategic = Math.round(
    (t.learningProgress + t.discoveryCoveragePct) / 2,
  );

  seq += 1;
  const report: CustomerRoiReport = {
    id: `roi-${seq}`,
    tenantId: input.tenantId,
    editionId: input.editionId,
    asOf,
    executiveHoursSaved: range(hours, "hours", 68, [
      "Session length × active executives × estimated briefing compression",
    ]),
    recommendationsAdopted: range(adopted, "count", 72, [
      "Anonymised acceptance counts from operational telemetry",
    ]),
    businessOutcomesConfirmed: range(outcomes, "count", 64, [
      "Validation progress proxy — not customer revenue figures",
    ]),
    decisionConfidence: range(decisionConfidence, "percent", 70, [
      "Recommendation quality / usefulness signals",
    ]),
    operationalImprovements: range(operational, "score", 66, [
      input.editionId === "operations_executive"
        ? "Operations edition readiness + engagement"
        : "Cross-edition engagement proxy",
    ]),
    commercialImprovements: range(commercial, "score", 66, [
      input.editionId === "commercial_executive"
        ? "Commercial edition quality + engagement"
        : "Cross-edition engagement proxy",
    ]),
    strategicProgress: range(strategic, "percent", 63, [
      "Learning progress and discovery coverage",
    ]),
    narrative: `Value estimate for ${edition?.name ?? input.editionId}: executives save time on morning orientation while adoption and confidence signals indicate ${edition?.name ?? "the edition"} is creating measurable decision leverage. Ranges reflect model uncertainty — not contractual guarantees.`,
  };

  reports.set(report.id, report);
  return report;
}

export function listRoiReports(tenantId?: string): CustomerRoiReport[] {
  return [...reports.values()]
    .filter((r) => (tenantId ? r.tenantId === tenantId : true))
    .sort((a, b) => b.asOf.localeCompare(a.asOf));
}
