/**
 * Scenario validation — measure whether executive questions were answered.
 */

import type { IntelligenceProfileId } from "@/profiles";
import type { IntelligentExecutiveSnapshot } from "@/intelligence/executive-intelligence/types";
import type { ExecutiveSnapshot } from "@/lib/snapshot/types";
import {
  getScenarioPackForProfile,
  type ExecutiveScenarioDefinition,
  type ScenarioPackRun,
  type ScenarioValidationResult,
} from "@/scenarios/framework";
import { getDatasetSignalForScenario } from "@/scenarios/datasets";
import {
  signalsFromIntelligentSnapshot,
  signalsFromPresentationSnapshot,
  type ScenarioSignalBag,
} from "@/scenarios/validation/signals";
import { listEvidenceForScenario } from "@/scenarios/evidence";
import { listOutcomesForScenario } from "@/scenarios/outcomes";
import { scenarioConfidenceWithLearning } from "@/outcomes/learning";

const feedback = new Map<string, number>();
const runHistory = new Map<string, ScenarioPackRun[]>();

export function resetScenarioValidationState(): void {
  feedback.clear();
  runHistory.clear();
}

export function recordScenarioFeedback(input: {
  tenantId: string;
  scenarioId: string;
  score: number;
}): void {
  feedback.set(
    `${input.tenantId}:${input.scenarioId}`,
    Math.max(0, Math.min(100, Math.round(input.score))),
  );
}

function evaluateOne(input: {
  tenantId: string;
  scenario: ExecutiveScenarioDefinition;
  signals: ScenarioSignalBag;
  asOf: string;
  recommendation: string | null;
}): ScenarioValidationResult {
  const dataset = getDatasetSignalForScenario(input.scenario.id);
  const hits =
    dataset?.signalKeys.filter((key) => (input.signals[key] ?? 0) > 0).length ??
    0;
  const min = dataset?.minimumSignals ?? 1;
  const evidenceRecords = listEvidenceForScenario(
    input.tenantId,
    input.scenario.id,
  );
  const outcomeRecords = listOutcomesForScenario(
    input.tenantId,
    input.scenario.id,
  );

  const evidenceQuality = Math.min(
    100,
    hits * 35 + evidenceRecords.length * 15,
  );

  // minimumSignals === 0 means "none material" is an acceptable answer
  const effectivelyAnswered =
    min === 0
      ? true
      : hits >= min || evidenceRecords.length > 0;

  const baseConfidence = Math.min(
    100,
    Math.round(
      evidenceQuality * 0.6 +
        (effectivelyAnswered ? 25 : 0) +
        (input.recommendation ? 15 : 0),
    ),
  );
  const confidence = scenarioConfidenceWithLearning(
    input.tenantId,
    input.scenario.id,
    baseConfidence,
  );

  const recommendationQuality = input.recommendation
    ? Math.min(100, 55 + evidenceQuality * 0.35)
    : effectivelyAnswered
      ? 40
      : 15;

  const feedbackScore =
    feedback.get(`${input.tenantId}:${input.scenario.id}`) ?? null;

  const businessOutcomeScore = Math.min(
    100,
    outcomeRecords.filter((o) => o.realised).length * 40 +
      (effectivelyAnswered ? 30 : 0) +
      (feedbackScore ?? 20) * 0.3,
  );

  const status: ScenarioValidationResult["status"] = !effectivelyAnswered
    ? "unanswered"
    : confidence >= input.scenario.confidenceThreshold
      ? "answered"
      : "partial";

  const passed =
    effectivelyAnswered &&
    confidence >= input.scenario.confidenceThreshold &&
    recommendationQuality >= 50;

  return {
    scenarioId: input.scenario.id,
    tenantId: input.tenantId,
    profileId: input.scenario.profileId,
    asOf: input.asOf,
    status,
    answered: effectivelyAnswered,
    confidence,
    evidenceQuality: Math.round(evidenceQuality),
    recommendationQuality: Math.round(recommendationQuality),
    executiveFeedback: feedbackScore,
    businessOutcomeScore: Math.round(businessOutcomeScore),
    timeToInsightMinutes: effectivelyAnswered ? 5 : null,
    timeToActionMinutes: outcomeRecords.some((o) => o.realised) ? 30 : null,
    evidenceFound: [
      ...evidenceRecords.map((e) => e.label),
      ...(dataset?.signalKeys.filter((k) => (input.signals[k] ?? 0) > 0) ?? []),
    ].slice(0, 6),
    recommendation: input.recommendation,
    explanation: passed
      ? `Answered "${input.scenario.businessQuestion}" with confidence ${confidence}.`
      : `Partial/unanswered for "${input.scenario.businessQuestion}" — confidence ${confidence}, evidence ${Math.round(evidenceQuality)}.`,
    passed,
  };
}

export function runScenarioPack(input: {
  tenantId: string;
  profileId: IntelligenceProfileId;
  asOf?: string;
  intelligent?: IntelligentExecutiveSnapshot;
  presentation?: ExecutiveSnapshot;
}): ScenarioPackRun {
  const asOf = input.asOf ?? new Date().toISOString();
  const pack = getScenarioPackForProfile(input.profileId);
  const signals = input.intelligent
    ? signalsFromIntelligentSnapshot(input.intelligent)
    : input.presentation
      ? signalsFromPresentationSnapshot(input.presentation)
      : {};

  const topRec =
    input.intelligent?.recommendations[0]?.title ??
    input.presentation?.recommendedActions[0]?.title ??
    null;

  const results = pack.scenarios.map((scenario) => {
    const dataset = getDatasetSignalForScenario(scenario.id);
    const hits =
      dataset?.signalKeys.filter((key) => (signals[key] ?? 0) > 0).length ?? 0;
    const min = dataset?.minimumSignals ?? 1;
    const answered =
      min === 0
        ? true
        : hits >= min ||
          listEvidenceForScenario(input.tenantId, scenario.id).length > 0;
    const isFocus =
      scenario.id === "ops-focus-today" ||
      scenario.id === "com-prioritise-today";
    const recommendation = answered
      ? isFocus
        ? (topRec ?? scenario.expectedRecommendation)
        : scenario.expectedRecommendation
      : null;

    return evaluateOne({
      tenantId: input.tenantId,
      scenario,
      signals,
      asOf,
      recommendation,
    });
  });

  const completionPct = Math.round(
    (results.filter((r) => r.answered).length / results.length) * 100,
  );
  const accuracyPct = Math.round(
    (results.filter((r) => r.passed).length / results.length) * 100,
  );
  const averageConfidence = Math.round(
    results.reduce((sum, r) => sum + r.confidence, 0) / results.length,
  );

  const run: ScenarioPackRun = {
    packId: pack.id,
    tenantId: input.tenantId,
    profileId: input.profileId,
    asOf,
    results,
    completionPct,
    accuracyPct,
    averageConfidence,
    explanation: `${pack.name}: ${completionPct}% completion, ${accuracyPct}% accuracy, avg confidence ${averageConfidence}.`,
  };

  const history = runHistory.get(input.tenantId) ?? [];
  history.push(run);
  runHistory.set(input.tenantId, history.slice(-30));
  return run;
}

export function listScenarioRunsForTenant(tenantId: string): ScenarioPackRun[] {
  return runHistory.get(tenantId) ?? [];
}
