import { clampScore } from "@/intelligence/executive-intelligence/lib/helpers";
import type { ConfidenceScore } from "@/intelligence/executive-intelligence/types";
import type { ExecutiveIntentProfile } from "@/intelligence/executive-intent/types";
import { scoreAgainstIntent } from "@/intelligence/executive-intent/engine";
import type {
  IntelligentDecision,
  IntelligentOutcome,
  IntelligentRecommendation,
} from "@/intelligence/executive-intelligence/types";
import {
  JUDGEMENT_DIMENSION_LABELS,
  JUDGEMENT_DIMENSIONS,
  type DecisionOption,
  type JudgementDimensionId,
  type JudgementDimensionScore,
} from "@/intelligence/executive-judgement/types";

export type JudgementContext = {
  asOf: string;
  intent: ExecutiveIntentProfile;
  decision: IntelligentDecision;
  outcomes: IntelligentOutcome[];
  recommendation?: IntelligentRecommendation;
  option: DecisionOption;
  /** Graph path summaries */
  graphPaths?: string[];
  /** Memory evidence sentences */
  memoryEvidence?: string[];
  /** Twin entity labels / statuses */
  twinSignals?: string[];
};

/**
 * Score one option against the common judgement framework.
 * Deterministic. Every score cites evidence strings.
 */
export function scoreOptionDimensions(
  context: JudgementContext,
): JudgementDimensionScore[] {
  return JUDGEMENT_DIMENSIONS.map((id) => scoreDimension(id, context));
}

export function balanceFromDimensions(
  dimensions: JudgementDimensionScore[],
): number {
  if (dimensions.length === 0) return 0;
  const total = dimensions.reduce((sum, item) => sum + item.score, 0);
  return clampScore(total / dimensions.length);
}

function scoreDimension(
  id: JudgementDimensionId,
  context: JudgementContext,
): JudgementDimensionScore {
  const hint = context.option.dimensionHints?.[id];
  const base = typeof hint === "number" ? hint : defaultBase(id, context);
  const score = clampScore(base);
  const reasoning = reasonFor(id, score, context);
  const evidence = evidenceFor(id, context);

  return {
    id,
    label: JUDGEMENT_DIMENSION_LABELS[id],
    score,
    polarity: polarityFor(score),
    reasoning,
    evidence,
  };
}

function defaultBase(
  id: JudgementDimensionId,
  context: JudgementContext,
): number {
  const { decision, outcomes, intent, option, recommendation } = context;
  const linked = outcomes.filter((outcome) =>
    decision.outcomeIds.includes(outcome.id),
  );
  const avgHealth =
    linked.reduce((sum, outcome) => sum + outcome.healthScore, 0) /
    Math.max(1, linked.length);
  const intentScore = scoreAgainstIntent(intent, {
    id: decision.id,
    kind: "decision",
    label: decision.question,
    outcomeIds: decision.outcomeIds,
    businessImportance: decision.executiveImportance,
    recommendedAct: option.act,
  }).intentScore;

  const act = option.act;
  const approveLike = act === "approve" || act === "escalate";
  const waitLike = act === "wait" || act === "defer";
  const investigateLike = act === "investigate" || act === "schedule";

  switch (id) {
    case "strategic_alignment":
      return (
        intentScore * 0.7 +
        (approveLike ? 12 : waitLike ? -8 : 0) +
        decision.strategicAlignment.intentScore * 0.15
      );
    case "financial_impact":
      return (
        decision.businessImpactScore * 0.55 +
        (100 - avgHealth) * 0.25 +
        (approveLike ? 10 : waitLike ? -12 : 0)
      );
    case "operational_impact":
      return (
        70 -
        decision.estimatedEffortMinutes * 1.5 +
        (act === "delegate" ? 12 : 0) +
        (act === "schedule" ? 6 : 0)
      );
    case "customer_impact":
      return (
        (decision.outcomeIds.includes("outcome-enterprise-arr") ||
        decision.outcomeIds.includes("outcome-retention")
          ? 78
          : 55) + (approveLike ? 8 : waitLike ? -14 : 0)
      );
    case "people_impact":
      return (
        62 +
        (act === "delegate" ? 14 : 0) +
        (act === "escalate" ? -6 : 0) -
        (decision.estimatedEffortMinutes > 15 ? 8 : 0)
      );
    case "compliance":
      return (
        (decision.id.includes("residency") ||
        decision.id.includes("board") ||
        /residency|board|security|compliance/i.test(decision.question)
          ? 48
          : 70) + (investigateLike || act === "escalate" ? 12 : approveLike ? -6 : 0)
      );
    case "risk_profile":
      // Higher = more acceptable risk posture for this option
      return (
        55 +
        (waitLike ? -18 : 0) +
        (investigateLike ? 8 : 0) +
        (approveLike ? (avgHealth < 60 ? -10 : 6) : 0) +
        (100 - decision.confidence.value) * -0.15
      );
    case "opportunity_cost":
      return (
        50 +
        (waitLike ? -20 : 0) +
        (approveLike ? 14 : 0) +
        Math.min(20, decision.urgency * 0.2)
      );
    case "timing":
      return (
        (decision.priority === "immediate" || decision.priority === "today"
          ? 78
          : 55) + (waitLike ? -22 : approveLike ? 10 : investigateLike ? 4 : 0)
      );
    case "confidence":
      return (
        decision.confidence.value * 0.6 +
        (recommendation?.confidence.value ?? decision.confidence.value) * 0.3 +
        (context.graphPaths?.length ? 6 : 0) +
        (context.memoryEvidence?.length ? 4 : 0)
      );
    default:
      return 50;
  }
}

