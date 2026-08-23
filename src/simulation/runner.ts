import { buildIntelligentExecutiveSnapshot } from "@/intelligence/executive-intelligence";
import type { IntelligentExecutiveSnapshot } from "@/intelligence/executive-intelligence/types";
import {
  evaluateSnapshotRecommendations,
  fingerprintRecommendation,
  type RecommendationEvaluation,
} from "@/evaluation";
import type { ExecutiveScenario, ScenarioCapture, SimulatedOrganisation } from "@/simulation/types";
import { computeRunBenchmarks, type RunBenchmarks } from "@/benchmarks/metrics";
import { applyFieldServicesIndustry } from "@/industry/field-services/simpro/apply-industry";
import type { FieldServicesIndustryContext } from "@/industry/field-services/simpro/apply-industry";
import type { BenchmarkComparison } from "@/industry/field-services/simpro/benchmarks";
import {
  applyExecutiveFutures,
  simulateFuturesForScenario,
  type FutureSimulationResult,
} from "@/futures";
import { applyExecutiveAgenda } from "@/agenda";
import {
  simulateInitiativesForScenario,
  type InitiativeSimulationResult,
} from "@/initiatives";

export type LabRunResult = {
  organisationId: string;
  organisationName: string;
  scenarioId: string;
  scenarioName: string;
  asOf: string;
  snapshot: IntelligentExecutiveSnapshot;
  capture: ScenarioCapture;
  evaluations: RecommendationEvaluation[];
  benchmarks: RunBenchmarks;
  /** Fingerprints for stability comparisons */
  fingerprints: Record<string, string>;
  executiveReady: RecommendationEvaluation[];
  blocked: RecommendationEvaluation[];
  industry?: FieldServicesIndustryContext;
  benchmarkComparison?: BenchmarkComparison | null;
  /** Futures Engine simulation scores for this scenario */
  futuresSimulation?: FutureSimulationResult;
  /** Strategic Initiative Engine simulation scores */
  initiativeSimulation?: InitiativeSimulationResult;
};

/**
 * Run the complete ExecutiveOS stack for one organisation × scenario.
 * Isolated context — does not mutate global providers.
 */
export function runScenario(
  organisation: SimulatedOrganisation,
  scenario: ExecutiveScenario,
  options?: {
    priorFingerprints?: Record<string, string>;
  },
): LabRunResult {
  const base = organisation.createContext();
  const context = scenario.apply(base);

  let snapshot = buildIntelligentExecutiveSnapshot(
    context.provider,
    context.graph,
    context.intent,
    context.memory,
    context.twin,
  );

  let industry: FieldServicesIndustryContext | undefined;
  let benchmarkComparison: BenchmarkComparison | null | undefined;

  const isFieldServices =
    organisation.industry === "field_services" ||
    scenario.id.startsWith("fs-") ||
    organisation.id.includes("field-services");

  if (isFieldServices) {
    const applied = applyFieldServicesIndustry({
      snapshot,
      twin: context.twin,
      benchmarkId: "bench-medium",
    });
    snapshot = applied.snapshot;
    industry = applied.industry;
    benchmarkComparison = applied.industry.benchmark;
  }

  // Refresh futures + agenda after industry enrichment
  snapshot = applyExecutiveFutures({
    snapshot,
    twin: context.twin,
  }).snapshot;

  snapshot = applyExecutiveAgenda({
    snapshot,
    twin: context.twin,
  }).snapshot;

  const futuresSimulation = simulateFuturesForScenario({
    scenarioId: scenario.id,
    snapshot,
    twin: context.twin,
  });

  const initiativeSimulation = simulateInitiativesForScenario({
    scenarioId: scenario.id,
    snapshot,
    twin: context.twin,
    initiatives: snapshot.agendaBrief?.initiatives,
  });

  const evaluations = evaluateSnapshotRecommendations(snapshot, {
    priorFingerprints: options?.priorFingerprints,
  });

  const fingerprints = Object.fromEntries(
    snapshot.recommendations.map((recommendation) => [
      recommendation.id,
      fingerprintRecommendation(recommendation),
    ]),
  );

  const capture = captureFromSnapshot(
    organisation,
    scenario,
    snapshot,
  );

  const benchmarks = computeRunBenchmarks({
    evaluations,
    snapshot,
    capture,
  });

  return {
    organisationId: organisation.id,
    organisationName: organisation.name,
    scenarioId: scenario.id,
    scenarioName: scenario.name,
    asOf: context.asOf,
    snapshot,
    capture,
    evaluations,
    benchmarks,
    fingerprints,
    executiveReady: evaluations.filter((item) => item.pass),
    blocked: evaluations.filter((item) => !item.pass),
    industry,
    benchmarkComparison,
    futuresSimulation,
    initiativeSimulation,
  };
}

function captureFromSnapshot(
  organisation: SimulatedOrganisation,
  scenario: ExecutiveScenario,
  snapshot: IntelligentExecutiveSnapshot,
): ScenarioCapture {
  const briefs = snapshot.judgementBriefs ?? [];
  const alternatives = briefs.flatMap((brief) =>
    brief.optionsInPlay.map((option) => `${brief.decisionId}:${option.label}`),
  );
  const unknowns = briefs.flatMap((brief) =>
    brief.unknowns.map((unknown) => unknown.question),
  );
  const reasoningPaths = snapshot.recommendations.flatMap((recommendation) =>
    recommendation.reasoningGraph.systems.map(
      (system) => `${recommendation.id}:${system}`,
    ),
  );

  return {
    organisationId: organisation.id,
    organisationName: organisation.name,
    scenarioId: scenario.id,
    scenarioName: scenario.name,
    asOf: snapshot.asOf,
    pulse: {
      state: snapshot.pulse.state,
      label: snapshot.pulse.label,
      narrative: snapshot.pulse.narrative,
    },
    snapshotSummary: {
      decisionCount: snapshot.decisions.length,
      recommendationCount: snapshot.recommendations.length,
      outcomeCount: snapshot.outcomes.length,
      reviewMinutes: snapshot.reviewMinutes,
    },
    judgements: briefs.map((brief) => ({
      decisionId: brief.decisionId,
      question: brief.question,
      optionCount: brief.optionsInPlay.length,
      unknownCount: brief.unknowns.length,
      tradeoffCount: brief.tradeoffs.length,
    })),
    recommendations: snapshot.recommendations.map((recommendation) => ({
      id: recommendation.id,
      title: recommendation.title,
      act: recommendation.act,
      attentionValue: recommendation.attentionValue,
    })),
    alternatives,
    unknowns,
    reasoningPaths,
  };
}
