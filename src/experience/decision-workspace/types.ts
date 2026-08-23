import type { McSeverity, McTrend } from "@/experience/mission-control/types";

export type DecisionEntryFrom =
  | "priority_decisions"
  | "critical_risks"
  | "priority"
  | "activity"
  | "strategy_decisions"
  | "strategy_outcomes"
  | "manufacturing_judgement"
  | "nav";

export type DecisionSectionId =
  | "decision-portfolio"
  | "highest-impact"
  | "impact-simulator"
  | "supporting-evidence"
  | "stakeholders"
  | "dependencies"
  | "related-strategy"
  | "related-knowledge"
  | "decision-timeline";

export type DwPortfolioCard = {
  id: string;
  name: string;
  expectedValue: string;
  healthImpact: string;
  confidence: number;
  costOfDelay: string;
  status: string;
  rankScore: number;
  href: string;
};

export type DwSimulator = {
  decisionId: string;
  decisionName: string;
  organisationHealth: { before: number; after: number; trend: McTrend };
  commercialHealth: {
    before: string;
    after: string;
    trend: McTrend;
  };
  strategicOutcomeImpact: string;
  executiveValueImpact: string;
  confidence: number;
  recommendation: string;
  severity: McSeverity;
};

export type DwEvidence = {
  id: string;
  title: string;
  source: string;
  summary: string;
  href: string;
};

export type DwStakeholder = {
  id: string;
  name: string;
  role: string;
  stance: string;
  note: string;
};

export type DwDependency = {
  id: string;
  label: string;
  relationship: string;
  explanation: string;
  href: string;
};

export type DwStrategyLink = {
  id: string;
  outcomeName: string;
  impact: string;
  href: string;
};

export type DwKnowledge = {
  id: string;
  kind: string;
  title: string;
  href: string;
};

export type DwTimelineEvent = {
  id: string;
  at: string;
  title: string;
  detail: string;
  kind: string;
};

export type DecisionWorkspaceView = {
  entry: DecisionEntryFrom;
  focusSection: DecisionSectionId;
  selectedId: string | null;
  portfolio: DwPortfolioCard[];
  highestImpact: DwPortfolioCard | null;
  simulator: DwSimulator | null;
  evidence: DwEvidence[];
  stakeholders: DwStakeholder[];
  dependencies: DwDependency[];
  relatedStrategy: DwStrategyLink[];
  knowledge: DwKnowledge[];
  timeline: DwTimelineEvent[];
};
