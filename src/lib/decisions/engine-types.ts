export type EngineDecisionStatus =
  | "pending"
  | "under_review"
  | "due_today"
  | "approved"
  | "deferred"
  | "decided";

/**
 * Phase 61 — executive selection lifecycle.
 * OPTION_IDENTIFIED ≠ OPTION_SELECTED ≠ approval.
 */
export type ExecutiveSelectionState =
  | "OPTION_IDENTIFIED"
  | "OPTION_SELECTED"
  | "DECISION_APPROVED"
  | "DECISION_REJECTED"
  | "DECISION_DEFERRED";

export type ApprovalStepStatus = "complete" | "current" | "upcoming" | "blocked";

export type DecisionStakeholder = {
  id: string;
  name: string;
  role: string;
  stance: "sponsor" | "approver" | "advisor" | "impacted" | "informed";
  note: string;
};

export type DecisionEvidence = {
  id: string;
  title: string;
  source: string;
  summary: string;
  asOf: string;
};

export type DecisionAlternative = {
  id: string;
  label: string;
  summary: string;
  upside: string;
  downside: string;
};

export type DecisionTradeOff = {
  id: string;
  dimension: string;
  choice: string;
  consequence: string;
};

export type DecisionRelationship = {
  id: string;
  relatedDecisionId: string;
  relatedDecisionLabel: string;
  relationship: "blocks" | "enables" | "related_to" | "supersedes";
  explanation: string;
};

export type DecisionTimelineEvent = {
  id: string;
  at: string;
  title: string;
  detail: string;
  kind: "opened" | "evidence" | "review" | "approval" | "status" | "note";
};

export type DecisionHistoryEntry = {
  id: string;
  at: string;
  status: EngineDecisionStatus;
  note: string;
  actor: string;
};

export type ApprovalWorkflowStep = {
  id: string;
  label: string;
  owner: string;
  status: ApprovalStepStatus;
  completedAt?: string;
  note?: string;
};

/** Decision Intelligence Engine object — always linked to ≥1 outcome. */
export type Decision = {
  id: string;
  question: string;
  /** Required — no standalone decisions */
  outcomeIds: string[];
  status: EngineDecisionStatus;
  owner: string;
  deadline: string;
  confidence: number;
  businessImpact: string;
  expectedOutcomeImpact: string;
  costOfDelay: string;
  whatChanged: string;
  why: string;
  whatShouldHappenNext: string;
  stakeholders: DecisionStakeholder[];
  evidence: DecisionEvidence[];
  alternatives: DecisionAlternative[];
  tradeOffs: DecisionTradeOff[];
  relationships: DecisionRelationship[];
  timeline: DecisionTimelineEvent[];
  history: DecisionHistoryEntry[];
  approvalWorkflow: ApprovalWorkflowStep[];
  recommendationSummary: string;
  /**
   * Phase 61 — executive selection state.
   * Defaults to OPTION_IDENTIFIED when alternatives exist and none selected.
   */
  executiveSelectionState?: ExecutiveSelectionState;
  selectedAlternativeId?: string | null;
  selectedAlternativeLabel?: string | null;
  /** Originating Executive Snapshot id — lineage only; snapshot remains immutable. */
  originSnapshotId?: string | null;
  /** Evidence frozen at selection / bind time. */
  evidenceAtDecision?: DecisionEvidence[];
  decisionRecordedAt?: string | null;
};

export type DecisionQueueItem = Decision & {
  outcomeNames: string[];
  primaryOutcomeId: string;
};
