/**
 * Strategic Outcomes Framework — types.
 * Aligns recommendations, scenarios, and decisions to organisational strategy.
 * Distinct from src/lib/outcomes (portfolio SoT) and src/outcomes (value engine).
 */

import type { IntelligenceProfileId } from "@/profiles";

export type StrategicOutcomeHealth =
  | "on_track"
  | "at_risk"
  | "off_track"
  | "watching"
  | "achieved";

export type StrategicImportance = "critical" | "high" | "moderate" | "supporting";

export type StrategicOutcome = {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  executiveOwner: string;
  profileId: IntelligenceProfileId;
  targetDate: string | null;
  currentHealth: StrategicOutcomeHealth;
  confidence: number;
  successMeasures: string[];
  supportingKpis: string[];
  businessCapabilities: string[];
  strategicImportance: StrategicImportance;
  dependencyIds: string[];
  evidence: string[];
  source: "discovery" | "manual" | "refined" | "imported";
  createdAt: string;
  updatedAt: string;
};

export type StrategicInitiativeStatus =
  | "planned"
  | "active"
  | "drifting"
  | "blocked"
  | "completed"
  | "cancelled";

export type StrategicInitiativeLink = {
  id: string;
  tenantId: string;
  outcomeId: string;
  name: string;
  status: StrategicInitiativeStatus;
  progressPct: number;
  owner: string;
  dependencyIds: string[];
  businessEventIds: string[];
  recommendationIds: string[];
  executiveDecisionIds: string[];
  scenarioIds: string[];
  businessOutcomeIds: string[];
  evidence: string[];
  updatedAt: string;
  createdAt: string;
};

export type StrategicMetric = {
  id: string;
  tenantId: string;
  outcomeId: string;
  label: string;
  currentValue: number | null;
  targetValue: number | null;
  unit: string;
  trend: "up" | "flat" | "down";
  asOf: string;
};

export type AlignmentLink = {
  id: string;
  tenantId: string;
  recommendationId: string | null;
  recommendationTitle: string;
  outcomeId: string;
  outcomeName: string;
  expectedImpact: string;
  confidence: number;
  evidence: string[];
  potentialRisk: string;
  estimatedContribution: number;
  providerIds: string[];
  decisionId: string | null;
  asOf: string;
};

export type AlignmentSnapshot = {
  tenantId: string;
  asOf: string;
  recommendationAlignments: AlignmentLink[];
  decisionAlignments: AlignmentLink[];
  driftingInitiatives: StrategicInitiativeLink[];
  improvingOutcomes: StrategicOutcome[];
  providerEvidence: Array<{
    providerId: string;
    outcomeIds: string[];
    contribution: string;
  }>;
  explanation: string;
};

export type OutcomeProgressSnapshot = {
  tenantId: string;
  asOf: string;
  outcomes: Array<{
    outcomeId: string;
    name: string;
    health: StrategicOutcomeHealth;
    progressPct: number;
    confidence: number;
    initiativeCount: number;
    recommendationContribution: number;
  }>;
  overallProgressPct: number;
  explanation: string;
};

export type StrategyValidationSnapshot = {
  tenantId: string;
  asOf: string;
  outcomeProgress: number;
  recommendationContribution: number;
  executiveDecisionsLinked: number;
  businessOutcomesLinked: number;
  initiativeHealth: number;
  confidence: number;
  explanation: string;
};

export type StrategyRoadmapItem = {
  id: string;
  tenantId: string;
  outcomeId: string;
  title: string;
  horizon: "now" | "next" | "later";
  status: "planned" | "in_progress" | "done";
  owner: string;
};

export type StrategyDashboard = {
  asOf: string;
  tenantId: string;
  outcomes: StrategicOutcome[];
  initiatives: StrategicInitiativeLink[];
  alignment: AlignmentSnapshot;
  progress: OutcomeProgressSnapshot;
  validation: StrategyValidationSnapshot;
  metrics: StrategicMetric[];
  roadmaps: StrategyRoadmapItem[];
};

/** Today presentation fields */
export type StrategyActionReference = {
  supportsOutcome: string;
  supportsOutcomeId: string;
  expectedImpact: string;
  strategyConfidence: number;
  strategyEvidence: string[];
  potentialRisk: string;
  estimatedContribution: number;
};
