/**
 * Enterprise Simulation Environment — internal Braltiq stress-test types.
 * Never exposed to customers.
 */

import type { LabRunResult } from "@/simulation/runner";
import type { OrganisationIndustry, ScenarioKind } from "@/simulation/types";

export type OperatingMode = "normal" | "growth" | "crisis";

export type EnterpriseScoreDimensionId =
  | "decision_quality"
  | "time_to_insight"
  | "executive_preparation"
  | "strategic_alignment"
  | "outcome_improvement"
  | "council_collaboration"
  | "recommendation_accuracy"
  | "business_value"
  | "trust"
  | "confidence"
  | "explainability";

export const ENTERPRISE_SCORE_DIMENSIONS: EnterpriseScoreDimensionId[] = [
  "decision_quality",
  "time_to_insight",
  "executive_preparation",
  "strategic_alignment",
  "outcome_improvement",
  "council_collaboration",
  "recommendation_accuracy",
  "business_value",
  "trust",
  "confidence",
  "explainability",
];

export const ENTERPRISE_SCORE_LABELS: Record<
  EnterpriseScoreDimensionId,
  string
> = {
  decision_quality: "Decision Quality",
  time_to_insight: "Time to Insight",
  executive_preparation: "Executive Preparation",
  strategic_alignment: "Strategic Alignment",
  outcome_improvement: "Outcome Improvement",
  council_collaboration: "Council Collaboration",
  recommendation_accuracy: "Recommendation Accuracy",
  business_value: "Business Value",
  trust: "Trust",
  confidence: "Confidence",
  explainability: "Explainability",
};

export type EnterpriseDepartment = {
  id: string;
  name: string;
  headcount: number;
  owner: string;
};

export type EnterprisePerson = {
  id: string;
  name: string;
  title: string;
  departmentId: string;
  isExecutive: boolean;
};

export type EnterpriseCustomer = {
  id: string;
  name: string;
  arr: number;
  health: "strong" | "stable" | "at_risk";
};

export type EnterpriseProject = {
  id: string;
  name: string;
  owner: string;
  budget: number;
  status: "on_track" | "at_risk" | "delayed";
};

export type EnterpriseIntegrationActivity = {
  microsoft365: {
    meetingsThisWeek: number;
    unreadExecutiveThreads: number;
    calendarLoadHours: number;
  };
  salesforce: {
    openPipeline: number;
    opportunitiesAtRisk: number;
    nextCloseDate: string;
  };
  simpro: {
    openJobs: number;
    overdueJobs: number;
    technicianUtilisation: number;
  };
};

export type EnterpriseCadence = {
  daily: string[];
  weekly: string[];
  monthly: string[];
  quarterly: string[];
  boardCalendar: string[];
};

export type EnterpriseModel = {
  organisationId: string;
  name: string;
  industry: OrganisationIndustry;
  description: string;
  executives: EnterprisePerson[];
  employees: EnterprisePerson[];
  departments: EnterpriseDepartment[];
  customers: EnterpriseCustomer[];
  revenue: {
    arr: number;
    currency: string;
    growthPct: number;
    forecastConfidence: number;
  };
  projects: EnterpriseProject[];
  budgets: Array<{
    id: string;
    name: string;
    approved: number;
    spent: number;
    owner: string;
  }>;
  meetings: Array<{
    id: string;
    subject: string;
    when: string;
    owner: string;
  }>;
  integrations: EnterpriseIntegrationActivity;
  strategicOutcomes: string[];
  risks: string[];
  knowledgeTopics: string[];
  decisionsInFlight: string[];
  historicalMemory: string[];
  cadence: EnterpriseCadence;
  executiveBehaviours: string[];
};

export type BusinessEventDefinition = {
  id: string;
  label: string;
  description: string;
  mode: OperatingMode;
  scenarioKind: ScenarioKind;
  scenarioId: string;
  severity: "critical" | "high" | "moderate";
};

export type OperatingLoopStageId =
  | "command_centre"
  | "strategy"
  | "decision"
  | "knowledge"
  | "council"
  | "outcome"
  | "learning"
  | "executive_brief";

export type StageValidation = {
  stage: OperatingLoopStageId;
  label: string;
  pass: boolean;
  artefactCount: number;
  notes: string[];
};

export type OperatingLoopValidation = {
  pass: boolean;
  stages: StageValidation[];
  flow: OperatingLoopStageId[];
};

export type CouncilMemberValidation = {
  roleId: string;
  shortTitle: string;
  observationQuality: number;
  timing: number;
  reasoning: number;
  collaboration: number;
  escalation: number;
  decisionQuality: number;
  learning: number;
  hasOpinion: boolean;
  hasObservation: boolean;
  notes: string[];
};

export type CouncilValidation = {
  pass: boolean;
  consensusScore: number;
  collaborationScore: number;
  members: CouncilMemberValidation[];
  unexpectedBehaviours: string[];
};

export type DimensionScore = {
  id: EnterpriseScoreDimensionId;
  label: string;
  score: number;
  reasoning: string;
};

export type EnterpriseScorecard = {
  overall: number;
  dimensions: DimensionScore[];
  pass: boolean;
};

export type SimulationFinding = {
  severity: "strength" | "weakness" | "missed_opportunity" | "poor_recommendation" | "unexpected" | "product_improvement";
  title: string;
  detail: string;
};

export type EnterpriseSimulationReport = {
  id: string;
  asOf: string;
  organisationId: string;
  organisationName: string;
  scenarioId: string;
  scenarioName: string;
  mode: OperatingMode;
  summary: string;
  scorecard: EnterpriseScorecard;
  strengths: SimulationFinding[];
  weaknesses: SimulationFinding[];
  missedOpportunities: SimulationFinding[];
  poorRecommendations: SimulationFinding[];
  unexpectedBehaviour: SimulationFinding[];
  productImprovements: SimulationFinding[];
  findings: SimulationFinding[];
};

export type EnterpriseSimulationResult = {
  organisationId: string;
  organisationName: string;
  scenarioId: string;
  scenarioName: string;
  mode: OperatingMode;
  asOf: string;
  enterprise: EnterpriseModel;
  event: BusinessEventDefinition;
  lab: LabRunResult;
  operatingLoop: OperatingLoopValidation;
  council: CouncilValidation;
  scorecard: EnterpriseScorecard;
  report: EnterpriseSimulationReport;
};

export type EnterpriseSuiteResult = {
  asOf: string;
  runs: EnterpriseSimulationResult[];
  modes: OperatingMode[];
  averageScore: number;
  passRate: number;
  reportSummary: string;
  aggregatedFindings: SimulationFinding[];
};
