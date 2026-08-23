import type { RecommendationFields } from "@/lib/briefing/executive-briefing-types";
import type { Decision } from "@/lib/decisions/engine-types";
import type { ExecutiveIntent } from "@/lib/intent/engine-types";

export type OutcomeStatus = "on_track" | "at_risk" | "off_track" | "watching";

export type TrajectoryDirection = "improving" | "stable" | "declining";

export type OutcomeContributor = {
  id: string;
  name: string;
  role: string;
  contribution: string;
};

export type OutcomeBlocker = {
  id: string;
  title: string;
  description: string;
  severity: "critical" | "attention" | "watch";
  owner: string;
  since: string;
};

export type OutcomeRecommendation = {
  id: string;
  title: string;
  whatChanged: string;
  why: string;
  whatShouldHappenNext: string;
  recommendation: RecommendationFields;
};

export type OutcomeTimelineEvent = {
  id: string;
  at: string;
  title: string;
  detail: string;
  kind: "health" | "decision" | "insight" | "action" | "blocker" | "note";
};

export type OutcomeHistoryPoint = {
  id: string;
  date: string;
  healthScore: number;
  note: string;
};

export type OutcomeForecast = {
  horizonLabel: string;
  expectedScore: number;
  direction: TrajectoryDirection;
  narrative: string;
  assumptions: string[];
};

export type OutcomeRelationship = {
  id: string;
  relatedOutcomeId: string;
  relatedOutcomeName: string;
  relationship: "supports" | "depends_on" | "conflicts_with" | "informs";
  explanation: string;
};

export type OutcomeInsightRef = {
  id: string;
  sourceLabel: string;
  whatChanged: string;
  why: string;
  whatShouldHappenNext: string;
  recommendation: RecommendationFields;
};

export type OutcomeActionRef = {
  id: string;
  actionLabel: string;
  status: "pending" | "in_progress" | "blocked";
  whatChanged: string;
  why: string;
  whatShouldHappenNext: string;
  recommendation: RecommendationFields;
  /** Phase 61 — lineage to originating decision (required for Decision Loop actions). */
  decisionId?: string;
  /** Originating snapshot id — never mutates the snapshot. */
  snapshotId?: string | null;
  /** Evidence ids captured at action creation. */
  evidenceIds?: string[];
  /** Honest label when action confidence % is not established. */
  actionConfidenceLabel?: string;
  /** Derived expected outcome narrative — never fabricated $. */
  expectedOutcomeLabel?: string;
};

export type OutcomeOvernightSignal = {
  id: string;
  occurredAt: string;
  severity: "critical" | "attention" | "info";
  whatChanged: string;
  why: string;
  whatShouldHappenNext: string;
  recommendation: RecommendationFields;
};

export type OutcomeCalendarRef = {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  attendeesSummary: string;
  whatChanged: string;
  why: string;
  whatShouldHappenNext: string;
  recommendation: RecommendationFields;
};

/** Central Outcome Engine object — single source of truth per strategic outcome. */
export type Outcome = {
  id: string;
  name: string;
  description: string;
  status: OutcomeStatus;
  /** Current health 0–100 */
  healthScore: number;
  /** Points moved vs yesterday (negative = decline) */
  yesterdayMovement: number;
  yesterdayMovementLabel: string;
  expectedTrajectory: {
    direction: TrajectoryDirection;
    summary: string;
    horizonLabel: string;
  };
  /** Decision Engine ids — no embedded decision business state */
  decisionIds: string[];
  contributingInsights: OutcomeInsightRef[];
  pendingActions: OutcomeActionRef[];
  confidence: number;
  owner: string;
  targetDate: string;
  businessImpact: string;
  timeline: OutcomeTimelineEvent[];
  contributors: OutcomeContributor[];
  blockers: OutcomeBlocker[];
  recommendations: OutcomeRecommendation[];
  forecast: OutcomeForecast;
  history: OutcomeHistoryPoint[];
  relationships: OutcomeRelationship[];
  overnightSignals: OutcomeOvernightSignal[];
  calendarContext: OutcomeCalendarRef[];
};

export type OutcomePortfolio = {
  overallScore: number;
  statusLabel: string;
  refreshedAt: string;
  executiveName: string;
  outcomes: Outcome[];
  /** Canonical Decision Intelligence store — linked via outcomeIds */
  decisions: Decision[];
  /** Active Executive Intent — context only; does not duplicate outcome state */
  intent: ExecutiveIntent;
  /** Prior Intent records (superseded) — history for /intent */
  intentHistory: ExecutiveIntent[];
};
