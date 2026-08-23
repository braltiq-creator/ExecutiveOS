import type { McSeverity, McTrend } from "@/experience/mission-control/types";

/** Presentation-only Executive Outcomes Engine models. */

export type OutcomePortfolioItem = {
  id: string;
  name: string;
  health: string;
  healthTone: McSeverity;
  trajectory: string;
  trend: McTrend;
  businessImpact: string;
  confidence: number;
  owner: string;
  targetDate: string;
  href: string;
};

export type OutcomeRelationKind =
  | "Organisation Health"
  | "Strategy"
  | "Decision"
  | "Knowledge"
  | "Risk"
  | "Opportunity"
  | "Project"
  | "Customer";

export type OutcomeRelation = {
  id: string;
  kind: OutcomeRelationKind;
  label: string;
  href: string;
};

export type OutcomeHealthView = {
  outcomeId: string;
  name: string;
  currentState: string;
  trajectory: string;
  trend: McTrend;
  severity: McSeverity;
  confidence: number;
  drivers: string[];
  risks: string[];
  opportunities: string[];
  recommendedDecisions: Array<{ id: string; title: string; href: string }>;
  explanation: string;
};

export type OutcomeTimelineEvent = {
  id: string;
  at: string;
  title: string;
  detail: string;
  kind:
    | "decision"
    | "health"
    | "outcome"
    | "confidence"
    | "recommendation";
};

export type OutcomeImpactView = {
  outcomeId: string;
  outcomeName: string;
  predictedImprovement: string;
  actualImprovement: string;
  variance: string;
  learning: string;
  href: string;
};

export type OutcomeContext = {
  outcomeId: string;
  name: string;
  health: string;
  healthTone: McSeverity;
  label: string;
  detail: string;
  href: string;
};

export type OutcomesEngineView = {
  portfolio: OutcomePortfolioItem[];
  focus: OutcomeContext | null;
  health: OutcomeHealthView | null;
  relationships: OutcomeRelation[];
  timeline: OutcomeTimelineEvent[];
  impact: OutcomeImpactView | null;
};