function polarityFor(
  score: number,
): JudgementDimensionScore["polarity"] {
  if (score >= 70) return "supports";
  if (score <= 40) return "cautions";
  if (score >= 45 && score <= 55) return "neutral";
  return "mixed";
}

function reasonFor(
  id: JudgementDimensionId,
  score: number,
  context: JudgementContext,
): string {
  const act = context.option.act;
  const label = JUDGEMENT_DIMENSION_LABELS[id];
  if (score >= 70) {
    return `${label} favours "${context.option.label}" (${act}) at ${score}.`;
  }
  if (score <= 40) {
    return `${label} cautions against leaning solely on "${context.option.label}" (${score}).`;
  }
  return `${label} is mixed for "${context.option.label}" (${score}) — weigh explicitly.`;
}

function evidenceFor(
  id: JudgementDimensionId,
  context: JudgementContext,
): string[] {
  const items: string[] = [
    `Decision: ${context.decision.question}`,
    `Option act: ${context.option.act}`,
    context.decision.strategicAlignment.reasoning,
  ];
  if (id === "strategic_alignment") {
    items.push(
      ...context.decision.strategicAlignment.matchedPriorities.map(
        (priority) => `Intent priority: ${priority}`,
      ),
    );
  }
  if (id === "financial_impact" || id === "customer_impact") {
    for (const outcome of context.outcomes.filter((item) =>
      context.decision.outcomeIds.includes(item.id),
    )) {
      items.push(
        `Outcome ${outcome.shortName}: health ${outcome.healthScore}, ${outcome.momentumLabel}`,
      );
    }
  }
  if (id === "confidence") {
    items.push(context.decision.confidence.reasoning);
    items.push(...(context.graphPaths ?? []).slice(0, 2));
    items.push(...(context.memoryEvidence ?? []).slice(0, 2));
  }
  if (id === "timing") {
    items.push(
      `Priority ${context.decision.priority}; urgency ${context.decision.urgency}`,
    );
  }
  return items.filter(Boolean).slice(0, 6);
}

export function synthesiseConfidence(
  dimensions: JudgementDimensionScore[],
  decisionConfidence: ConfidenceScore,
): ConfidenceScore {
  const confidenceDim = dimensions.find((item) => item.id === "confidence");
  const value = clampScore(
    (confidenceDim?.score ?? decisionConfidence.value) * 0.7 +
      decisionConfidence.value * 0.3,
  );
  return {
    value,
    ceiling: Math.min(decisionConfidence.ceiling, value + 12),
    drivers: decisionConfidence.drivers,
    reasoning: [
      decisionConfidence.reasoning,
      "Judgement confidence blends Decision evidence with framework completeness.",
      confidenceDim?.reasoning,
    ]
      .filter(Boolean)
      .join(" "),
  };
}
