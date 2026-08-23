/**
 * Continuous Intelligence & Adaptive Learning Platform — types.
 * Presentation/prioritisation only. Core intelligence unchanged.
 */

import type { IntelligenceProfileId } from "@/profiles";

export type DetailLevel = "concise" | "balanced" | "deep";
export type CommunicationStyle = "direct" | "narrative" | "analytical";

export type RecommendationDisposition =
  | "accepted"
  | "rejected"
  | "deferred"
  | "ignored"
  | "corrected"
  | "outcome_confirmed"
  | "roi_confirmed";

export type AdaptiveExecutiveProfile = {
  id: string;
  tenantId: string;
  executiveId: string;
  profileId: IntelligenceProfileId;
  decisionPreferences: string[];
  workingHours: { startHour: number; endHour: number; timezone: string };
  briefingBehaviour: {
    opensPerWeek: number;
    avgMinutes: number;
    preferredStartSection: string;
  };
  recommendationAcceptanceRate: number;
  recommendationDismissalRate: number;
  reviewCompletionRate: number;
  preferredDetailLevel: DetailLevel;
  preferredCommunicationStyle: CommunicationStyle;
  preferredConfidenceThreshold: number;
  strategicPriorities: string[];
  businessFocus: string[];
  learningConfidence: number;
  enabled: boolean;
  explanations: string[];
  createdAt: string;
  updatedAt: string;
};

export type BehaviourEventKind =
  | "brief_open"
  | "recommendation_view"
  | "recommendation_accept"
  | "recommendation_reject"
  | "recommendation_defer"
  | "recommendation_ignore"
  | "review_complete"
  | "explanation_expand"
  | "value_confirm";

export type AdaptiveBehaviourEvent = {
  id: string;
  tenantId: string;
  executiveId: string;
  kind: BehaviourEventKind;
  recommendationId: string | null;
  weight: number;
  at: string;
  meta?: Record<string, string | number | boolean>;
};

export type PreferenceRecord = {
  key: string;
  value: string | number | boolean;
  explanation: string;
  confidence: number;
  updatedAt: string;
};

export type RecommendationLearningRecord = {
  recommendationId: string;
  tenantId: string;
  dispositions: Partial<Record<RecommendationDisposition, number>>;
  priorityBoost: number;
  confidenceAdjust: number;
  evidenceEmphasis: "low" | "medium" | "high";
  presentationHint: string;
  lastDisposition: RecommendationDisposition | null;
  updatedAt: string;
  explanation: string;
};

export type PersonalisationPlan = {
  tenantId: string;
  executiveId: string;
  briefSectionOrder: string[];
  recommendationOrdering: "value_first" | "confidence_first" | "urgency_first" | "learned";
  insightPriority: "strategic" | "operational" | "commercial" | "balanced";
  explanationDepth: DetailLevel;
  evidencePresentation: "compact" | "expanded";
  notificationTiming: "morning" | "midday" | "as_needed";
  reviewCadence: "daily" | "few_times_week" | "weekly";
  summaryStyle: CommunicationStyle;
  explanations: string[];
};

export type ConfidenceLearningPoint = {
  at: string;
  score: number;
  reason: string;
};

export type ValueLearningSnapshot = {
  tenantId: string;
  asOf: string;
  estimatedValueAccuracy: number;
  confirmedRoiCount: number;
  feedbackCount: number;
  confidenceTrend: ConfidenceLearningPoint[];
  explanation: string;
};

export type BenchmarkMetricId =
  | "recommendation_acceptance"
  | "executive_engagement"
  | "executive_value_score"
  | "strategic_progress"
  | "time_to_first_value"
  | "adoption";

export type BenchmarkPercentile = {
  metricId: BenchmarkMetricId;
  label: string;
  percentile: number;
  band: "bottom_quartile" | "below_median" | "above_median" | "top_quartile";
  explanation: string;
};

export type ImprovementOpportunity = {
  id: string;
  kind:
    | "rarely_used_feature"
    | "consistently_ignored_recommendation"
    | "high_value_pattern"
    | "executive_habit"
    | "learning_opportunity"
    | "product_improvement";
  title: string;
  detail: string;
  confidence: number;
  feedToProductIntelligence: boolean;
};

export type LearningHistoryEntry = {
  id: string;
  at: string;
  summary: string;
  category: "preference" | "recommendation" | "value" | "personalisation" | "governance";
};

export type AdaptiveDashboard = {
  asOf: string;
  learningHealth: number;
  adaptiveConfidence: number;
  personalisationActive: number;
  benchmarkParticipants: number;
  profiles: AdaptiveExecutiveProfile[];
  recommendationEvolution: RecommendationLearningRecord[];
  improvements: ImprovementOpportunity[];
  benchmarks: BenchmarkPercentile[];
  valueLearning: ValueLearningSnapshot[];
};
