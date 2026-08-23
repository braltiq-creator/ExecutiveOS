/**
 * Executive Scenario Pack framework — acceptance criteria for Design Partners.
 * Portable across tenants. Never compared as business data between tenants.
 */

import type { IntelligenceProfileId } from "@/profiles";

export type ScenarioReviewFrequency =
  | "daily"
  | "weekly"
  | "monthly"
  | "per_pilot_review";

export type ScenarioEvidenceSource =
  | "microsoft365"
  | "simpro"
  | "salesforce"
  | "knowledge_graph"
  | "executive_memory"
  | "council"
  | "discovery";

export type ExecutiveScenarioDefinition = {
  id: string;
  name: string;
  profileId: IntelligenceProfileId;
  businessQuestion: string;
  expectedInsight: string;
  evidenceSources: ScenarioEvidenceSource[];
  requiredProviders: Array<"microsoft365" | "simpro" | "salesforce">;
  successCriteria: string[];
  confidenceThreshold: number;
  businessOutcome: string;
  reviewFrequency: ScenarioReviewFrequency;
  expectedEvidence: string[];
  expectedRecommendation: string;
  expectedExecutiveAction: string;
};

export type ScenarioPack = {
  id: string;
  name: string;
  profileId: IntelligenceProfileId;
  requiredProviders: Array<"microsoft365" | "simpro" | "salesforce">;
  description: string;
  scenarios: ExecutiveScenarioDefinition[];
};

export type ScenarioAnswerStatus =
  | "answered"
  | "partial"
  | "unanswered"
  | "blocked";

export type ScenarioValidationResult = {
  scenarioId: string;
  tenantId: string;
  profileId: IntelligenceProfileId;
  asOf: string;
  status: ScenarioAnswerStatus;
  answered: boolean;
  confidence: number;
  evidenceQuality: number;
  recommendationQuality: number;
  executiveFeedback: number | null;
  businessOutcomeScore: number;
  timeToInsightMinutes: number | null;
  timeToActionMinutes: number | null;
  evidenceFound: string[];
  recommendation: string | null;
  explanation: string;
  passed: boolean;
};

export type ScenarioPackRun = {
  packId: string;
  tenantId: string;
  profileId: IntelligenceProfileId;
  asOf: string;
  results: ScenarioValidationResult[];
  completionPct: number;
  accuracyPct: number;
  averageConfidence: number;
  explanation: string;
};

export type ScenarioScorecard = {
  id: string;
  tenantId: string;
  profileId: IntelligenceProfileId;
  packName: string;
  asOf: string;
  scenarioCompletion: number;
  scenarioAccuracy: number;
  executiveConfidence: number;
  recommendationAcceptance: number;
  businessOutcomes: number;
  overallSuccess: number;
  weakScenarios: Array<{ scenarioId: string; name: string; reason: string }>;
  explanation: string;
};

export type ScenarioReportKind = "weekly" | "monthly" | "pilot_complete";

export type ScenarioExecutiveReport = {
  kind: ScenarioReportKind;
  tenantId: string;
  profileId: IntelligenceProfileId;
  asOf: string;
  title: string;
  questionsAnswered: string[];
  evidence: string[];
  recommendations: string[];
  outcomes: string[];
  learning: string[];
  areasForImprovement: string[];
  markdown: string;
};

export type ScenarioBenchmarkPoint = {
  at: string;
  completionPct: number;
  accuracyPct: number;
  averageConfidence: number;
  overallSuccess: number;
};

export type ScenarioBenchmark = {
  tenantId: string;
  profileId: IntelligenceProfileId;
  asOf: string;
  points: ScenarioBenchmarkPoint[];
  trend: "up" | "flat" | "down";
  phaseComparison: Array<{
    phase: string;
    completionPct: number;
    accuracyPct: number;
  }>;
  explanation: string;
};

export type ScenarioEvidenceRecord = {
  id: string;
  tenantId: string;
  scenarioId: string;
  label: string;
  source: ScenarioEvidenceSource;
  quality: number;
  recordedAt: string;
};

export type ScenarioOutcomeRecord = {
  id: string;
  tenantId: string;
  scenarioId: string;
  outcome: string;
  realised: boolean;
  recordedAt: string;
  notes: string;
};

/** Presentation metadata attached to Today recommendations. */
export type ScenarioActionReference = {
  scenarioId: string;
  scenarioName: string;
  businessQuestion: string;
  evidence: string[];
  confidence: number;
  expectedOutcome: string;
};
