import type {
  IntelligentExecutiveSnapshot,
  PulseResult,
} from "@/intelligence/executive-intelligence/types";
import { ensureSentence } from "@/intelligence/executive-intelligence/lib/helpers";
import {
  deriveFieldServicesHealth,
  type FieldServicesHealthReport,
} from "@/industry/field-services/simpro/health";
import {
  MOCK_FIELD_SERVICE_KPIS,
  type FieldServiceKpiSnapshot,
} from "@/industry/field-services/simpro/kpis";
import {
  applyFieldServiceJudgementRules,
  type JudgementRuleHit,
} from "@/industry/field-services/simpro/rules";
import {
  compareToBenchmark,
  type BenchmarkComparison,
} from "@/industry/field-services/simpro/benchmarks";
import type { BusinessEvent } from "@/connectors/types";
import type { EnterpriseDigitalTwin } from "@/digital-twin";

export type FieldServicesIndustryContext = {
  health: FieldServicesHealthReport;
  ruleHits: JudgementRuleHit[];
  benchmark?: BenchmarkComparison | null;
  kpis: FieldServiceKpiSnapshot;
};

/**
 * Enrich Business Pulse + narrative with field-service executive language.
 * Does not create a Simpro dashboard — interprets for the CEO.
 */
export function applyFieldServicesIndustry(input: {
  snapshot: IntelligentExecutiveSnapshot;
  kpis?: FieldServiceKpiSnapshot;
  twin?: EnterpriseDigitalTwin;
  events?: BusinessEvent[];
  benchmarkId?: string;
}): {
  snapshot: IntelligentExecutiveSnapshot;
  industry: FieldServicesIndustryContext;
} {
  const kpis = input.kpis ?? extractKpisFromTwin(input.twin) ?? MOCK_FIELD_SERVICE_KPIS;
  const events = input.events ?? input.twin?.history() ?? [];
  const health = deriveFieldServicesHealth({
    asOf: input.snapshot.asOf,
    kpis,
    events,
  });
  const ruleHits = applyFieldServiceJudgementRules({ kpis, health });
  const benchmark = input.benchmarkId
    ? compareToBenchmark({
        benchmarkId: input.benchmarkId,
        actual: {
          technician_utilisation: kpis.values.technician_utilisation,
          first_time_fix_rate: kpis.values.first_time_fix_rate,
          gross_margin: kpis.values.gross_margin,
          sla_compliance: kpis.values.sla_compliance,
          quote_conversion: kpis.values.quote_conversion,
          cash_collection: kpis.values.cash_collection,
        },
      })
    : compareToBenchmark({
        benchmarkId: "bench-medium",
        actual: {
          technician_utilisation: kpis.values.technician_utilisation,
          first_time_fix_rate: kpis.values.first_time_fix_rate,
          gross_margin: kpis.values.gross_margin,
          sla_compliance: kpis.values.sla_compliance,
          quote_conversion: kpis.values.quote_conversion,
          cash_collection: kpis.values.cash_collection,
        },
      });

  const pulse = enrichPulse(input.snapshot.pulse, health, ruleHits);
  const narrative = {
    ...input.snapshot.narrative,
    executiveSummary: clipWords(
      [
        health.executiveNarrative,
        ruleHits[0]?.executiveImplication,
        input.snapshot.narrative.executiveSummary,
      ]
        .filter(Boolean)
        .join(" "),
      60,
    ),
    executiveBrief: ensureSentence(
      [
        health.executiveNarrative,
        ...ruleHits.slice(0, 2).map((hit) => hit.executiveImplication),
        input.snapshot.narrative.executiveBrief,
      ].join(" "),
    ),
    sinceYesterday: [
      {
        id: "since-fs-health",
        sentence: ensureSentence(health.executiveNarrative),
        href: "/today",
      },
      ...input.snapshot.narrative.sinceYesterday.filter(
        (item) => item.id !== "since-quiet",
      ),
    ].slice(0, 3),
  };

  return {
    snapshot: {
      ...input.snapshot,
      pulse,
      narrative,
      greeting: input.snapshot.greeting,
    },
    industry: { health, ruleHits, benchmark, kpis },
  };
}

function enrichPulse(
  pulse: PulseResult,
  health: FieldServicesHealthReport,
  ruleHits: JudgementRuleHit[],
): PulseResult {
  const industryLine = health.executiveNarrative;
  const ruleLine = ruleHits[0]?.executiveImplication;
  return {
    ...pulse,
    narrative: ensureSentence(
      [industryLine, ruleLine, pulse.narrative].filter(Boolean).join(" "),
    ),
    reasoning: ensureSentence(
      [
        pulse.reasoning,
        health.primaryRisk,
        `Industry health overall ${health.overallScore}.`,
      ].join(" "),
    ),
    contributingFactors: [
      ...health.dimensions.slice(0, 4).map((dimension) => ({
        id: `fs-${dimension.id}`,
        label: dimension.label,
        influence:
          dimension.score >= 70
            ? ("raises" as const)
            : dimension.score <= 48
              ? ("lowers" as const)
              : ("stabilises" as const),
        weight: Math.round((100 - dimension.score) / 4),
        evidence: dimension.evidence[0] ?? dimension.reasoning,
      })),
      ...pulse.contributingFactors,
    ].slice(0, 8),
  };
}

function extractKpisFromTwin(
  twin: EnterpriseDigitalTwin | undefined,
): FieldServiceKpiSnapshot | null {
  if (!twin) return null;
  const metric = twin
    .history()
    .find(
      (event) =>
        event.entityType === "Metric" &&
        event.payload.fieldServiceKpis &&
        typeof event.payload.fieldServiceKpis === "object",
    );
  if (!metric) return null;
  return {
    asOf: metric.timestamp,
    values: metric.payload.fieldServiceKpis as FieldServiceKpiSnapshot["values"],
  };
}

function clipWords(text: string, max: number): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= max) {
    return /[.!?]$/.test(text.trim()) ? text.trim() : `${text.trim()}.`;
  }
  return `${words.slice(0, max).join(" ")}…`;
}
