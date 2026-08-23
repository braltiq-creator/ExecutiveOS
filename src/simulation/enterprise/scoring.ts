/**
 * Reusable Enterprise Simulation scoring framework.
 */

import type { LabRunResult } from "@/simulation/runner";
import type {
  CouncilValidation,
  EnterpriseScoreDimensionId,
  EnterpriseScorecard,
  OperatingLoopValidation,
} from "@/simulation/enterprise/types";
import {
  ENTERPRISE_SCORE_DIMENSIONS,
  ENTERPRISE_SCORE_LABELS,
} from "@/simulation/enterprise/types";

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function avg(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function dimAvg(
  lab: LabRunResult,
  dimensionId: string,
): number {
  const scores = lab.evaluations.map((evaluation) => {
    const dim = evaluation.dimensions.find((item) => item.id === dimensionId);
    return dim?.score ?? 0;
  });
  return avg(scores);
}

/**
 * Combine Reality Lab benchmarks, operating-loop pass-through, and Council
 * behaviour into the Phase 46 enterprise scorecard.
 */
export function buildEnterpriseScorecard(input: {
  lab: LabRunResult;
  operatingLoop: OperatingLoopValidation;
  council: CouncilValidation;
}): EnterpriseScorecard {
  const { lab, operatingLoop, council } = input;
  const loopPassRate =
    (operatingLoop.stages.filter((stage) => stage.pass).length /
      Math.max(1, operatingLoop.stages.length)) *
    100;

  const memberDecisionQuality = avg(
    council.members.map((member) => member.decisionQuality),
  );
  const memberCollaboration = avg(
    council.members.map((member) => member.collaboration),
  );
  const memberTiming = avg(council.members.map((member) => member.timing));
  const memberPrep = avg(
    council.members.map(
      (member) => (member.observationQuality + member.timing) / 2,
    ),
  );

  const scores: Record<EnterpriseScoreDimensionId, { score: number; reasoning: string }> = {
    decision_quality: {
      score: clamp(
        lab.benchmarks.decisionReadiness * 0.55 + memberDecisionQuality * 0.45,
      ),
      reasoning: "Decision readiness blended with Council decision quality.",
    },
    time_to_insight: {
      score: clamp(
        lab.benchmarks.executiveAttentionEfficiency * 0.5 + memberTiming * 0.5,
      ),
      reasoning: "Attention efficiency and Council observation timing.",
    },
    executive_preparation: {
      score: clamp(loopPassRate * 0.45 + memberPrep * 0.55),
      reasoning: "Operating-loop completeness and Council preparation signals.",
    },
    strategic_alignment: {
      score: clamp(dimAvg(lab, "strategic_alignment")),
      reasoning: "Recommendation strategic alignment from Reality Lab evaluation.",
    },
    outcome_improvement: {
      score: clamp(
        lab.benchmarks.decisionReadiness * 0.4 +
          (lab.initiativeSimulation?.scores.overall ??
            lab.futuresSimulation?.scores.overall ??
            lab.benchmarks.trustScore) *
            0.6,
      ),
      reasoning: "Initiative/futures simulation pressure on outcome trajectory.",
    },
    council_collaboration: {
      score: clamp(
        memberCollaboration * 0.6 + council.collaborationScore * 0.4,
      ),
      reasoning: "Cross-member collaboration and agency stances.",
    },
    recommendation_accuracy: {
      score: clamp(lab.benchmarks.passRate),
      reasoning: "Share of recommendations clearing evaluation gates.",
    },
    business_value: {
      score: clamp(
        lab.benchmarks.executiveAttentionEfficiency * 0.5 +
          dimAvg(lab, "decision_usefulness") * 0.5,
      ),
      reasoning: "Attention efficiency and decision usefulness.",
    },
    trust: {
      score: clamp(lab.benchmarks.trustScore),
      reasoning: "Aggregate Reality Lab trust score.",
    },
    confidence: {
      score: clamp(
        lab.benchmarks.confidenceAccuracy * 0.6 +
          council.consensusScore * 0.4,
      ),
      reasoning: "Confidence calibration and Council consensus confidence.",
    },
    explainability: {
      score: clamp(
        dimAvg(lab, "explainability") * 0.7 +
          lab.benchmarks.reasoningCompleteness * 0.3,
      ),
      reasoning: "Explainability and reasoning completeness.",
    },
  };

  const dimensions = ENTERPRISE_SCORE_DIMENSIONS.map((id) => ({
    id,
    label: ENTERPRISE_SCORE_LABELS[id],
    score: scores[id].score,
    reasoning: scores[id].reasoning,
  }));

  const overall = clamp(avg(dimensions.map((item) => item.score)));
  const pass =
    overall >= 55 &&
    operatingLoop.pass &&
    council.pass &&
    lab.benchmarks.trustScore >= 45;

  return { overall, dimensions, pass };
}
