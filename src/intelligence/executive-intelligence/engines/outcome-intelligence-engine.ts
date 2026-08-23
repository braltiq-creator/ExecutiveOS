import { assessConfidence } from "@/intelligence/executive-intelligence/engines/confidence-engine";
import { buildReasoningGraph } from "@/intelligence/executive-intelligence/engines/reasoning-graph";
import {
  ensureSentence,
  movementPercentLabel,
  shortLine,
  shortOutcomeName,
} from "@/intelligence/executive-intelligence/lib/helpers";
import type {
  EnterpriseOutcomeSignal,
  EnterpriseSignals,
  IntelligentOutcome,
  Momentum,
  Trajectory,
} from "@/intelligence/executive-intelligence/types";

/**
 * Outcome Intelligence Engine — each Outcome becomes an intelligent object.
 */
export function deriveOutcomeIntelligence(
  signals: EnterpriseSignals,
): IntelligentOutcome[] {
  return rankOutcomes(signals.outcomes).map((outcome) =>
    interpretOutcome(outcome),
  );
}

function interpretOutcome(outcome: EnterpriseOutcomeSignal): IntelligentOutcome {
  const trajectory = trajectoryFromMovement(outcome.yesterdayMovement);
  const momentum = momentumFromTrajectory(trajectory);
  const history =
    outcome.history.length >= 2
      ? outcome.history.map((point) => point.healthScore).slice(-7)
      : [
          Math.max(0, Math.min(100, outcome.healthScore - outcome.yesterdayMovement)),
          outcome.healthScore,
        ];

  const lastSignificantChange =
    outcome.history.at(-1)?.note ??
    outcome.overnightSignals[0]?.whatChanged ??
    outcome.yesterdayMovementLabel;

  const evidence = [
    ...outcome.overnightSignals.map((signal) => ({
      id: signal.id,
      kind: "signal" as const,
      label: signal.whatChanged,
      detail: signal.why,
      system: "Overnight Signal Bus",
    })),
    ...outcome.blockers.map((blocker) => ({
      id: blocker.id,
      kind: "risk" as const,
      label: blocker.title,
      detail: `${blocker.severity} blocker`,
      system: "Risk Register",
    })),
  ].slice(0, 5);

  const recommendation = buildOutcomeRecommendation(outcome, momentum);
  const confidence = assessConfidence({
    label: outcome.name,
    dataCompleteness: clampCompleteness(outcome),
    freshnessHours: outcome.overnightSignals.length > 0 ? 4 : 18,
    sourceAgreement: outcome.confidence,
    historicalReliability: Math.min(90, outcome.confidence + 4),
    predictionCertainty: Math.max(40, outcome.confidence - 10),
    aiReasoningConfidence: Math.max(45, outcome.confidence - 6),
  });

  const shortName = shortOutcomeName(outcome.id, outcome.name);
  const graph = buildReasoningGraph({
    id: outcome.id,
    question: `What is happening to ${shortName}?`,
    whatChanged: [
      outcome.yesterdayMovementLabel,
      ...outcome.overnightSignals.map((s) => s.whatChanged),
    ].slice(0, 3),
    evidence,
    systems: outcome.contributingSystems,
    summary: recommendation,
  });

  return {
    id: outcome.id,
    name: outcome.name,
    shortName,
    status: outcome.status,
    healthScore: outcome.healthScore,
    trajectory,
    momentum,
    momentumLabel:
      momentum === "building"
        ? "Building"
        : momentum === "drifting"
          ? "Drifting"
          : "Steady",
    movement: outcome.yesterdayMovement,
    movementLabel: movementPercentLabel(
      outcome.yesterdayMovement,
      outcome.healthScore,
    ),
    confidence,
    lastSignificantChange: shortLine(lastSignificantChange, 7),
    supportingEvidence: evidence,
    contributingSystems: outcome.contributingSystems,
    executiveRecommendation: recommendation,
    healthHistory: history,
    predictedTrend: outcome.forecast.direction,
    predictedNarrative: outcome.forecast.narrative,
    reasoning: ensureSentence(
      `${shortName} is ${momentum} (health ${outcome.healthScore}) — ${shortLine(lastSignificantChange, 12)}`,
    ),
    reasoningGraph: graph,
    strategicAlignment: {
      level: "medium",
      label: "Medium Alignment",
      intentScore: 50,
      attentionPriority: Math.round(100 - outcome.healthScore / 2),
      matchedPriorities: [],
      reasoning: "Intent pending application.",
    },
  };
}

function rankOutcomes(
  outcomes: EnterpriseOutcomeSignal[],
): EnterpriseOutcomeSignal[] {
  const rank = {
    off_track: 0,
    at_risk: 1,
    watching: 2,
    on_track: 3,
  } as const;
  return [...outcomes].sort((left, right) => {
    const statusDiff = rank[left.status] - rank[right.status];
    if (statusDiff !== 0) return statusDiff;
    return left.healthScore - right.healthScore;
  });
}

function trajectoryFromMovement(movement: number): Trajectory {
  if (movement > 0) return "improving";
  if (movement < 0) return "declining";
  return "stable";
}

function momentumFromTrajectory(trajectory: Trajectory): Momentum {
  if (trajectory === "improving") return "building";
  if (trajectory === "declining") return "drifting";
  return "steady";
}

function clampCompleteness(outcome: EnterpriseOutcomeSignal): number {
  let score = 50;
  if (outcome.history.length >= 2) score += 12;
  if (outcome.overnightSignals.length > 0) score += 10;
  if (outcome.blockers.length > 0) score += 6;
  if (outcome.pendingActions.length > 0) score += 6;
  if (outcome.meetings.length > 0) score += 4;
  return Math.min(96, score);
}

function buildOutcomeRecommendation(
  outcome: EnterpriseOutcomeSignal,
  momentum: Momentum,
): string {
  if (outcome.status === "off_track" || momentum === "drifting") {
    return `Protect ${shortOutcomeName(outcome.id, outcome.name)} — clear the blocking Decision before further drift compounds.`;
  }
  if (outcome.status === "at_risk") {
    return `Keep ${shortOutcomeName(outcome.id, outcome.name)} under active watch and resolve the named blocker this week.`;
  }
  if (momentum === "building") {
    return `Preserve momentum on ${shortOutcomeName(outcome.id, outcome.name)} — do not dilute Focus with secondary work.`;
  }
  return `Hold steady on ${shortOutcomeName(outcome.id, outcome.name)} unless a new signal appears.`;
}
