/**
 * Design Partner Operations Centre — types for Braltiq internal command centre.
 * Never includes tenant business content (jobs, opportunities, emails, etc.).
 */

import type { IntelligenceProfileId } from "@/profiles";
import type { PilotLifecycleStage } from "@/pilot/types";

export type TrafficLight = "green" | "amber" | "red";

export type ExplainedOpsScore = {
  id: string;
  label: string;
  score: number;
  trafficLight: TrafficLight;
  explanation: string;
  evidence: string[];
  gaps: string[];
};

/** Aggregated telemetry only — no business payloads across tenants. */
export type TenantOperationalTelemetry = {
  tenantId: string;
  asOf: string;
  readinessScore: number;
  executiveIntelligenceScore: number;
  engagementPct: number;
  dailyActiveExecutives: number;
  weeklyActiveExecutives: number;
  averageSessionMinutes: number;
  morningBriefOpens: number;
  recommendationsViewed: number;
  recommendationsAccepted: number;
  feedbackSubmitted: number;
  validationCompleted: number;
  validationOutstanding: number;
  validationProgressPct: number;
  discoveryCoveragePct: number;
  learningProgress: number;
  knowledgeGraphGrowth: number;
  knowledgeGraphConfidence: number;
  recommendationAccuracy: number;
  providerStatuses: Array<{
    providerId: string;
    label: string;
    connected: boolean;
    status: TrafficLight;
  }>;
  providersHealthy: number;
  providersRequired: number;
  connectorUptimePct: number;
  timeToFirstBriefSeconds: number | null;
  lastExecutiveLoginAt: string | null;
  learningTrend: "up" | "flat" | "down";
};

