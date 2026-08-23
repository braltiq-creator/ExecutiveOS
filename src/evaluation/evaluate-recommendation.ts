import { clampScore } from "@/intelligence/executive-intelligence/lib/helpers";
import type {
  IntelligentExecutiveSnapshot,
  IntelligentRecommendation,
} from "@/intelligence/executive-intelligence/types";
import type { DecisionBrief } from "@/intelligence/executive-judgement/types";
import {
  DEFAULT_EVALUATION_GATES,
  EVALUATION_DIMENSION_LABELS,
  EVALUATION_DIMENSIONS,
  type DimensionScore,
  type EvaluationDimensionId,
  type EvaluationGate,
  type RecommendationEvaluation,
} from "@/evaluation/types";

export type EvaluateRecommendationInput = {
  recommendation: IntelligentRecommendation;
  snapshot: IntelligentExecutiveSnapshot;
  brief?: DecisionBrief;
  /** Prior recommendation fingerprint for stability */
  priorFingerprint?: string;
  gates?: EvaluationGate[];
};

/**
 * Score one recommendation across the Reality Lab evaluation framework.
 * Deterministic. Gate failures block the recommendation from "executive ready".
 */
export function evaluateRecommendation(
  input: EvaluateRecommendationInput,
): RecommendationEvaluation {
  const gates = input.gates ?? DEFAULT_EVALUATION_GATES;
  const dimensions = EVALUATION_DIMENSIONS.map((id) =>
    scoreDimension(id, input),
  );
  const overallScore = clampScore(
    dimensions.reduce((sum, item) => sum + item.score, 0) / dimensions.length,
  );

  const gatesFailed: string[] = [];
  for (const gate of gates) {
    const dim = dimensions.find((item) => item.id === gate.dimension);
    if ((dim?.score ?? 0) < gate.minimum) {
      gatesFailed.push(gate.message);
    }
  }

  return {
    recommendationId: input.recommendation.id,
    decisionId: input.recommendation.relatedDecisionIds[0] ?? null,
    title: input.recommendation.title,
    act: input.recommendation.act,
    dimensions,
    overallScore,
    pass: gatesFailed.length === 0 && overallScore >= 55,
    gatesFailed,
    reasoning: [
      `Overall ${overallScore}/100 across ${dimensions.length} dimensions.`,
      gatesFailed.length === 0
        ? "All evaluation gates passed."
        : `${gatesFailed.length} gate(s) failed.`,
    ].join(" "),
  };
}

/** Evaluate every recommendation on a snapshot. */
export function evaluateSnapshotRecommendations(
  snapshot: IntelligentExecutiveSnapshot,
  options?: {
    priorFingerprints?: Record<string, string>;
    gates?: EvaluationGate[];
  },
): RecommendationEvaluation[] {
  return snapshot.recommendations.map((recommendation) => {
    const brief = snapshot.judgementBriefs?.find((item) =>
      recommendation.relatedDecisionIds.includes(item.decisionId),
    );
    return evaluateRecommendation({
      recommendation,
      snapshot,
      brief,
      priorFingerprint: options?.priorFingerprints?.[recommendation.id],
      gates: options?.gates,
    });
  });
}

