/**
 * Reality Lab — Evaluation Framework
 * Scores recommendations before they reach an executive.
 */

export const EVALUATION_DIMENSIONS = [
  "explainability",
  "evidence_quality",
  "strategic_alignment",
  "confidence_calibration",
  "completeness",
  "consistency",
  "stability",
  "novelty",
  "decision_usefulness",
] as const;

export type EvaluationDimensionId = (typeof EVALUATION_DIMENSIONS)[number];

export const EVALUATION_DIMENSION_LABELS: Record<
  EvaluationDimensionId,
  string
> = {
  explainability: "Explainability",
  evidence_quality: "Evidence quality",
  strategic_alignment: "Strategic alignment",
  confidence_calibration: "Confidence calibration",
  completeness: "Completeness",
  consistency: "Consistency",
  stability: "Stability",
  novelty: "Novelty",
  decision_usefulness: "Decision usefulness",
};

export type DimensionScore = {
  id: EvaluationDimensionId;
  label: string;
  score: number;
  reasoning: string;
  evidence: string[];
};

export type RecommendationEvaluation = {
  recommendationId: string;
  decisionId: string | null;
  title: string;
  act: string;
  dimensions: DimensionScore[];
  /** Weighted aggregate 0–100 */
  overallScore: number;
  pass: boolean;
  gatesFailed: string[];
  reasoning: string;
};

export type EvaluationGate = {
  id: string;
  dimension: EvaluationDimensionId;
  /** Minimum score to pass */
  minimum: number;
  message: string;
};

export const DEFAULT_EVALUATION_GATES: EvaluationGate[] = [
  {
    id: "gate-explainability",
    dimension: "explainability",
    minimum: 50,
    message: "Recommendation lacks explainable reasoning path.",
  },
  {
    id: "gate-evidence",
    dimension: "evidence_quality",
    minimum: 45,
    message: "Evidence quality below executive threshold.",
  },
  {
    id: "gate-completeness",
    dimension: "completeness",
    minimum: 50,
    message: "Recommendation incomplete (missing alternatives/unknowns/trade-offs).",
  },
  {
    id: "gate-usefulness",
    dimension: "decision_usefulness",
    minimum: 45,
    message: "Recommendation not useful for executive judgement.",
  },
];
