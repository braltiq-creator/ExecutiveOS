/**
 * Executive Judgement Engine (EJE) — structures judgement, never decides.
 * Pure TypeScript. Deterministic. Explainable.
 */

import type { ConfidenceScore } from "@/intelligence/executive-intelligence/types";
import type { RecommendationAct } from "@/intelligence/executive-intelligence/types";

export const JUDGEMENT_DIMENSIONS = [
  "strategic_alignment",
  "financial_impact",
  "operational_impact",
  "customer_impact",
  "people_impact",
  "compliance",
  "risk_profile",
  "opportunity_cost",
  "timing",
  "confidence",
] as const;

export type JudgementDimensionId = (typeof JUDGEMENT_DIMENSIONS)[number];

export const JUDGEMENT_DIMENSION_LABELS: Record<JudgementDimensionId, string> = {
  strategic_alignment: "Strategic alignment",
  financial_impact: "Financial impact",
  operational_impact: "Operational impact",
  customer_impact: "Customer impact",
  people_impact: "People impact",
  compliance: "Compliance / regulatory",
  risk_profile: "Risk profile",
  opportunity_cost: "Opportunity cost",
  timing: "Timing",
  confidence: "Confidence",
};

/** Higher score = more favourable for taking thoughtful action on this dimension. */
export type JudgementDimensionScore = {
  id: JudgementDimensionId;
  label: string;
  /** 0–100 favourability for the option / decision under evaluation */
  score: number;
  polarity: "supports" | "cautions" | "neutral" | "mixed";
  reasoning: string;
  evidence: string[];
};

export type DecisionOption = {
  id: string;
  label: string;
  act: RecommendationAct;
  summary: string;
  /** Optional pre-seeded dimension hints for mock / connector use */
  dimensionHints?: Partial<Record<JudgementDimensionId, number>>;
};

export type JudgementUnknown = {
  id: string;
  question: string;
  whyItMatters: string;
  howToResolve: string;
  severity: "material" | "moderate" | "minor";
  relatedEntityIds: string[];
};

export type JudgementTradeoff = {
  id: string;
  gains: string;
  costs: string;
  dimensions: JudgementDimensionId[];
  severity: "high" | "medium" | "low";
};

export type JudgementDependency = {
  id: string;
  label: string;
  kind: "decision" | "action" | "person" | "meeting" | "system" | "outcome" | "other";
  status: "ready" | "blocked" | "unknown";
  relatedEntityId?: string;
};

export type ReasoningPathStep = {
  id: string;
  label: string;
  detail: string;
  system: string;
};

/** Structured pack required for every recommendation / option. */
export type JudgementPack = {
  benefits: string[];
  risks: string[];
  tradeoffs: JudgementTradeoff[];
  dependencies: JudgementDependency[];
  alternatives: DecisionOption[];
  unknowns: JudgementUnknown[];
  evidence: string[];
  confidence: ConfidenceScore;
  reasoningPath: ReasoningPathStep[];
};

export type OptionEvaluation = {
  option: DecisionOption;
  dimensions: JudgementDimensionScore[];
  pack: JudgementPack;
  /** Balance score — not a decision; aids comparison only */
  balanceScore: number;
  leaningLabel: "stronger" | "balanced" | "weaker";
};

export type DecisionEvaluation = {
  decisionId: string;
  question: string;
  asOf: string;
  dimensions: JudgementDimensionScore[];
  options: OptionEvaluation[];
  /** Never a sole course — always accompanied by alternatives when present */
  primaryOptionId: string | null;
  comparisonSummary: string;
  unknowns: JudgementUnknown[];
  tradeoffs: JudgementTradeoff[];
  systems: string[];
};

export type OptionComparison = {
  decisionId: string;
  options: OptionEvaluation[];
  winnersByDimension: Partial<Record<JudgementDimensionId, string>>;
  summary: string;
  tradeoffs: JudgementTradeoff[];
};

export type JudgementResult = {
  decisionId: string;
  recommendationId?: string;
  evaluation: DecisionEvaluation;
  pack: JudgementPack;
  /** Explicit stance: structures thinking; does not bind */
  stance: "lean_approve" | "lean_investigate" | "lean_wait" | "lean_delegate" | "balanced";
  stanceReason: string;
};

export type DecisionBrief = {
  decisionId: string;
  question: string;
  asOf: string;
  executiveSummary: string;
  whatIsAtStake: string[];
  optionsInPlay: Array<{
    id: string;
    label: string;
    act: RecommendationAct;
    balanceScore: number;
    oneLiner: string;
  }>;
  tradeoffs: JudgementTradeoff[];
  unknowns: JudgementUnknown[];
  evidence: string[];
  confidence: ConfidenceScore;
  intentAlignment: string;
  memoryContext: string[];
  graphPaths: string[];
  closingNote: string;
};
