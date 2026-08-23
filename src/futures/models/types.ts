/**
 * Executive Futures Engine — first-class future models.
 * Scenario reasoning, not ML forecasting. Never invents evidence.
 */

import type { CouncilAgentId, AgentStance } from "@/agents/types";

export const TIME_HORIZON_IDS = [
  "24h",
  "7d",
  "30d",
  "90d",
  "12m",
  "3y",
] as const;

export type TimeHorizonId = (typeof TIME_HORIZON_IDS)[number];

export type TimeHorizon = {
  id: TimeHorizonId;
  label: string;
  days: number;
  executiveUse: string;
};

export const BUSINESS_DRIVER_IDS = [
  "revenue",
  "cash_flow",
  "capacity",
  "customer_demand",
  "asset_reliability",
  "labour_availability",
  "safety",
  "supply_chain",
  "regulatory",
  "technology",
  "market_conditions",
  "strategic_initiatives",
] as const;

export type BusinessDriverId = (typeof BUSINESS_DRIVER_IDS)[number];

export type BusinessDriver = {
  id: BusinessDriverId;
  label: string;
  description: string;
  typicalSignals: string[];
};

export const FUTURE_CASE_KINDS = [
  "best_case",
  "expected_case",
  "worst_case",
  "most_likely",
  "black_swan",
] as const;

export type FutureCaseKind = (typeof FUTURE_CASE_KINDS)[number];

export const INTERVENTION_KINDS = [
  "high_impact",
  "low_effort",
  "urgent",
  "preventative",
  "deferred",
] as const;

export type InterventionKind = (typeof INTERVENTION_KINDS)[number];

export type Intervention = {
  id: string;
  kind: InterventionKind;
  title: string;
  rationale: string;
  relatedDecisionIds: string[];
  relatedOutcomeIds: string[];
  effort: "low" | "moderate" | "high";
  impact: "low" | "moderate" | "high";
};

export type EarlyWarningSignal = {
  id: string;
  label: string;
  /** What to watch */
  monitor: string;
  threshold: string;
  escalationTrigger: string;
  /** How confidence in this future should move when the signal fires */
  confidenceChange: string;
  recoveryIndicator: string;
  relatedDriverIds: BusinessDriverId[];
};

export type PotentialImpact = {
  area: string;
  direction: "positive" | "negative" | "mixed";
  detail: string;
  driverIds: BusinessDriverId[];
};

export type FutureExplanation = {
  whyItExists: string;
  assumptionsThatCreatedIt: string[];
  evidenceThatSupports: string[];
  evidenceThatWeakens: string[];
  whatWouldInvalidateIt: string[];
  influenceLevers: string[];
};

export type Future = {
  id: string;
  title: string;
  description: string;
  caseKind: FutureCaseKind;
  /** 0–100 relative plausibility among generated set */
  probability: number;
  /** 0–100 trust in the projection given evidence quality */
  confidence: number;
  timeHorizon: TimeHorizonId;
  drivers: BusinessDriverId[];
  supportingEvidence: string[];
  keyAssumptions: string[];
  dependencies: string[];
  potentialImpacts: PotentialImpact[];
  recommendedInterventions: Intervention[];
  leadingIndicators: EarlyWarningSignal[];
  alternativeOutcomes: string[];
  explanation: FutureExplanation;
};

export const FUTURE_SPOTLIGHTS = [
  "most_likely",
  "greatest_risk",
  "greatest_opportunity",
  "fastest_emerging",
  "most_strategic",
] as const;

export type FutureSpotlight = (typeof FUTURE_SPOTLIGHTS)[number];

export type FutureCouncilPerspective = {
  agentId: CouncilAgentId;
  title: string;
  shortTitle: string;
  stance: AgentStance;
  summary: string;
  agreement: "supports" | "challenges" | "conditional";
  assumptionsChallenged: string[];
  interventionsFavoured: string[];
  confidence: number;
  reasoning: string[];
};

export type FutureCouncilDisagreement = {
  topic: string;
  positions: Array<{
    agent: string;
    stance: string;
    statement: string;
  }>;
  facilitation: string;
};

export type FutureCouncilReview = {
  futureId: string;
  futureTitle: string;
  perspectives: FutureCouncilPerspective[];
  disagreements: FutureCouncilDisagreement[];
};

export type FuturesBrief = {
  asOf: string;
  framing: string;
  futures: Future[];
  /** Spotlight → future id */
  spotlights: Record<FutureSpotlight, string>;
  councilReviews: FutureCouncilReview[];
  closingNote: string;
};

/** Presentation model for Today */
export type FutureView = {
  id: string;
  title: string;
  description: string;
  caseKind: FutureCaseKind;
  caseLabel: string;
  probability: number;
  confidence: number;
  timeHorizonLabel: string;
  whyItExists: string;
  keyAssumptions: string[];
  supportingEvidence: string[];
  weakeningEvidence: string[];
  interventions: Array<{
    kind: InterventionKind;
    kindLabel: string;
    title: string;
    rationale: string;
  }>;
  signals: Array<{
    label: string;
    monitor: string;
    threshold: string;
    escalationTrigger: string;
  }>;
  alternativeOutcomes: string[];
  influenceLevers: string[];
  council: Array<{
    agent: string;
    shortTitle: string;
    agreement: string;
    summary: string;
    stance: string;
  }>;
  disagreements: FutureCouncilDisagreement[];
};

export type PossibleFuturesView = {
  framing: string;
  spotlights: Array<{
    id: FutureSpotlight;
    label: string;
    futureId: string;
    title: string;
    oneLiner: string;
  }>;
  futures: FutureView[];
  closingNote: string;
};

export type FutureSimulationScore = {
  predictionQuality: number;
  confidenceCalibration: number;
  interventionEffectiveness: number;
  decisionQuality: number;
  overall: number;
  notes: string[];
};
