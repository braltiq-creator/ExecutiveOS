/**
 * Executive Validation Suite — trust & quality types.
 * Every score explains itself. Every gap is actionable.
 */

export type ExplainedScore = {
  id: string;
  label: string;
  score: number;
  explanation: string;
  evidence: string[];
  gaps: string[];
  trend?: "up" | "flat" | "down";
};

export type MaturityComponentId =
  | "organisation_understanding"
  | "executive_understanding"
  | "operational_understanding"
  | "customer_understanding"
  | "financial_understanding"
  | "strategic_understanding"
  | "relationship_understanding"
  | "knowledge_graph_completeness"
  | "evidence_quality"
  | "recommendation_confidence"
  | "overall";

export type ExecutiveMaturityModel = {
  tenantId: string;
  asOf: string;
  components: Record<MaturityComponentId, ExplainedScore>;
  overall: ExplainedScore;
};

export type CoverageDimension = {
  id: string;
  label: string;
  discovered: number;
  estimated: number;
  coveragePct: number;
  explanation: string;
};

export type DiscoveryCoverage = {
  tenantId: string;
  asOf: string;
  dimensions: CoverageDimension[];
  overallCoveragePct: number;
  connectorCoverage: Array<{
    id: string;
    label: string;
    connected: boolean;
    coveragePct: number;
  }>;
};

export type KnowledgeGraphHealth = {
  tenantId: string;
  asOf: string;
  entities: number;
  relationships: number;
  growth: number;
  confidence: number;
  missingRelationships: number;
  duplicateEntities: number;
  conflictingEvidence: number;
  evidenceFreshnessHours: number;
  explanation: string;
  gaps: string[];
};

export type ExecutiveProfileHealth = {
  tenantId: string;
  asOf: string;
  preferencesKnown: number;
  decisionStyle: string;
  communicationStyle: string;
  riskProfile: string;
  briefingConfidence: number;
  learningProgress: number;
  confidenceTrend: "up" | "flat" | "down";
  explanation: string;
  gaps: string[];
};

export type ProviderHealthCard = {
  providerId: string;
  label: string;
  connected: boolean;
  coveragePct: number;
  syncFreshnessHours: number | null;
  contextGenerated: boolean;
  businessEventsGenerated: number;
  explanation: string;
  status: "healthy" | "degraded" | "disconnected" | "unknown";
};

export type ContextProviderHealth = {
  tenantId: string;
  asOf: string;
  providers: ProviderHealthCard[];
};

export type RecommendationOutcome =
  | "accepted"
  | "dismissed"
  | "ignored"
  | "later_validated"
  | "incorrect";

export type RecommendationQuality = {
  tenantId: string;
  asOf: string;
  generated: number;
  accepted: number;
  dismissed: number;
  ignored: number;
  laterValidated: number;
  incorrect: number;
  usefulnessPct: number;
  confidenceDistribution: {
    high: number;
    medium: number;
    low: number;
  };
  businessImpactScore: number;
  explanation: string;
};

export type FeedbackKind =
  | "useful"
  | "not_useful"
  | "incorrect"
  | "missing_context"
  | "already_knew"
  | "needs_investigation";

export type ExecutiveFeedback = {
  id: string;
  tenantId: string;
  at: string;
  kind: FeedbackKind;
  subject: string;
  note?: string;
  relatedEntityId?: string;
};

export type TenantHealthSnapshot = {
  tenantId: string;
  asOf: string;
  tenantHealth: ExplainedScore;
  connectorHealth: ExplainedScore;
  knowledgeGraphHealth: ExplainedScore;
  learningProgress: ExplainedScore;
  executiveConfidence: ExplainedScore;
  strategicCoverage: ExplainedScore;
  operationalCoverage: ExplainedScore;
  overallReadiness: ExplainedScore;
};

export type ValidationHistoryPoint = {
  at: string;
  overallScore: number;
  organisationCoverage: number;
  knowledgeGraphEntities: number;
  recommendationUsefulness: number;
  confidence: number;
};

export type ValidationHistory = {
  tenantId: string;
  daily: ValidationHistoryPoint[];
  weekly: ValidationHistoryPoint[];
  monthly: ValidationHistoryPoint[];
};

export type OutstandingValidationRequest = {
  id: string;
  tenantId: string;
  label: string;
  reason: string;
  priority: "high" | "medium" | "low";
  confidence: number;
};

export type DesignPartnerDashboard = {
  tenantId: string;
  asOf: string;
  executiveIntelligenceScore: ExplainedScore;
  platformMaturity: ExplainedScore;
  connectorHealth: ExplainedScore;
  organisationCoverage: ExplainedScore;
  learningTrend: "up" | "flat" | "down";
  recommendationQuality: RecommendationQuality;
  dailyImprovements: string[];
  outstandingValidationRequests: OutstandingValidationRequest[];
  maturity: ExecutiveMaturityModel;
  coverage: DiscoveryCoverage;
  graphHealth: KnowledgeGraphHealth;
  profileHealth: ExecutiveProfileHealth;
  providers: ContextProviderHealth;
  tenantHealth: TenantHealthSnapshot;
  history: ValidationHistory;
  successMetrics: ValidationSuccessMetrics;
  /** Intelligence Profile success scenarios */
  intelligenceProfileValidation?: import("@/profiles").ProfileValidationReport;
};

export type ValidationSuccessMetrics = {
  tenantId: string;
  timeToFirstBriefSeconds: number | null;
  timeTo80PctUnderstandingDays: number | null;
  executiveEngagementPct: number;
  recommendationUsefulnessPct: number;
  dailyActiveExecutives: number;
  connectorUptimePct: number;
  learningVelocity: number;
  explanation: string;
};

export type BenchmarkComparison = {
  tenantId: string;
  peerPercentile: number;
  overallDelta: number;
  explanation: string;
};
