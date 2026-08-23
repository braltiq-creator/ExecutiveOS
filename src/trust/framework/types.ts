/**
 * Executive Trust & Explainability Framework — types.
 * Sits above existing intelligence. Core engines unchanged.
 */

export type EvidenceProvider =
  | "microsoft365"
  | "simpro"
  | "salesforce"
  | "knowledge_graph"
  | "organisational_memory"
  | "scenario_pack"
  | "strategy"
  | "council"
  | "outcome_history"
  | "executive_input"
  | "system";

export type EvidenceSource = {
  id: string;
  label: string;
  provider: EvidenceProvider;
  timestamp: string;
  confidence: number;
  businessEvent?: string;
  knowledgeGraphEntityIds?: string[];
  memoryEpisodeIds?: string[];
  outcomeHistoryIds?: string[];
  detail?: string;
};

export type ReasoningStepId =
  | "question"
  | "evidence"
  | "business_events"
  | "scenario"
  | "strategic_outcome"
  | "council"
  | "recommendation"
  | "expected_outcome";

export type ReasoningStep = {
  id: ReasoningStepId;
  label: string;
  summary: string;
  detail?: string;
  evidenceIds?: string[];
};

export type ConfidenceBand = "high" | "moderate" | "low";

export type ConfidenceExplanation = {
  score: number;
  band: ConfidenceBand;
  headline: string;
  reasonsFor: string[];
  reasonsAgainst: string[];
};

export type AlternativeInterpretation = {
  id: string;
  interpretation: string;
  evidenceThatWouldChangeConclusion: string[];
  informationThatWouldIncreaseConfidence: string[];
};

export type Assumption = {
  id: string;
  statement: string;
  criticality: "material" | "supporting";
};

/** Reusable Explanation — every recommendation can explain itself. */
export type Explanation = {
  id: string;
  tenantId: string;
  recommendationId: string;
  recommendation: string;
  executiveQuestion: string;
  strategicOutcome: string | null;
  strategicOutcomeId: string | null;
  scenario: string | null;
  scenarioId: string | null;
  evidenceSources: EvidenceSource[];
  reasoningPath: ReasoningStep[];
  confidence: ConfidenceExplanation;
  assumptions: Assumption[];
  relatedMemoryEpisodes: string[];
  alternativeInterpretations: AlternativeInterpretation[];
  recommendedAction: string;
  expectedOutcome: string;
  whyItMatters: string;
  whyWeBelieveThis: string;
  expectedBusinessImpact: string;
  createdAt: string;
  updatedAt: string;
};

/** Compact presentation fields for Today SnapshotAction. */
export type TrustActionReference = {
  explanationId: string;
  whyWeBelieveThis: string;
  confidenceExplanation: string;
  confidenceReasons: string[];
  confidenceBand: ConfidenceBand;
  evidenceSummary: string[];
  memorySummary: string[];
  alternativeSummary?: string;
  decisionPathLabels: string[];
};

export type ExecutiveReviewVerdict =
  | "agree"
  | "disagree"
  | "needs_more_evidence"
  | "incorrect_assumption"
  | "insufficient_context";

export type ExecutiveReviewRecord = {
  id: string;
  tenantId: string;
  explanationId: string;
  recommendationId: string;
  verdict: ExecutiveReviewVerdict;
  note: string | null;
  recordedBy: string;
  recordedAt: string;
};

export type ProvenanceRecord = {
  id: string;
  tenantId: string;
  explanationId: string;
  recommendationId: string;
  stage: ReasoningStepId | "review" | "audit";
  summary: string;
  actor: string;
  at: string;
  metadata?: Record<string, string | number | boolean | null>;
};

export type TrustAuditEntry = {
  id: string;
  tenantId: string;
  explanationId: string;
  recommendationId: string;
  kind:
    | "recommendation"
    | "evidence"
    | "reasoning"
    | "confidence"
    | "decision"
    | "review";
  summary: string;
  confidenceScore: number | null;
  at: string;
  payload?: Record<string, unknown>;
};

export type Citation = {
  id: string;
  label: string;
  provider: EvidenceProvider;
  timestamp: string;
  href?: string;
};

export type TrustGovernancePolicy = {
  requireEvidence: boolean;
  minEvidenceSources: number;
  minConfidenceForHighBand: number;
  allowRecommendationWithoutMemory: boolean;
  auditRetentionDays: number;
};

export type TrustDashboard = {
  asOf: string;
  tenantId: string;
  explanationCount: number;
  averageConfidence: number;
  highConfidenceCount: number;
  lowConfidenceCount: number;
  reviewCount: number;
  agreeRate: number;
  auditEntryCount: number;
  recentExplanations: Explanation[];
  recentReviews: ExecutiveReviewRecord[];
  recentAudit: TrustAuditEntry[];
  governance: TrustGovernancePolicy;
};
