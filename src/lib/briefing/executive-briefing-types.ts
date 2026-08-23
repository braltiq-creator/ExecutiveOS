import type { LeadJudgementModel } from "@/lib/briefing/lead-judgement-types";

/** @deprecated Use OutcomeStatus from `@/lib/outcomes/types`. */
export type OutcomeStatus = "on_track" | "at_risk" | "off_track" | "watching";

export type RecommendationFields = {
  businessImpact: string;
  expectedOutcomeImpact: string;
  confidence: number;
  owner: string;
  deadline: string;
};

export type BriefingSignal = {
  id: string;
  whatChanged: string;
  why: string;
  outcomeId: string;
  whatShouldHappenNext: string;
  recommendation: RecommendationFields;
};

export type PriorityDecision = BriefingSignal & {
  question: string;
  status: "pending" | "under_review" | "due_today";
};

export type TopInsight = BriefingSignal & {
  sourceLabel: string;
};

export type RecommendedAction = BriefingSignal & {
  actionLabel: string;
};

export type OvernightChange = BriefingSignal & {
  occurredAt: string;
  severity: "critical" | "attention" | "info";
};

export type CalendarContextItem = {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  attendeesSummary: string;
  whatChanged: string;
  why: string;
  outcomeId: string;
  whatShouldHappenNext: string;
  recommendation: RecommendationFields;
};

export type ExecutiveSummary = {
  greeting: string;
  asOf: string;
  headline: string;
  whatChanged: string;
  why: string;
  outcomeId: string;
  whatShouldHappenNext: string;
  recommendation: RecommendationFields;
  attentionCount: number;
  decisionsDueToday: number;
};

export type IntelligenceBundle = {
  overnightChanges: OvernightChange[];
  priorityDecisions: PriorityDecision[];
  topInsights: TopInsight[];
  recommendedActions: RecommendedAction[];
  calendarContext: CalendarContextItem[];
};

export type ExecutiveBriefingData = {
  summary: ExecutiveSummary;
  /** Defining Today experience — Chief of Staff lead judgement */
  leadJudgement: LeadJudgementModel;
  layoutHint: "standard" | "board";
};
