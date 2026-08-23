/**
 * Executive Judgement Framework (EJF) — Phase 51
 *
 * Sits above Executive Intelligence Models (reasoning)
 * and below Executive Council recommendations (advice).
 *
 * Models define how executives think.
 * Judgement defines whether action is required — and which posture.
 *
 * Not Core. Not EJE option-scoring. Not packs. Not providers.
 */

import type {
  ExecutiveIntelligenceRoleId,
  IndustryOverlayId,
} from "@/intelligence-models/types";

export type EjfSemVer = {
  major: number;
  minor: number;
  patch: number;
};

export type JudgementStateId =
  | "observe"
  | "monitor"
  | "investigate"
  | "challenge"
  | "recommend"
  | "escalate"
  | "crisis";

/** Ordered by increasing action intensity (not severity alone). */
export const JUDGEMENT_STATE_ORDER: readonly JudgementStateId[] = [
  "observe",
  "monitor",
  "investigate",
  "challenge",
  "recommend",
  "escalate",
  "crisis",
] as const;

export type JudgementFactorId =
  | "business_impact"
  | "urgency"
  | "confidence"
  | "evidence_quality"
  | "outcome_alignment"
  | "strategic_importance"
  | "risk"
  | "opportunity"
  | "cost_of_delay"
  | "reversibility"
  | "decision_complexity"
  | "stakeholder_impact";

export const JUDGEMENT_FACTORS: readonly JudgementFactorId[] = [
  "business_impact",
  "urgency",
  "confidence",
  "evidence_quality",
  "outcome_alignment",
  "strategic_importance",
  "risk",
  "opportunity",
  "cost_of_delay",
  "reversibility",
  "decision_complexity",
  "stakeholder_impact",
] as const;

export const JUDGEMENT_FACTOR_LABELS: Record<JudgementFactorId, string> = {
  business_impact: "Business impact",
  urgency: "Urgency",
  confidence: "Confidence",
  evidence_quality: "Evidence quality",
  outcome_alignment: "Outcome alignment",
  strategic_importance: "Strategic importance",
  risk: "Risk",
  opportunity: "Opportunity",
  cost_of_delay: "Cost of delay",
  reversibility: "Reversibility",
  decision_complexity: "Decision complexity",
  stakeholder_impact: "Stakeholder impact",
};

/** 0–100 factor reading supplied by intelligence / simulation / packs later. */
export type JudgementFactorReading = {
  id: JudgementFactorId;
  /** 0–100; meaning is factor-specific (see factorDefinitions). */
  value: number;
  note?: string;
};

export type ConfidenceBand = {
  /** Minimum confidence (0–100) typically required to enter this state */
  enterMin: number;
  /** Above this, prefer exiting toward action or resolution */
  exitMax: number;
};

export type JudgementStateDefinition = {
  id: JudgementStateId;
  label: string;
  purpose: string;
  entryConditions: string[];
  exitConditions: string[];
  confidence: ConfidenceBand;
  escalationRules: string[];
  expectedExecutiveBehaviour: string[];
  typicalCouncilInteraction: string;
  communicationStyle: string;
};

export type FactorWeight = {
  factor: JudgementFactorId;
  /** Relative weight 0–1 within role model (need not sum to 1; normalised at evaluate). */
  weight: number;
  /** How this role interprets the factor when high */
  interpretation: string;
};

/**
 * How a role decides whether action is required.
 * Distinct from EIM (how they reason about the situation).
 */
export type ExecutiveJudgementModel = {
  version: EjfSemVer;
  roleId: ExecutiveIntelligenceRoleId;
  title: string;
  judgementIdentity: string;
  /** Factors this role privileges when choosing posture */
  primaryFactors: JudgementFactorId[];
  factorWeights: FactorWeight[];
  /**
   * Bias on action intensity: negative = more willing to observe;
   * positive = more willing to escalate. Applied after weighted score.
   */
  actionBias: number;
  /**
   * Confidence required before Recommend (role-specific).
   * Below this with material stakes → Investigate or Challenge.
   */
  recommendConfidenceFloor: number;
  /**
   * Risk / impact level that forces Escalate regardless of confidence.
   */
  escalateForceThreshold: number;
  /**
   * Crisis entry — existential or immediate irreversible harm.
   */
  crisisForceThreshold: number;
  /** Explicit permission to hold Observe / Monitor (not recommend). */
  mayWithholdRecommendation: true;
  decisionPriorities: string[];
  escalationPhilosophy: string;
  learningFocus: string[];
};

/** Industry adjusts thresholds only — never redefines role judgement identity. */
export type JudgementIndustryOverlay = {
  id: IndustryOverlayId;
  roleId: ExecutiveIntelligenceRoleId;
  version: EjfSemVer;
  /** Additive delta on actionBias (clamped later). */
  actionBiasDelta: number;
  recommendConfidenceFloorDelta: number;
  escalateForceThresholdDelta: number;
  crisisForceThresholdDelta: number;
  thresholdNotes: string[];
};

export type ResolvedExecutiveJudgementModel = ExecutiveJudgementModel & {
  industry: IndustryOverlayId | null;
  overlayApplied: boolean;
  overlayNotes: string[];
};

export type FactorBundle = Partial<Record<JudgementFactorId, number>> & {
  notes?: Partial<Record<JudgementFactorId, string>>;
};

export type RoleJudgementAssessment = {
  roleId: ExecutiveIntelligenceRoleId;
  state: JudgementStateId;
  stateLabel: string;
  /** Explainable intensity score after weights + bias (0–100). */
  intensity: number;
  confidence: number;
  evidenceQuality: number;
  primaryDrivers: JudgementFactorId[];
  rationale: string[];
  /** True when posture is observe/monitor — action not recommended yet. */
  withholdsRecommendation: boolean;
  mayEscalateAlone: boolean;
  industry: IndustryOverlayId | null;
};

/**
 * Council preserves differing states — never averages them into silence.
 */
export type CouncilJudgement = {
  asOf: string;
  assessments: RoleJudgementAssessment[];
  /** Distinct states held — preserved, not collapsed. */
  dissentingStates: Array<{
    roleId: ExecutiveIntelligenceRoleId;
    state: JudgementStateId;
  }>;
  /**
   * Working consensus posture for next council move.
   * Derived by rules that respect disagreement — not arithmetic mean.
   */
  consensusState: JudgementStateId;
  consensusNarrative: string;
  /** Roles that disagree with consensusState */
  minority: Array<{
    roleId: ExecutiveIntelligenceRoleId;
    state: JudgementStateId;
    note: string;
  }>;
  requiresInvestigationBeforeDecision: boolean;
  escalateImmediately: boolean;
};

export type JudgementLearningMetricId =
  | "judgement_quality"
  | "escalation_accuracy"
  | "false_positives"
  | "false_negatives"
  | "recommendation_timing"
  | "decision_outcomes"
  | "confidence_calibration";

export type JudgementLearningSignal = {
  roleId: ExecutiveIntelligenceRoleId;
  metric: JudgementLearningMetricId;
  /** -1..+1 improvement direction for threshold refinement */
  delta: number;
  observation: string;
  asOf: string;
};

export type JudgementThresholdRefinement = {
  roleId: ExecutiveIntelligenceRoleId;
  recommendConfidenceFloorDelta: number;
  escalateForceThresholdDelta: number;
  actionBiasDelta: number;
  rationale: string[];
};

export type EjfSelfReview = {
  distinguishesReasoningFromJudgement: boolean;
  canWithholdRecommendation: boolean;
  canHoldDifferingStates: boolean;
  canImproveThroughLearning: boolean;
  allPassed: boolean;
  notes: string[];
};
