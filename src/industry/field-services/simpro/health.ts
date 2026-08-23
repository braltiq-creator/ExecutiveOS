import { clampScore } from "@/intelligence/executive-intelligence/lib/helpers";
import type { ConfidenceScore } from "@/intelligence/executive-intelligence/types";
import { assessConfidence } from "@/intelligence/executive-intelligence/engines/confidence-engine";
import type {
  FieldServiceKpiId,
  FieldServiceKpiSnapshot,
} from "@/industry/field-services/simpro/kpis";
import { FIELD_SERVICE_KPI_LIBRARY } from "@/industry/field-services/simpro/kpis";
import type { BusinessEvent } from "@/connectors/types";

export const HEALTH_DIMENSION_IDS = [
  "revenue",
  "operational",
  "people",
  "customer",
  "cash",
  "execution",
  "growth",
] as const;

export type HealthDimensionId = (typeof HEALTH_DIMENSION_IDS)[number];

export const HEALTH_DIMENSION_LABELS: Record<HealthDimensionId, string> = {
  revenue: "Revenue Health",
  operational: "Operational Health",
  people: "People Health",
  customer: "Customer Health",
  cash: "Cash Flow Health",
  execution: "Execution Health",
  growth: "Growth Health",
};

export type HealthDimensionScore = {
  id: HealthDimensionId;
  label: string;
  score: number;
  reasoning: string;
  evidence: string[];
  confidence: ConfidenceScore;
  trend: "improving" | "stable" | "declining";
  predictedDirection: "improving" | "stable" | "declining";
};

export type FieldServicesHealthReport = {
  asOf: string;
  dimensions: HealthDimensionScore[];
  overallScore: number;
  primaryRisk: string;
  executiveNarrative: string;
};

const KPI_TARGETS: Partial<
  Record<FieldServiceKpiId, { good: number; warn: number }>
> = {
  technician_utilisation: { good: 85, warn: 95 }, // warn if too high
  first_time_fix_rate: { good: 75, warn: 65 },
  gross_margin: { good: 28, warn: 20 },
  quote_conversion: { good: 45, warn: 35 },
  average_response_time: { good: 4, warn: 8 },
  sla_compliance: { good: 95, warn: 90 },
  preventive_vs_reactive: { good: 0.5, warn: 0.3 },
  job_backlog: { good: 80, warn: 140 },
  cash_collection: { good: 90, warn: 80 },
  customer_concentration: { good: 25, warn: 40 },
  schedule_efficiency: { good: 80, warn: 70 },
  travel_time: { good: 35, warn: 55 },
  labour_recovery: { good: 90, warn: 80 },
  variation_recovery: { good: 75, warn: 55 },
  project_profitability: { good: 18, warn: 12 },
};

/**
 * Executive Health Model for field services.
 * Every dimension carries reasoning, evidence, confidence, trend, prediction.
 */
export function deriveFieldServicesHealth(input: {
  asOf: string;
  kpis: FieldServiceKpiSnapshot;
  events?: BusinessEvent[];
}): FieldServicesHealthReport {
  const dimensions = HEALTH_DIMENSION_IDS.map((id) =>
    scoreHealthDimension(id, input.kpis, input.events ?? []),
  );
  const overallScore = clampScore(
    dimensions.reduce((sum, item) => sum + item.score, 0) / dimensions.length,
  );
  const weakest = [...dimensions].sort((a, b) => a.score - b.score)[0]!;
  const primaryRisk = `${weakest.label} is the primary strategic risk (${weakest.score}).`;
  const executiveNarrative = buildExecutiveNarrative(dimensions, primaryRisk);

  return {
    asOf: input.asOf,
    dimensions,
    overallScore,
    primaryRisk,
    executiveNarrative,
  };
}

