/**
 * Executive Intent Engine types.
 * Intent is strategic context — not a second business-state store.
 * Outcome health and decision records remain on OutcomePortfolio.
 */

export type IntentStatus = "active" | "draft" | "superseded";

export type IntentPriority = "critical" | "high" | "standard";

/** How an outcome relates to the active Intent (derived; ids only on Intent). */
export type OutcomeIntentAlignment =
  | "focused"
  | "watching"
  | "supporting"
  | "non_focus";

export type IntentConstraint = {
  id: string;
  label: string;
  explanation: string;
};

export type IntentSuccessSignal = {
  id: string;
  label: string;
  /** Qualitative narrative — not a KPI score */
  narrative: string;
};

export type IntentHistoryEntry = {
  id: string;
  at: string;
  title: string;
  detail: string;
  kind: "activated" | "amended" | "reviewed" | "superseded" | "note";
};

/**
 * Canonical Intent record (Sprint 4B approved field set).
 * `nonFocusOutcomeIds` is id-only so Outcome Alignment can show Non-Focus
 * without embedding outcome business state (see CORE_EXECUTIVE_LOOP / design).
 */
export type ExecutiveIntent = {
  id: string;
  title: string;
  narrative: string;
  priority: IntentPriority;
  horizon: string;
  reviewDate: string;
  /** Human review cadence, e.g. "Weekly · Mondays" */
  reviewCadence: string;
  focusOutcomeIds: string[];
  watchingOutcomeIds: string[];
  /** Id refs only — demoted / explicit non-focus outcomes */
  nonFocusOutcomeIds: string[];
  constraints: IntentConstraint[];
  successSignals: IntentSuccessSignal[];
  status: IntentStatus;
  history: IntentHistoryEntry[];
};

/** Compact Briefing / strip projection — names resolved from OutcomeProvider. */
export type IntentContext = {
  intentId: string;
  title: string;
  narrative: string;
  horizon: string;
  reviewDate: string;
  reviewCadence: string;
  priority: IntentPriority;
  status: IntentStatus;
  focusOutcomes: Array<{ id: string; name: string }>;
  constraints: IntentConstraint[];
};

export type IntentOutcomeRef = {
  id: string;
  name: string;
  alignment: OutcomeIntentAlignment;
  healthScore: number;
  status: string;
};

/** Decision ↔ Intent alignment — derived via linked outcomes only. */
export type DecisionIntentAlignment = {
  intentId: string;
  intentTitle: string;
  /** Strongest alignment among linked outcomes */
  alignment: OutcomeIntentAlignment;
  viaOutcomeIds: string[];
  viaOutcomeNames: string[];
  explanation: string;
};
