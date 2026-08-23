import type { IntelligentExecutiveSnapshot } from "@/intelligence/executive-intelligence/types";
import type {
  Future,
  FutureSimulationScore,
  FuturesBrief,
} from "@/futures/models/types";
import { projectPossibleFutures } from "@/futures/generate";
import type { EnterpriseDigitalTwin } from "@/digital-twin";

export type FutureSimulationResult = {
  scenarioId: string;
  futuresBrief: FuturesBrief;
  scores: FutureSimulationScore;
  perFuture: Array<{
    futureId: string;
    caseKind: Future["caseKind"];
    predictionQuality: number;
    confidenceCalibration: number;
    interventionEffectiveness: number;
    decisionQuality: number;
  }>;
};

/**
 * Reality Lab — evaluate futures quality for a scenario snapshot.
 * Dimensions: prediction quality, confidence calibration,
 * intervention effectiveness, decision quality.
 */
export function simulateFuturesForScenario(input: {
  scenarioId: string;
  snapshot: IntelligentExecutiveSnapshot;
  twin?: EnterpriseDigitalTwin;
}): FutureSimulationResult {
  const futuresBrief = projectPossibleFutures({
    snapshot: input.snapshot,
    twin: input.twin,
  });

  const perFuture = futuresBrief.futures.map((future) =>
    scoreFuture(future, input.snapshot, futuresBrief),
  );

  const avg = (key: keyof (typeof perFuture)[number]) =>
    perFuture.length === 0
      ? 0
      : Math.round(
          perFuture.reduce((sum, row) => sum + (row[key] as number), 0) /
            perFuture.length,
        );

  const predictionQuality = avg("predictionQuality");
  const confidenceCalibration = avg("confidenceCalibration");
  const interventionEffectiveness = avg("interventionEffectiveness");
  const decisionQuality = avg("decisionQuality");
  const overall = Math.round(
    predictionQuality * 0.3 +
      confidenceCalibration * 0.25 +
      interventionEffectiveness * 0.25 +
      decisionQuality * 0.2,
  );

  const notes: string[] = [];
  if (predictionQuality < 55) {
    notes.push("Prediction quality weak — futures lack grounded evidence.");
  }
  if (confidenceCalibration < 55) {
    notes.push("Confidence poorly calibrated against evidence strength.");
  }
  if (interventionEffectiveness < 55) {
    notes.push("Interventions are thin or unlinked to Decisions/Outcomes.");
  }
  if (decisionQuality < 55) {
    notes.push("Futures do not clearly connect to influenceable Decisions.");
  }
  if (notes.length === 0) {
    notes.push("Futures meet Reality Lab quality bar for executive scenario reasoning.");
  }

  return {
    scenarioId: input.scenarioId,
    futuresBrief,
    scores: {
      predictionQuality,
      confidenceCalibration,
      interventionEffectiveness,
      decisionQuality,
      overall,
      notes,
    },
    perFuture,
  };
}

function scoreFuture(
  future: Future,
  snapshot: IntelligentExecutiveSnapshot,
  brief: FuturesBrief,
): FutureSimulationResult["perFuture"][number] {
  const evidenceCount =
    future.supportingEvidence.length + future.explanation.evidenceThatWeakens.length;
  const hasAssumptions = future.keyAssumptions.length >= 2;
  const hasSignals = future.leadingIndicators.length >= 1;
  const hasWhy = future.explanation.whyItExists.length > 20;
  const linkedDecisions = future.recommendedInterventions.some(
    (i) => i.relatedDecisionIds.length > 0,
  );
  const openDecisions = snapshot.decisions.filter((d) => d.priority !== "resolved");
  const council = brief.councilReviews.find((r) => r.futureId === future.id);
  const hasDisagreement = (council?.disagreements.length ?? 0) > 0;

  const predictionQuality = clamp(
    40 +
      evidenceCount * 4 +
      (hasWhy ? 10 : 0) +
      (hasAssumptions ? 8 : 0) +
      (future.alternativeOutcomes.length > 0 ? 6 : 0),
    0,
    100,
  );

  // Confidence should not be extreme when evidence is thin
  const evidenceStrength = Math.min(100, evidenceCount * 12);
  const calibrationGap = Math.abs(future.confidence - evidenceStrength);
  const confidenceCalibration = clamp(100 - calibrationGap, 35, 95);

  const interventionKinds = new Set(
    future.recommendedInterventions.map((i) => i.kind),
  );
  const interventionEffectiveness = clamp(
    30 +
      interventionKinds.size * 10 +
      (linkedDecisions ? 15 : 0) +
      (future.recommendedInterventions.some((i) => i.kind === "preventative")
        ? 8
        : 0) +
      (hasSignals ? 8 : 0),
    0,
    100,
  );

  const decisionQuality = clamp(
    35 +
      (linkedDecisions ? 20 : 0) +
      (openDecisions.length > 0 ? 10 : 5) +
      (future.explanation.influenceLevers.length > 0 ? 12 : 0) +
      (hasDisagreement ? 8 : 0) +
      (council && council.perspectives.length >= 6 ? 10 : 0),
    0,
    100,
  );

  return {
    futureId: future.id,
    caseKind: future.caseKind,
    predictionQuality,
    confidenceCalibration,
    interventionEffectiveness,
    decisionQuality,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}
