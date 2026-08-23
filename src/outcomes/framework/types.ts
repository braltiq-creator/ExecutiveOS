/**
 * Executive Outcomes Engine — types.
 * Measures whether ExecutiveOS creates measurable business value.
 * Distinct from src/lib/outcomes (strategic outcome portfolio).
 */

import type { IntelligenceProfileId } from "@/profiles";

export type ExecutiveOutcomeStatus =
  | "open"
  | "observed"
  | "confirmed"
  | "rejected";

export type RecommendationLifecycleStatus =
  | "generated"
  | "viewed"
  | "accepted"
  | "deferred"
  | "dismissed"
  | "implemented"
  | "observed"
  | "confirmed"
  | "archived";

export type BuiltInBusinessOutcomeKind =
  | "revenue_risk_reduced"
  | "forecast_accuracy_improved"
  | "customer_retention_improved"
  | "operational_bottleneck_resolved"
  | "project_delivered_on_time"
  | "safety_risk_mitigated"
  | "cash_collection_improved"
  | "executive_time_saved"
  | "strategic_opportunity_realised"
  | "custom";

export type ExecutiveActionKind =
  | "contacted_strategic_customer"
  | "reassigned_operational_resources"
  | "escalated_delivery_risk"
  | "approved_investment"
  | "scheduled_leadership_meeting"
  | "changed_forecast"
  | "other";

export type ValueRange = {
  low: number;
  mid: number;
  high: number;
  unit: "usd" | "hours" | "percent" | "score";
  confidence: number;
  explanation: string;
};

export type ExecutiveOutcomeRecord = {
  id: string;
  tenantId: string;
  name: string;
  profileId: IntelligenceProfileId;
  scenarioId: string | null;
  businessQuestion: string;
  recommendationId: string | null;
  recommendation: string;
  executiveActionId: string | null;
  observedOutcome: string;
  evidence: string[];
  confidence: number;
  estimatedBusinessValue: ValueRange;
  status: ExecutiveOutcomeStatus;
  businessOutcomeKind: BuiltInBusinessOutcomeKind;
  customOutcomeLabel: string | null;
  createdAt: string;
  updatedAt: string;
  confirmedAt: string | null;
  timestamps: Partial<Record<ExecutiveOutcomeStatus, string>>;
};

export type RecommendationTrack = {
  id: string;
  tenantId: string;
  profileId: IntelligenceProfileId;
  scenarioId: string | null;
  title: string;
  businessQuestion: string;
  status: RecommendationLifecycleStatus;
  evidence: string[];
  createdAt: string;
  updatedAt: string;
  timestamps: Partial<Record<RecommendationLifecycleStatus, string>>;
  notes: string[];
};

export type ExecutiveActionRecord = {
  id: string;
  tenantId: string;
  recommendationId: string | null;
  outcomeId: string | null;
  kind: ExecutiveActionKind;
  label: string;
  detail: string;
  capturedBy: string;
  capturedAt: string;
  source: "manual" | "system";
};

export type BusinessOutcomeTypeDef = {
  id: string;
  tenantId: string | null; // null = built-in / global catalog
  kind: BuiltInBusinessOutcomeKind;
  label: string;
  description: string;
  defaultUnit: ValueRange["unit"];
};

export type DecisionImpactSnapshot = {
  tenantId: string;
  asOf: string;
  recommendationsInfluencingDecisions: number;
  actionsTaken: number;
  outcomesConfirmed: number;
  influenceScore: number;
  explanation: string;
  evidence: string[];
};

export type ValueRealisationSummary = {
  tenantId: string;
  asOf: string;
  executiveTimeSavedHours: ValueRange;
  businessValueCreated: ValueRange;
  recommendationsAdopted: number;
  recommendationsGenerated: number;
  scenarioSuccessRate: ValueRange;
  decisionConfidenceImprovement: ValueRange;
  executiveEngagementImprovement: ValueRange;
  explanation: string;
};

export type RoiEstimate = {
  tenantId: string;
  asOf: string;
  estimatedRoi: ValueRange;
  paybackWeeks: ValueRange;
  explanation: string;
  assumptions: string[];
};

export type OutcomesConfidenceModel = {
  tenantId: string;
  asOf: string;
  overall: number;
  evidenceStrength: number;
  confirmationRate: number;
  recommendationLinkage: number;
  explanation: string;
};

export type PilotSuccessReportKind = "day_30" | "day_60" | "day_90";

export type PilotSuccessReport = {
  kind: PilotSuccessReportKind;
  tenantId: string;
  profileId: IntelligenceProfileId;
  asOf: string;
  title: string;
  questionsAnswered: string[];
  recommendationsAccepted: string[];
  actionsTaken: string[];
  businessOutcomesObserved: string[];
  lessonsLearned: string[];
  areasForImprovement: string[];
  executiveTestimonials: string[];
  supportingEvidence: string[];
  markdown: string;
};

export type OutcomesAnalytics = {
  tenantId: string;
  asOf: string;
  recommendationsByStatus: Record<RecommendationLifecycleStatus, number>;
  outcomesByStatus: Record<ExecutiveOutcomeStatus, number>;
  decisionInfluence: number;
  estimatedValueMid: number;
  estimatedValueConfidence: number;
  scenarioContribution: Array<{
    scenarioId: string;
    outcomes: number;
    confirmed: number;
  }>;
  profileContribution: Array<{
    profileId: IntelligenceProfileId;
    outcomes: number;
    confirmed: number;
  }>;
  learningTrend: "up" | "flat" | "down";
  explanation: string;
};

export type OutcomesDashboard = {
  asOf: string;
  tenantId: string;
  analytics: OutcomesAnalytics;
  decisionImpact: DecisionImpactSnapshot;
  value: ValueRealisationSummary;
  roi: RoiEstimate;
  confidence: OutcomesConfidenceModel;
  recentOutcomes: ExecutiveOutcomeRecord[];
  recentActions: ExecutiveActionRecord[];
  openRecommendations: RecommendationTrack[];
};

/** Anonymised portfolio telemetry — no customer business content. */
export type AnonymisedOutcomesTelemetry = {
  asOf: string;
  partnerCount: number;
  avgConfirmationRate: number;
  avgInfluenceScore: number;
  avgRoiMid: number;
  explanation: string;
};

export type LearningFeedbackWeights = {
  tenantId: string;
  asOf: string;
  scenarioConfidenceBoost: Record<string, number>;
  recommendationConfidenceBoost: number;
  profileWeightBoost: Partial<Record<IntelligenceProfileId, number>>;
  knowledgeGraphWeightBoost: number;
  validationBoost: number;
  explanation: string;
};