export type DesignPartnerOpsRecord = {
  id: string;
  tenantId: string;
  companyName: string;
  intelligenceProfileId: IntelligenceProfileId;
  industry: string;
  customerSuccessManager: string;
  implementationOwner: string;
  technicalContact: string;
  executiveSponsor: string;
  nextReviewDate: string | null;
  successPlan: string;
  outstandingRisks: string[];
  lastExecutiveLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type OpsPartnerDashboardRow = {
  tenantId: string;
  companyName: string;
  intelligenceProfileId: IntelligenceProfileId;
  industry: string;
  pilotStage: PilotLifecycleStage;
  readinessScore: number;
  executiveIntelligenceScore: number;
  lastExecutiveLoginAt: string | null;
  activeExecutives: number;
  providerStatus: TrafficLight;
  knowledgeGraphGrowth: number;
  recommendationAccuracy: number;
  validationProgress: number;
  overallHealth: TrafficLight;
  overallHealthScore: number;
  trafficLights: {
    readiness: TrafficLight;
    intelligence: TrafficLight;
    engagement: TrafficLight;
    providers: TrafficLight;
    graph: TrafficLight;
    validation: TrafficLight;
    overall: TrafficLight;
  };
};

export type PilotOpsHealth = {
  tenantId: string;
  asOf: string;
  overall: ExplainedOpsScore;
  adoption: ExplainedOpsScore;
  engagement: ExplainedOpsScore;
  learningProgress: ExplainedOpsScore;
  recommendationAcceptance: ExplainedOpsScore;
  providerHealth: ExplainedOpsScore;
  knowledgeGraphMaturity: ExplainedOpsScore;
  supportLoad: ExplainedOpsScore;
  executiveSatisfaction: ExplainedOpsScore;
  successProbability: ExplainedOpsScore;
  components: ExplainedOpsScore[];
};

export type EngagementSnapshot = {
  tenantId: string;
  asOf: string;
  dailyActiveExecutives: number;
  weeklyActiveExecutives: number;
  averageSessionMinutes: number;
  morningBriefOpens: number;
  recommendationsViewed: number;
  recommendationsAccepted: number;
  feedbackSubmitted: number;
  validationRequestsCompleted: number;
  trend: "up" | "flat" | "down";
  history: Array<{ at: string; dau: number; engagementPct: number }>;
  explanation: string;
};

export type AdoptionSnapshot = {
  tenantId: string;
  asOf: string;
  score: number;
  trafficLight: TrafficLight;
  modulesInUse: number;
  providersConnectedPct: number;
  briefAdoptionPct: number;
  validationAdoptionPct: number;
  explanation: string;
  evidence: string[];
};

export type CustomerSuccessPlan = {
  tenantId: string;
  customerSuccessManager: string;
  implementationOwner: string;
  technicalContact: string;
  executiveSponsor: string;
  nextReviewDate: string | null;
  successPlan: string;
  outstandingRisks: string[];
  actionsRequired: string[];
  meetingNotes: OpsNote[];
  followUpTasks: OpsTask[];
};

export type SupportSeverity = "critical" | "high" | "moderate" | "low";
export type SupportStatus =
  | "open"
  | "in_progress"
  | "waiting"
  | "resolved"
  | "closed";

export type SupportIssue = {
  id: string;
  tenantId: string;
  title: string;
  severity: SupportSeverity;
  status: SupportStatus;
  owner: string;
  resolution: string | null;
  rootCause: string | null;
  createdAt: string;
  resolvedAt: string | null;
  timeToResolutionHours: number | null;
  category: string;
};

export type SupportPattern = {
  id: string;
  pattern: string;
  category: string;
  occurrences: number;
  tenantIds: string[];
  severity: SupportSeverity;
  recommendation: string;
};

export type OpsAlertKind =
  | "engagement_drop"
  | "provider_disconnected"
  | "discovery_confidence_fall"
  | "recommendation_accuracy_drop"
  | "knowledge_graph_deterioration"
  | "support_ticket_spike"
  | "pilot_health_change";

export type OpsAlert = {
  id: string;
  tenantId: string;
  kind: OpsAlertKind;
  severity: SupportSeverity;
  title: string;
  detail: string;
  createdAt: string;
  acknowledgedAt: string | null;
  acknowledgedBy: string | null;
  status: "open" | "acknowledged" | "resolved";
};

export type ValueRealisation = {
  tenantId: string;
  asOf: string;
  timeToFirstBriefMinutes: number | null;
  timeToFirstInsightMinutes: number | null;
  timeToFirstAcceptedRecommendationMinutes: number | null;
  recommendationAcceptanceRate: number;
  executiveSatisfaction: number;
  businessOutcomesReported: number;
  executiveTimeSavedHours: number;
  pilotRoiEstimate: number;
  explanation: string;
  evidence: string[];
};

export type ReviewMilestone = "day_30" | "day_60" | "day_90";

export type DesignPartnerReview = {
  id: string;
  tenantId: string;
  milestone: ReviewMilestone;
  conductedAt: string;
  conductedBy: string;
  achievements: string[];
  challenges: string[];
  featureRequests: string[];
  executiveFeedback: string;
  businessOutcomes: string[];
  nextActions: string[];
};

export type OpsNote = {
  id: string;
  tenantId: string;
  author: string;
  body: string;
  createdAt: string;
  kind: "meeting" | "general" | "risk" | "escalation";
};

export type OpsTask = {
  id: string;
  tenantId: string;
  title: string;
  owner: string;
  dueAt: string | null;
  status: "open" | "done" | "cancelled";
  createdAt: string;
  completedAt: string | null;
};

export type RoadmapItem = {
  id: string;
  tenantId: string | null; // null = portfolio-level
  title: string;
  status: "planned" | "in_progress" | "shipped" | "blocked";
  priority: "high" | "medium" | "low";
  requestedBy: string;
  notes: string;
  createdAt: string;
};

export type PortfolioAnalytics = {
  asOf: string;
  partnerCount: number;
  pilotCompletionRate: number;
  averageReadiness: number;
  averageEngagement: number;
  averageIntelligenceScore: number;
  providerReliability: number;
  recommendationPerformance: number;
  knowledgeGraphGrowth: number;
  customerHealthTrends: Array<{
    tenantId: string;
    companyName: string;
    healthScore: number;
    trafficLight: TrafficLight;
    trend: "up" | "flat" | "down";
  }>;
  strugglingPartners: Array<{
    tenantId: string;
    companyName: string;
    reason: string;
    healthScore: number;
  }>;
  explanation: string;
};

export type OperationsCentreDashboard = {
  asOf: string;
  partners: OpsPartnerDashboardRow[];
  analytics: PortfolioAnalytics;
  openAlerts: OpsAlert[];
  supportPatterns: SupportPattern[];
  healthByTenant: Record<string, PilotOpsHealth>;
  /** Phase 34 — platform observability (Braltiq-only). */
  excellence: import("@/operations/observability/types").OperationalExcellenceDashboard;
};