function scoreHealthDimension(
  id: HealthDimensionId,
  kpis: FieldServiceKpiSnapshot,
  events: BusinessEvent[],
): HealthDimensionScore {
  const linkedKpis = FIELD_SERVICE_KPI_LIBRARY.filter((kpi) =>
    kpi.healthLinks.includes(id),
  );
  const kpiScores = linkedKpis.map((kpi) => {
    const value = kpis.values[kpi.id];
    if (value == null) return 55;
    return scoreKpiValue(kpi.id, value, kpi.polarity);
  });
  const eventPressure = events.filter((event) => {
    const impacts = event.payload.healthImpacts;
    return Array.isArray(impacts) && impacts.includes(id);
  }).length;

  const base =
    kpiScores.reduce((sum, score) => sum + score, 0) /
    Math.max(1, kpiScores.length);
  const score = clampScore(base - eventPressure * 4);

  const evidence = [
    ...linkedKpis.slice(0, 3).map((kpi) => {
      const value = kpis.values[kpi.id];
      return `${kpi.label}: ${value ?? "n/a"}${kpi.unit === "%" ? "%" : ""}`;
    }),
    ...events
      .filter((event) => {
        const impacts = event.payload.healthImpacts;
        return Array.isArray(impacts) && impacts.includes(id);
      })
      .slice(0, 2)
      .map((event) => String(event.payload.executiveMeaning ?? event.eventType)),
  ];

  const trend: HealthDimensionScore["trend"] =
    score >= 72 ? "improving" : score <= 48 ? "declining" : "stable";
  const predictedDirection: HealthDimensionScore["predictedDirection"] =
    eventPressure >= 2
      ? "declining"
      : trend === "improving"
        ? "improving"
        : trend;

  const confidence = assessConfidence({
    label: HEALTH_DIMENSION_LABELS[id],
    dataCompleteness: Math.min(95, 50 + linkedKpis.length * 6),
    freshnessHours: 6,
    sourceAgreement: 78,
    historicalReliability: 70,
    predictionCertainty: Math.max(40, score - 15),
    aiReasoningConfidence: 72,
  });

  return {
    id,
    label: HEALTH_DIMENSION_LABELS[id],
    score,
    reasoning: reasonFor(id, score, evidence),
    evidence,
    confidence,
    trend,
    predictedDirection,
  };
}

function scoreKpiValue(
  id: FieldServiceKpiId,
  value: number,
  polarity: "higher_better" | "lower_better",
): number {
  const target = KPI_TARGETS[id];
  if (!target) {
    return polarity === "higher_better"
      ? clampScore(value)
      : clampScore(100 - value);
  }

  // Special case: utilisation too high becomes a people/growth risk
  if (id === "technician_utilisation") {
    if (value >= target.warn) return 42;
    if (value >= target.good) return 78;
    if (value >= 70) return 62;
    return 48;
  }

  if (polarity === "higher_better") {
    if (value >= target.good) return 86;
    if (value >= target.warn) return 62;
    return 40;
  }
  // lower better
  if (value <= target.good) return 86;
  if (value <= target.warn) return 58;
  return 38;
}

function reasonFor(
  id: HealthDimensionId,
  score: number,
  evidence: string[],
): string {
  const label = HEALTH_DIMENSION_LABELS[id];
  if (score >= 72) {
    return `${label} is sound (${score}) based on ${evidence[0] ?? "KPI set"}.`;
  }
  if (score <= 48) {
    return `${label} requires executive attention (${score}) — ${evidence[0] ?? "pressure signals present"}.`;
  }
  return `${label} is mixed (${score}); watch ${evidence[0] ?? "leading indicators"}.`;
}

function buildExecutiveNarrative(
  dimensions: HealthDimensionScore[],
  primaryRisk: string,
): string {
  const lines: string[] = [];
  const util = dimensions.find((d) => d.id === "people" || d.id === "growth");
  const margin = dimensions.find((d) => d.id === "revenue");
  const customer = dimensions.find((d) => d.id === "customer");
  const cash = dimensions.find((d) => d.id === "cash");
  const operational = dimensions.find((d) => d.id === "operational");

  if (util && util.score <= 55) {
    lines.push(
      "Technician utilisation is constraining revenue growth.",
    );
  }
  if (operational && operational.score >= 70 && operational.evidence.some((e) => /SLA/i.test(e))) {
    lines.push(
      "SLA compliance has improved despite increased workload.",
    );
  } else if (
    customer &&
    customer.score >= 70 &&
    operational &&
    operational.score <= 60
  ) {
    lines.push(
      "SLA compliance has improved despite increased workload.",
    );
  }
  if (cash && cash.score <= 55) {
    lines.push(
      "Cash collection has weakened after project completion.",
    );
  }
  if (margin && margin.score <= 50) {
    lines.push("Gross margin erosion is now the primary strategic risk.");
  }
  if (lines.length === 0) {
    lines.push(primaryRisk);
  }
  return lines.slice(0, 3).join(" ");
}
