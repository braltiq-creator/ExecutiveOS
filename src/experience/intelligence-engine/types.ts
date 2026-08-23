import type { McSeverity, McTrend } from "@/experience/mission-control/types";

/** Presentation-only Executive Intelligence Engine models. */

export type JudgementKind =
  | "decision"
  | "risk"
  | "opportunity"
  | "strategy"
  | "learning";

export type JudgementReasoning = {
  whyMatters: string;
  evidence: string[];
  alternatives: string;
  expectedOutcome: string;
  confidence: number;
  suggestedAction: string;
};

export type JudgementItem = {
  id: string;
  kind: JudgementKind;
  title: string;
  whyItMatters: string;
  organisationalImpact: string;
  confidence: number;
  costOfDelay: string;
  recommendedAction: string;
  href: string;
  /** Composite rank 0–100 for ordering. */
  rankScore: number;
  reasoning: JudgementReasoning;
};

export type IntelligenceScore = {
  overall: number;
  confidence: number;
  evidenceCoverage: number;
  evidenceFreshness: number;
  recommendationQuality: number;
  dataQuality: number;
  trend: McTrend;
  severity: McSeverity;
  explanation: string;
  href: string;
};

export type IntelligenceSummaryBullet = {
  id: string;
  text: string;
  tone: "positive" | "attention" | "neutral";
};

export type IntelligenceSummary = {
  bullets: IntelligenceSummaryBullet[];
  judgementCount: number;
  closing: string;
};

/** Compact Mission Control overnight strip — max ~140px. */
export type CommandBrief = {
  judgementCount: number;
  healthValue: number;
  healthStatus: string;
  healthTrend: McTrend;
  commercialLabel: string;
  riskLabel: string;
  intelligence: number;
  confidence: number;
  href: string;
};

export type IntelligenceTimelineEvent = {
  id: string;
  at: string;
  title: string;
  detail: string;
  kind:
    | "decision"
    | "health"
    | "opportunity"
    | "recommendation"
    | "judgement";
};

/** Unified chronological stream for Mission Control right column. */
export type IntelligenceStreamEvent = {
  id: string;
  at: string;
  timeLabel: string;
  title: string;
  detail?: string;
  href: string;
  highlight?: boolean;
};

export type ExecutiveIntelligenceView = {
  score: IntelligenceScore;
  summary: IntelligenceSummary;
  brief: CommandBrief;
  queue: JudgementItem[];
  timeline: IntelligenceTimelineEvent[];
  stream: IntelligenceStreamEvent[];
};
