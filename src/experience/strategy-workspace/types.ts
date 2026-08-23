import type { McSeverity, McTrend } from "@/experience/mission-control/types";

export type StrategyEntryFrom =
  | "organisation_health"
  | "strategic_outcomes"
  | "commercial_health"
  | "priority"
  | "activity"
  | "nav";

export type StrategySectionId =
  | "organisation-health"
  | "outcome-portfolio"
  | "business-drivers"
  | "key-risks"
  | "strategic-opportunities"
  | "recommended-decisions"
  | "related-knowledge";

export type SwOrgHealth = {
  score: number;
  trend: McTrend;
  severity: McSeverity;
  confidence: number;
  updatedLabel: string;
  summary: string;
  whyMoved: string;
  primaryDrivers: string[];
  history: number[];
};

export type SwOutcomeCard = {
  id: string;
  name: string;
  health: string;
  healthTone: McSeverity;
  trajectory: string;
  trend: McTrend;
  owner: string;
  impact: string;
  nextDecision: string;
  detail: string;
  measures: string[];
  href: string;
};

export type SwDriverId =
  | "commercial"
  | "customers"
  | "people"
  | "operations"
  | "technology"
  | "risk";

export type SwDriver = {
  id: SwDriverId;
  label: string;
  status: string;
  trend: McTrend;
  severity: McSeverity;
  confidence: number;
  impact: string;
  href: string;
};

export type SwRisk = {
  id: string;
  risk: string;
  likelihood: string;
  impact: string;
  owner: string;
  mitigation: string;
  href: string;
};

export type SwOpportunity = {
  id: string;
  title: string;
  expectedValue: string;
  confidence: number;
  action: string;
  href: string;
};

export type SwDecision = {
  id: string;
  title: string;
  expectedImprovement: string;
  confidence: number;
  costOfDelay: string;
  href: string;
};

export type SwKnowledge = {
  id: string;
  kind: "Document" | "Meeting" | "Insight" | "AI Analysis";
  title: string;
  href: string;
};

export type StrategyWorkspaceModel = {
  entry: StrategyEntryFrom;
  focusSection: StrategySectionId;
  highlightDriverId: SwDriverId | null;
  orgHealth: SwOrgHealth;
  outcomes: SwOutcomeCard[];
  drivers: SwDriver[];
  risks: SwRisk[];
  opportunities: SwOpportunity[];
  decisions: SwDecision[];
  knowledge: SwKnowledge[];
};
