/**
 * Executive Intelligence Engine — shared contracts.
 * Pure types. No React. No UI.
 */

/** Confidence 0–100 with explainable drivers. */
export type ConfidenceScore = {
  value: number;
  /** Never invent certainty — name what limits trust */
  ceiling: number;
  drivers: ConfidenceDriver[];
  reasoning: string;
};

export type ConfidenceDriverId =
  | "data_completeness"
  | "freshness"
  | "source_agreement"
  | "historical_reliability"
  | "prediction_certainty"
  | "ai_reasoning";

export type ConfidenceDriver = {
  id: ConfidenceDriverId;
  label: string;
  /** Contribution −20..+20 toward confidence */
  weight: number;
  evidence: string;
};

export type ReasoningNodeKind =
  | "signal"
  | "outcome"
  | "decision"
  | "meeting"
  | "risk"
  | "opportunity"
  | "action"
  | "system"
  | "judgement";

export type ReasoningNode = {
  id: string;
  kind: ReasoningNodeKind;
  label: string;
  detail: string;
  system?: string;
};

export type ReasoningEdge = {
  from: string;
  to: string;
  relation:
    | "supports"
    | "contradicts"
    | "causes"
    | "depends_on"
    | "informs"
    | "competes_with";
};

/** Explainability graph for any recommendation or score. */
export type ReasoningGraph = {
  question: string;
  whatChanged: string[];
  evidence: ReasoningNode[];
  systems: string[];
  edges: ReasoningEdge[];
  summary: string;
};

export type ContributingFactor = {
  id: string;
  label: string;
  /** Direction of influence on the parent judgement */
  influence: "raises" | "lowers" | "stabilises";
  weight: number;
  evidence: string;
  relatedIds?: string[];
};

export type BusinessState =
  | "healthy"
  | "stable"
  | "attention_required"
  | "critical";

export type PulseResult = {
  state: BusinessState;
  label: string;
  confidence: ConfidenceScore;
  reasoning: string;
  contributingFactors: ContributingFactor[];
  /** One-sentence CoS interpretation for Today */
  narrative: string;
  reasoningGraph: ReasoningGraph;
};

export type CapacityLevel = "available" | "constrained" | "overdrawn";
export type AttentionBudgetLevel = "focused" | "split" | "contested";
export type LeadershipLoadLevel = "light" | "moderate" | "heavy";

export type CapacityResult = {
  capacity: CapacityLevel;
  attentionBudget: AttentionBudgetLevel;
  leadershipLoad: LeadershipLoadLevel;
  /** 0–100 remaining attention units */
  attentionUnitsRemaining: number;
  meetingLoad: number;
  decisionLoad: number;
  outstandingApprovals: number;
  strategicInitiatives: number;
  contextSwitching: number;
  reasoning: string;
  contributingFactors: ContributingFactor[];
  confidence: ConfidenceScore;
};

export type Trajectory = "improving" | "stable" | "declining";
export type Momentum = "building" | "drifting" | "steady";

/** Strategic alignment to the active executive's intent. */
export type StrategicAlignmentLevel =
  | "high"
  | "medium"
  | "low"
  | "conflicts";

export type StrategicAlignment = {
  level: StrategicAlignmentLevel;
  label: string;
  intentScore: number;
  attentionPriority: number;
  matchedPriorities: string[];
  reasoning: string;
};

export type IntelligentOutcome = {
  id: string;
  name: string;
  shortName: string;
  status: "on_track" | "at_risk" | "off_track" | "watching";
  healthScore: number;
  trajectory: Trajectory;
  momentum: Momentum;
  momentumLabel: string;
  movement: number;
  movementLabel: string;
  confidence: ConfidenceScore;
  lastSignificantChange: string;
  supportingEvidence: ReasoningNode[];
  contributingSystems: string[];
  executiveRecommendation: string;
  healthHistory: number[];
  predictedTrend: Trajectory;
  predictedNarrative: string;
  reasoning: string;
  reasoningGraph: ReasoningGraph;
  strategicAlignment: StrategicAlignment;
};

export type DecisionPriority =
  | "immediate"
  | "today"
  | "this_week"
  | "watch"
  | "resolved";

export type IntelligentDecision = {
  id: string;
  question: string;
  priority: DecisionPriority;
  urgency: number;
  businessImpactScore: number;
  executiveImportance: number;
  dependencies: string[];
  recommendedOrder: number;
  estimatedEffortMinutes: number;
  confidence: ConfidenceScore;
  businessNarrative: string;
  owner: string;
  deadline: string;
  status: string;
  outcomeIds: string[];
  reasoning: string;
  reasoningGraph: ReasoningGraph;
  strategicAlignment: StrategicAlignment;
};

export type RecommendationAct =
  | "approve"
  | "delegate"
  | "escalate"
  | "wait"
  | "investigate"
  | "schedule"
  | "reject"
  | "defer";

export type IntelligentRecommendation = {
  id: string;
  act: RecommendationAct;
  title: string;
  reason: string;
  evidence: string[];
  expectedBenefit: string;
  expectedDownside: string;
  confidence: ConfidenceScore;
  relatedOutcomeIds: string[];
  relatedDecisionIds: string[];
  href: string;
  attentionValue: number;
  reasoningGraph: ReasoningGraph;
  strategicAlignment: StrategicAlignment;
};