function scoreDimension(
  id: EvaluationDimensionId,
  input: EvaluateRecommendationInput,
): DimensionScore {
  const { recommendation, snapshot, brief } = input;
  let score = 50;
  const evidence: string[] = [];

  switch (id) {
    case "explainability": {
      const systems = recommendation.reasoningGraph.systems.length;
      const path = brief
        ? brief.evidence.length
        : recommendation.reasoningGraph.evidence.length;
      const summary = recommendation.reasoningGraph.summary.length;
      score = clampScore(30 + systems * 8 + Math.min(30, path * 4) + (summary > 40 ? 15 : 5));
      evidence.push(
        `${systems} systems in reasoning graph`,
        `summary length ${summary}`,
      );
      break;
    }
    case "evidence_quality": {
      const count = recommendation.evidence.length;
      const graphMention = recommendation.reasoningGraph.systems.includes(
        "Executive Knowledge Graph",
      );
      const memoryMention = recommendation.reasoningGraph.systems.includes(
        "Executive Memory Engine",
      );
      score = clampScore(
        25 +
          count * 10 +
          (graphMention ? 12 : 0) +
          (memoryMention ? 10 : 0) +
          (brief?.evidence.length ? 8 : 0),
      );
      evidence.push(`${count} evidence items`, ...recommendation.evidence.slice(0, 2));
      break;
    }
    case "strategic_alignment": {
      const level = recommendation.strategicAlignment.level;
      score =
        level === "high"
          ? 88
          : level === "medium"
            ? 68
            : level === "low"
              ? 42
              : 28;
      evidence.push(
        recommendation.strategicAlignment.label,
        recommendation.strategicAlignment.reasoning,
      );
      break;
    }
    case "confidence_calibration": {
      const value = recommendation.confidence.value;
      const ceiling = recommendation.confidence.ceiling;
      const gap = Math.max(0, ceiling - value);
      // Well calibrated: confidence below ceiling with room, not overconfident
      const overconfident = value > ceiling ? 25 : 0;
      score = clampScore(55 + Math.min(25, gap) - overconfident + (value >= 50 && value <= 85 ? 10 : 0));
      evidence.push(
        `confidence ${value}, ceiling ${ceiling}`,
        recommendation.confidence.reasoning,
      );
      break;
    }
    case "completeness": {
      const hasBenefit = recommendation.expectedBenefit.length > 10;
      const hasDownside = recommendation.expectedDownside.length > 10;
      const hasAlts = (brief?.optionsInPlay.length ?? 0) >= 2;
      const hasUnknowns = (brief?.unknowns.length ?? 0) > 0;
      const hasTradeoffs = (brief?.tradeoffs.length ?? 0) > 0;
      const hasJudgement = recommendation.reasoningGraph.systems.includes(
        "Executive Judgement Engine",
      );
      score = clampScore(
        (hasBenefit ? 15 : 0) +
          (hasDownside ? 15 : 0) +
          (hasAlts ? 20 : 0) +
          (hasUnknowns ? 15 : 0) +
          (hasTradeoffs ? 15 : 0) +
          (hasJudgement ? 15 : 0) +
          5,
      );
      evidence.push(
        `alts=${brief?.optionsInPlay.length ?? 0}`,
        `unknowns=${brief?.unknowns.length ?? 0}`,
        `tradeoffs=${brief?.tradeoffs.length ?? 0}`,
      );
      break;
    }
    case "consistency": {
      const decision = snapshot.decisions.find((item) =>
        recommendation.relatedDecisionIds.includes(item.id),
      );
      const actAligned =
        !decision ||
        decision.priority === "resolved" ||
        recommendation.attentionValue >= decision.executiveImportance - 25;
      const intentAligned =
        recommendation.strategicAlignment.level ===
          decision?.strategicAlignment.level ||
        recommendation.strategicAlignment.level === "high" ||
        recommendation.strategicAlignment.level === "medium";
      score = clampScore((actAligned ? 45 : 20) + (intentAligned ? 40 : 15));
      evidence.push(
        `attention ${recommendation.attentionValue}`,
        decision
          ? `decision importance ${decision.executiveImportance}`
          : "no linked decision",
      );
      break;
    }
    case "stability": {
      const fingerprint = fingerprintRecommendation(recommendation);
      if (!input.priorFingerprint) {
        score = 70;
        evidence.push("No prior fingerprint — baseline stability assumed.");
      } else if (input.priorFingerprint === fingerprint) {
        score = 92;
        evidence.push("Identical to prior fingerprint.");
      } else {
        score = 58;
        evidence.push("Changed since prior fingerprint — review drift.");
      }
      break;
    }
    case "novelty": {
      const memory = recommendation.reasoningGraph.systems.includes(
        "Executive Memory Engine",
      );
      const historical = /previous|historical|before|aligns with/i.test(
        recommendation.reason,
      );
      // Novelty is healthy when not inventing; grounded novelty scores mid-high
      score = clampScore(memory || historical ? 72 : 55);
      evidence.push(
        memory ? "Grounded in memory" : "No memory grounding",
        historical ? "References prior outcomes" : "No historical reference",
      );
      break;
    }
    case "decision_usefulness": {
      const hasHref = recommendation.href.length > 1;
      const hasAct = Boolean(recommendation.act);
      const briefReady = (brief?.optionsInPlay.length ?? 0) >= 2;
      const attention = recommendation.attentionValue;
      score = clampScore(
        (hasHref ? 15 : 0) +
          (hasAct ? 20 : 0) +
          (briefReady ? 25 : 5) +
          Math.min(30, attention * 0.3) +
          (recommendation.reason.length > 40 ? 10 : 0),
      );
      evidence.push(`act=${recommendation.act}`, `attention=${attention}`);
      break;
    }
    default:
      score = 50;
  }

  return {
    id,
    label: EVALUATION_DIMENSION_LABELS[id],
    score,
    reasoning: `${EVALUATION_DIMENSION_LABELS[id]} scored ${score}.`,
    evidence,
  };
}

export function fingerprintRecommendation(
  recommendation: IntelligentRecommendation,
): string {
  return [
    recommendation.id,
    recommendation.act,
    recommendation.title,
    recommendation.reason.slice(0, 80),
    recommendation.confidence.value,
    recommendation.strategicAlignment.level,
  ].join("|");
}
