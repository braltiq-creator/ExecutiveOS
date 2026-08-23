/**
 * ExecutiveOS Command Centre — signature Today orientation model.
 * Recognisable before a single paragraph is read.
 */

export type SnapshotTrend = "up" | "down" | "flat";

export type SnapshotOutcomeStatus =
  | "on_track"
  | "at_risk"
  | "off_track"
  | "watching";

export type OutcomeMomentum = "building" | "drifting" | "steady";

export type BusinessPulseLevel =
  | "stable"
  | "improving"
  | "attention"
  | "critical";

export type BusinessPulse = {
  level: BusinessPulseLevel;
  label: string;
  /** One sentence — why this state exists */
  why: string;
  confidence: number;
  aiConfidence: number;
  refreshedAt: string;
  refreshedLabel: string;
  href: string;
};

export type CompassDimensionId =
  | "focus"
  | "risk"
  | "opportunity"
  | "capacity";

export type CompassDirection = "rising" | "falling" | "steady";

export type CompassDimension = {
  id: CompassDimensionId;
  label: string;
  /** 0–100 strength */
  strength: number;
  direction: CompassDirection;
};

export type ExecutiveCompass = {
  dimensions: CompassDimension[];
};

export type LeadershipLoad = "light" | "moderate" | "heavy";
export type ExecutiveCapacity = "available" | "constrained" | "overdrawn";
export type AttentionBudget = "focused" | "split" | "contested";

export type ExecutiveState = {
  decisionLoad: LeadershipLoad;
  capacity: ExecutiveCapacity;
  attentionBudget: AttentionBudget;
  /** Plain-English leadership summary */
  summary: string;
  href: string;
};

export type SnapshotOutcome = {
  id: string;
  name: string;
  href: string;
  trend: SnapshotTrend;
  momentum: OutcomeMomentum;
  momentumLabel: string;
  movementLabel: string;
  sparkline: number[];
  status: SnapshotOutcomeStatus;
  lastChange: string;
};

export type SnapshotMetricId =
  | "urgent_decisions"
  | "strategic_opportunities"
  | "critical_risks"
  | "waiting_on_others"
  | "executive_meetings"
  | "review_time";

export type SnapshotMetric = {
  id: SnapshotMetricId;
  label: string;
  value: string;
  numericValue: number | null;
  href: string;
  emphasis: boolean;
};

export type SnapshotDecision = {
  id: string;
  title: string;
  href: string;
  owner: string;
  decisionTimeLabel: string;
  businessImpact: string;
};

export type SnapshotAction = {
  id: string;
  title: string;
  why: string;
  expectedOutcome: string;
  href: string;
  /** Scenario Pack reference — acceptance criteria for the executive question */
  scenarioId?: string;
  scenarioName?: string;
  businessQuestion?: string;
  evidence?: string[];
  confidence?: number;
  /** Organisational Memory recall */
  previousSituations?: string[];
  pastDecisions?: string[];
  observedOutcomes?: string[];
  lessonsLearned?: string[];
  similarityConfidence?: number;
  /** Strategic Outcomes Framework */
  supportsOutcome?: string;
  supportsOutcomeId?: string;
  expectedImpact?: string;
  strategyConfidence?: number;
  strategyEvidence?: string[];
  potentialRisk?: string;
  estimatedContribution?: number;
  /** Trust & Explainability Framework */
  explanationId?: string;
  whyWeBelieveThis?: string;
  confidenceExplanation?: string;
  confidenceReasons?: string[];
  confidenceBand?: "high" | "moderate" | "low";
  evidenceSummary?: string[];
  memorySummary?: string[];
  alternativeSummary?: string;
  decisionPathLabels?: string[];
  /** Adaptive Learning — presentation only */
  adaptivePriorityBoost?: number;
  adaptivePresentationHint?: string;
  adaptiveEvidenceEmphasis?: "low" | "medium" | "high";
  adaptiveExplanation?: string;
};

export type SinceYesterdayUpdate = {
  id: string;
  sentence: string;
  href: string;
};

export type CouncilPerspectiveView = {
  agentId: string;
  title: string;
  shortTitle: string;
  summary: string;
  stanceLabel: string;
  priorities: string[];
  recommendations: string[];
  challenges: string[];
  risks: string[];
  opportunities: string[];
  confidence: number;
  reasoning: string[];
  /** Strategic outcome contribution evaluation (presentation layer) */
  strategicOutcomeContributions?: string[];
};

export type CouncilConflictView = {
  topic: string;
  positions: Array<{ agent: string; stance: string; statement: string }>;
  facilitation: string;
};

export type ExecutiveCouncilView = {
  framing: string;
  perspectives: CouncilPerspectiveView[];
  conflicts: CouncilConflictView[];
  decisionSequence: string[];
  closingNote: string;
};

/** Re-export presentation shape from Futures Engine */
export type PossibleFuturesView =
  import("@/futures/models/types").PossibleFuturesView;

/** Re-export presentation shape from Executive Agenda */
export type ExecutiveAgendaView =
  import("@/agenda/models/types").ExecutiveAgendaView;

/** Re-export presentation shape from Executive Context Provider */
export type ExecutiveContextView =
  import("@/providers/microsoft365/executive-context/types").ExecutiveContextView;

/** Re-export presentation shape from Operational Context Provider */
export type OperationalContextView =
  import("@/providers/simpro/executive-context/types").OperationalContextView;

/** Re-export presentation shape from Commercial Context Provider */
export type CommercialContextView =
  import("@/providers/salesforce/executive-context/types").CommercialContextView;

export type ExecutiveSnapshot = {
  greeting: string;
  asOf: string;
  pulse: BusinessPulse;
  compass: ExecutiveCompass;
  executiveState: ExecutiveState;
  outcomes: SnapshotOutcome[];
  metrics: SnapshotMetric[];
  sinceYesterday: SinceYesterdayUpdate[];
  priorityDecisions: SnapshotDecision[];
  recommendedActions: SnapshotAction[];
  executiveCouncil?: ExecutiveCouncilView;
  possibleFutures?: PossibleFuturesView;
  executiveAgenda?: ExecutiveAgendaView;
  executiveContext?: ExecutiveContextView;
  operationalContext?: OperationalContextView;
  commercialContext?: CommercialContextView;
};

export const PULSE_LABELS: Record<BusinessPulseLevel, string> = {
  stable: "Stable",
  improving: "Improving",
  attention: "Attention Required",
  critical: "Critical",
};

export const MOMENTUM_LABELS: Record<OutcomeMomentum, string> = {
  building: "Building",
  drifting: "Drifting",
  steady: "Steady",
};