export type NarrativeBundle = {
  executiveSummary: string;
  sinceYesterday: Array<{ id: string; sentence: string; href: string }>;
  executiveBrief: string;
  weeklyBrief: string;
  monthlyBrief: string;
  greeting: string;
  tone: "ceo";
};

export type AttentionItemKind =
  | "decision"
  | "outcome"
  | "meeting"
  | "risk"
  | "opportunity"
  | "action";

export type AttentionItem = {
  id: string;
  kind: AttentionItemKind;
  label: string;
  href: string;
  /** Higher = more deserving of scarce executive attention */
  attentionValue: number;
  estimatedMinutes: number;
  why: string;
  relatedIds: string[];
  strategicAlignment?: StrategicAlignment;
};

export type AttentionAllocation = {
  budgetMinutes: number;
  budgetLevel: AttentionBudgetLevel;
  ranked: AttentionItem[];
  selected: AttentionItem[];
  deferred: AttentionItem[];
  reasoning: string;
};

export type CompassDimensionId =
  | "focus"
  | "risk"
  | "opportunity"
  | "capacity";

export type IntelligentCompass = {
  dimensions: Array<{
    id: CompassDimensionId;
    label: string;
    strength: number;
    direction: "rising" | "falling" | "steady";
    reasoning: string;
  }>;
};

export type SnapshotMetricId =
  | "urgent_decisions"
  | "strategic_opportunities"
  | "critical_risks"
  | "waiting_on_others"
  | "executive_meetings"
  | "review_time";

export type IntelligentMetric = {
  id: SnapshotMetricId;
  label: string;
  value: string;
  numericValue: number | null;
  href: string;
  emphasis: boolean;
  reasoning: string;
};

/**
 * Single object the Today presentation layer consumes.
 * UI never derives — it only renders.
 */
export type IntelligentExecutiveSnapshot = {
  asOf: string;
  greeting: string;
  pulse: PulseResult;
  capacity: CapacityResult;
  compass: IntelligentCompass;
  outcomes: IntelligentOutcome[];
  decisions: IntelligentDecision[];
  recommendations: IntelligentRecommendation[];
  narrative: NarrativeBundle;
  attention: AttentionAllocation;
  metrics: IntelligentMetric[];
  reviewMinutes: number;
  /** Full explainability index keyed by entity id */
  reasoningIndex: Record<string, ReasoningGraph>;
  /**
   * Structured judgement briefs from the Executive Judgement Engine.
   * Aids thinking — never a binding decision.
   */
  judgementBriefs?: import("@/intelligence/executive-judgement/types").DecisionBrief[];
  /**
   * Executive Council brief — multi-perspective discussion, not a single rec.
   */
  councilBrief?: import("@/agents/types").ExecutiveCouncilBrief;
  /**
   * Possible futures — scenario reasoning, not a forecast bind.
   */
  futuresBrief?: import("@/futures/models/types").FuturesBrief;
  /**
   * Executive Agenda — strategic priorities and coordinated initiatives.
   */
  agendaBrief?: import("@/agenda/models/types").ExecutiveAgenda;
  /**
   * Executive context from productivity providers (e.g. Microsoft 365).
   * Portable brief — never vendor objects.
   */
  executiveContextBrief?: import("@/providers/microsoft365/executive-context/types").ExecutiveContextBrief;
  /**
   * Operational context from field-service providers (e.g. Simpro).
   * Portable brief — never vendor objects.
   */
  operationalContextBrief?: import("@/providers/simpro/executive-context/types").OperationalContextBrief;
  /**
   * Commercial context from CRM providers (e.g. Salesforce).
   * Portable brief — never vendor objects.
   */
  commercialContextBrief?: import("@/providers/salesforce/executive-context/types").CommercialContextBrief;
};

/** Provider-facing enterprise signals — engines never know the source system. */
export type EnterpriseOutcomeSignal = {
  id: string;
  name: string;
  description: string;
  status: "on_track" | "at_risk" | "off_track" | "watching";
  healthScore: number;
  yesterdayMovement: number;
  yesterdayMovementLabel: string;
  confidence: number;
  owner: string;
  businessImpact: string;
  decisionIds: string[];
  blockers: Array<{
    id: string;
    title: string;
    severity: "critical" | "attention" | "watch";
  }>;
  overnightSignals: Array<{
    id: string;
    severity: "critical" | "attention" | "info";
    whatChanged: string;
    why: string;
  }>;
  pendingActions: Array<{
    id: string;
    label: string;
    status: "pending" | "in_progress" | "blocked";
    why: string;
    expectedOutcomeImpact: string;
  }>;
  meetings: Array<{ id: string; title: string; startsAt: string }>;
  history: Array<{ date: string; healthScore: number; note: string }>;
  forecast: {
    direction: Trajectory;
    expectedScore: number;
    narrative: string;
  };
  contributingSystems: string[];
};

export type EnterpriseDecisionSignal = {
  id: string;
  question: string;
  status: string;
  owner: string;
  deadline: string;
  confidence: number;
  businessImpact: string;
  expectedOutcomeImpact: string;
  costOfDelay: string;
  whatChanged: string;
  why: string;
  outcomeIds: string[];
  stakeholderCount: number;
  evidenceCount: number;
  systems: string[];
};

export type EnterpriseSignals = {
  asOf: string;
  executiveName: string;
  overallScore: number;
  outcomes: EnterpriseOutcomeSignal[];
  decisions: EnterpriseDecisionSignal[];
};
