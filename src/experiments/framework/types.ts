/**
 * Pilot Intelligence & Experimentation Platform — types.
 * Braltiq-internal only. Anonymised aggregate telemetry — never business payloads.
 */

import type { IntelligenceProfileId } from "@/profiles";

export type ExperimentStatus =
  | "draft"
  | "running"
  | "paused"
  | "completed"
  | "cancelled";

export type ExperimentResult =
  | "validated"
  | "rejected"
  | "inconclusive"
  | "pending";

export type ExplainedMetric = {
  id: string;
  label: string;
  value: number;
  unit: "percent" | "count" | "minutes" | "score" | "currency_proxy";
  explanation: string;
  trend?: "up" | "down" | "flat";
};

/** Per Design Partner — anonymised scores/counts only. */
export type PilotIntelligenceSnapshot = {
  tenantId: string;
  partnerLabel: string;
  profileId: IntelligenceProfileId;
  asOf: string;
  metrics: {
    executiveAdoption: ExplainedMetric;
    executiveEngagement: ExplainedMetric;
    executiveConfidence: ExplainedMetric;
    questionsAnswered: ExplainedMetric;
    scenarioSuccess: ExplainedMetric;
    recommendationAcceptance: ExplainedMetric;
    outcomeConfirmation: ExplainedMetric;
    strategicOutcomeProgress: ExplainedMetric;
    timeSaved: ExplainedMetric;
    businessValue: ExplainedMetric;
    pilotHealth: ExplainedMetric;
    successProbability: ExplainedMetric;
  };
};

export type HypothesisRecord = {
  id: string;
  statement: string;
  objective: string;
  targetProfileId: IntelligenceProfileId | "all";
  expectedBehaviourChange: string;
  successMetrics: string[];
  createdAt: string;
  createdBy: string;
};

export type ExperimentRecord = {
  id: string;
  hypothesisId: string;
  hypothesis: string;
  objective: string;
  targetProfileId: IntelligenceProfileId | "all";
  targetPartnerTenantIds: string[];
  expectedBehaviourChange: string;
  successMetrics: string[];
  startDate: string;
  endDate: string | null;
  status: ExperimentStatus;
  result: ExperimentResult;
  learning: string | null;
  recommendedAction: string | null;
  linkedFeatureFlags: string[];
  createdAt: string;
  updatedAt: string;
};

export type FeatureAdoptionMetricId =
  | "executive_brief_opens"
  | "strategy_page_usage"
  | "memory_usage"
  | "scenario_usage"
  | "trust_panel_usage"
  | "recommendation_interactions"
  | "review_completion"
  | "time_spent_minutes"
  | "repeat_usage";

export type FeatureAdoptionSeries = {
  metricId: FeatureAdoptionMetricId;
  label: string;
  explanation: string;
  points: Array<{ at: string; value: number }>;
  total: number;
  trend: "up" | "down" | "flat";
};

export type FeatureAdoptionSnapshot = {
  tenantId: string;
  profileId: IntelligenceProfileId;
  asOf: string;
  series: FeatureAdoptionSeries[];
};

export type BehaviourEventKind =
  | "brief_open"
  | "strategy_view"
  | "memory_open"
  | "scenario_open"
  | "trust_panel_open"
  | "recommendation_view"
  | "recommendation_accept"
  | "recommendation_ignore"
  | "review_complete"
  | "session_minutes";

/** Anonymised behaviour event — no business content. */
export type BehaviourEvent = {
  id: string;
  tenantId: string;
  profileId: IntelligenceProfileId;
  kind: BehaviourEventKind;
  /** Opaque feature key — never recommendation titles or customer names */
  featureKey: string;
  value: number;
  at: string;
  experimentId: string | null;
};

export type InterviewRecord = {
  id: string;
  tenantId: string;
  executiveRole: string;
  /** Anonymised executive label — never personal email/name from customer systems */
  executiveLabel: string;
  questionsAsked: string[];
  positiveFeedback: string[];
  negativeFeedback: string[];
  featureRequests: string[];
  painPoints: string[];
  suggestedImprovements: string[];
  overallSatisfaction: number;
  experimentIds: string[];
  recordedAt: string;
  recordedBy: string;
};

export type ProductFeedbackRecord = {
  id: string;
  tenantId: string;
  profileId: IntelligenceProfileId;
  source: "interview" | "in_product" | "review" | "support";
  theme: string;
  sentiment: "positive" | "negative" | "neutral";
  experimentId: string | null;
  at: string;
};

export type ProductInsightPriority = "p0" | "p1" | "p2" | "p3";

export type ProductInsightKind =
  | "low_adoption"
  | "confusing_workflow"
  | "highly_valued_recommendation"
  | "frequently_ignored_recommendation"
  | "executive_friction"
  | "feature_opportunity";

export type ProductInsight = {
  id: string;
  kind: ProductInsightKind;
  title: string;
  detail: string;
  priority: ProductInsightPriority;
  confidence: number;
  evidence: string[];
  profileId: IntelligenceProfileId | "all";
  experimentIds: string[];
  createdAt: string;
};

export type RoadmapRecommendation = {
  id: string;
  title: string;
  rationale: string;
  confidence: number;
  sources: Array<
    "experiment" | "feedback" | "usage" | "business_outcome" | "pilot_success"
  >;
  targetProfileId: IntelligenceProfileId | "all";
  relatedInsightIds: string[];
  relatedExperimentIds: string[];
  createdAt: string;
};

export type CohortId =
  | "operations_executive"
  | "commercial_executive"
  | "early_stage"
  | "active_pilot"
  | "review_stage";

export type CohortAnalytics = {
  cohortId: CohortId;
  label: string;
  partnerCount: number;
  activationPct: number;
  retentionPct: number;
  engagementPct: number;
  recommendationEffectivenessPct: number;
  explanation: string;
};

export type ProfileAnalytics = {
  profileId: IntelligenceProfileId;
  partnerCount: number;
  avgAdoption: number;
  avgEngagement: number;
  avgAcceptance: number;
  avgPilotHealth: number;
  avgSuccessProbability: number;
  topFriction: string[];
  explanation: string;
};

export type ExperimentationDashboard = {
  asOf: string;
  portfolio: {
    partnerCount: number;
    runningExperiments: number;
    completedExperiments: number;
    validatedHypotheses: number;
    avgSuccessProbability: number;
    avgAdoption: number;
    avgEngagement: number;
  };
  pilotIntelligence: PilotIntelligenceSnapshot[];
  experiments: ExperimentRecord[];
  insights: ProductInsight[];
  roadmap: RoadmapRecommendation[];
  cohorts: CohortAnalytics[];
  profiles: ProfileAnalytics[];
  featureAdoption: FeatureAdoptionSnapshot[];
  interviews: InterviewRecord[];
};
