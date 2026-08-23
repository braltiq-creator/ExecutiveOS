/**
 * Continuous morning Briefing narrative — first half of Today.
 * Derived observations and recommendations; not a widget model.
 */

export type OutcomeMovementDirection = "improved" | "declined" | "stable";

export type OutcomeMovement = {
  id: string;
  outcomeId: string;
  outcomeName: string;
  direction: OutcomeMovementDirection;
  /** e.g. "Down 6 pts overnight" */
  changeLabel: string;
  why: string;
  overnightNote: string | null;
};

export type BriefingPriorityDecision = {
  id: string;
  title: string;
  whyNow: string;
  expectedImpact: string;
  /** Minutes for the executive to decide */
  estimatedMinutes: number;
  href: string;
};

export type StrategicObservation = {
  id: string;
  observation: string;
  implication: string;
};

export type RecommendationStance =
  | "approve"
  | "delegate"
  | "schedule"
  | "escalate"
  | "wait";

export type BriefingRecommendation = {
  id: string;
  stance: RecommendationStance;
  stanceLabel: string;
  title: string;
  reason: string;
  href?: string;
};

export type MorningNarrative = {
  transitionToOutcomes: string;
  transitionToDecisions: string;
  transitionToInsights: string;
  transitionToActions: string;
  closingLine: string;
  outcomeMovements: OutcomeMovement[];
  priorityDecisions: BriefingPriorityDecision[];
  observations: StrategicObservation[];
  recommendations: BriefingRecommendation[];
};

export const STANCE_LABELS: Record<RecommendationStance, string> = {
  approve: "Approve",
  delegate: "Delegate",
  schedule: "Schedule",
  escalate: "Escalate",
  wait: "Wait",
};
