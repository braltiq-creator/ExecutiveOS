/**
 * Executive Memory Engine (EME) — long-term learning system.
 * Remembers what matters. Never invents history.
 */

export type MemoryEntityKind =
  | "decision"
  | "outcome"
  | "risk"
  | "recommendation"
  | "action"
  | "meeting"
  | "strategic_initiative"
  | "commitment"
  | "behaviour"
  | "preference"
  | "executive";

export type MemoryEventKind =
  | "commitment_made"
  | "commitment_kept"
  | "commitment_broken"
  | "decision_recorded"
  | "decision_deferred"
  | "outcome_moved"
  | "risk_raised"
  | "risk_mitigated"
  | "recommendation_offered"
  | "recommendation_accepted"
  | "recommendation_rejected"
  | "recommendation_succeeded"
  | "recommendation_failed"
  | "meeting_held"
  | "delegation_made"
  | "approval_latency"
  | "deep_work_protected"
  | "deep_work_broken"
  | "focus_shift"
  | "preference_observed"
  | "interruption";

export type MemoryEvent = {
  id: string;
  at: string;
  kind: MemoryEventKind;
  entityKind: MemoryEntityKind;
  entityId: string;
  label: string;
  detail: string;
  /** Traceable source — never invented */
  source: string;
  executiveId: string;
  relatedEntityIds?: string[];
  metrics?: Record<string, number>;
  tags?: string[];
};

export type ExecutiveCommitment = {
  id: string;
  madeAt: string;
  dueAt?: string;
  label: string;
  detail: string;
  status: "open" | "kept" | "broken" | "superseded";
  entityKind: MemoryEntityKind;
  entityId: string;
  executiveId: string;
  sourceEventId: string;
};

export type BehaviourDimension =
  | "deep_work"
  | "meeting_load"
  | "decision_velocity"
  | "delegation"
  | "approval_latency"
  | "interruptions"
  | "strategic_focus";

export type BehaviourSnapshot = {
  asOf: string;
  executiveId: string;
  dimensions: Record<BehaviourDimension, number>;
  reasoning: string;
  sourceEventIds: string[];
};

export type BehaviourComparison = {
  from: BehaviourSnapshot;
  to: BehaviourSnapshot;
  deltas: Record<BehaviourDimension, number>;
  improving: BehaviourDimension[];
  deteriorating: BehaviourDimension[];
  stable: BehaviourDimension[];
  summary: string;
};

export type DriftReport = {
  asOf: string;
  executiveId: string;
  strategicDriftScore: number;
  leadershipConsistency: number;
  executionQuality: number;
  attentionDrift: number;
  openCommitments: ExecutiveCommitment[];
  repeatingPatterns: string[];
  reasoning: string;
  evidenceEventIds: string[];
};

export type ImprovementReport = {
  asOf: string;
  executiveId: string;
  improving: Array<{ dimension: BehaviourDimension; delta: number; evidence: string }>;
  deteriorating: Array<{ dimension: BehaviourDimension; delta: number; evidence: string }>;
  summary: string;
};

export type BehaviourPrediction = {
  executiveId: string;
  horizonDays: number;
  likelyPatterns: string[];
  riskOfDrift: number;
  confidence: number;
  reasoning: string;
  evidenceEventIds: string[];
};

export type HistoryRecommendation = {
  id: string;
  act: string;
  title: string;
  reason: string;
  basedOnEventIds: string[];
  confidence: number;
  relatedEntityIds: string[];
};

export type HistorySummary = {
  executiveId: string;
  from: string;
  to: string;
  whatChanged: string[];
  whatKeepsHappening: string[];
  openCommitments: string[];
  improving: string[];
  deteriorating: string[];
  repeatingPatterns: string[];
  recommendationOutcomes: {
    succeeded: string[];
    failed: string[];
  };
  narrative: string;
  evidenceEventIds: string[];
};

export type MemoryQuery = {
  executiveId?: string;
  entityId?: string;
  entityKind?: MemoryEntityKind;
  kinds?: MemoryEventKind[];
  tags?: string[];
  from?: string;
  to?: string;
  limit?: number;
};

export type MemoryInsight = {
  id: string;
  sentence: string;
  evidenceEventIds: string[];
  relatedEntityIds: string[];
  kind:
    | "recurrence"
    | "commitment"
    | "improvement"
    | "deterioration"
    | "recommendation_outcome"
    | "drift";
};

/** Portable snapshot for Supabase / export. */
export type MemorySnapshot = {
  asOf: string;
  source: string;
  events: MemoryEvent[];
  commitments: ExecutiveCommitment[];
};
