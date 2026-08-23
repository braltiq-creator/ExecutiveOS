/**
 * Design Partner readiness — Manufacturing Forecasting pilot.
 * Generic configuration. Never hard-code a customer name into architecture.
 */

import type { ManufacturingAnalysis } from "@/executive-snapshot-studio/intelligence/manufacturing-analysis";
import type { StudioReadiness } from "@/executive-snapshot-studio/types";

/** Pilot product focus — not a separate product binary. */
export type DesignPartnerFocusModule = "manufacturing_forecasting";

export type DesignPartnerEnvironmentKind =
  | "demo"
  | "design_partner"
  | "standard";

export type DesignPartnerPilotWeek =
  | "week_1"
  | "week_2"
  | "week_3"
  | "week_4"
  | "not_started"
  | "complete";

export type DesignPartnerStatus = {
  kind: DesignPartnerEnvironmentKind;
  label: "DESIGN PARTNER ENVIRONMENT" | "DEMO" | "EXECUTIVEOS";
  focusModule: DesignPartnerFocusModule | null;
  focusLabel: string | null;
  snapshotId: string | null;
  snapshotLabel: string | null;
  dataHealth: "healthy" | "attention" | "insufficient" | "unknown";
  executiveReadiness: number | null;
  datasetReadiness: number | null;
  /** Day N of 30 only when pilotStartedAt is known. */
  pilotDay: number | null;
  pilotDayLabel: string;
  pilotWeek: DesignPartnerPilotWeek;
  retentionPolicyLabel: string;
};

export type DesignPartnerReadinessSummary = {
  datasetReadiness: number;
  quality: number;
  coverage: number;
  freshness: number;
  relationships: number;
  forecastCompleteness: number | null;
  actualDemandCoverage: number | null;
  capacityCoverage: number | null;
  inventoryCoverage: number | null;
  executiveJudgementReadiness: number;
  issues: DesignPartnerDataIssue[];
  whatWeReceived: string[];
  whatWeUnderstood: string[];
  whatIsMissing: string[];
  whatWeCanInterpret: string[];
  whatWeCannotInterpret: string[];
  scoredAt: string;
};

export type DesignPartnerDataIssueSeverity = "material" | "normalised" | "info";

export type DesignPartnerDataIssue = {
  id: string;
  severity: DesignPartnerDataIssueSeverity;
  title: string;
  detail: string;
  /** Safe automatic normalisation note — never silent material repair. */
  transformationNote?: string;
};

export type DesignPartnerFeedbackKind =
  | "useful"
  | "not_useful"
  | "missing"
  | "incorrect"
  | "would_start_here"
  | "would_not_start_here";

export type DesignPartnerFeedback = {
  id: string;
  organisationId: string;
  kind: DesignPartnerFeedbackKind;
  comment: string | null;
  snapshotId: string | null;
  insightId: string | null;
  decisionId: string | null;
  screen: string | null;
  actorId: string | null;
  at: string;
};

export type DesignPartnerMetricId =
  | "time_to_first_insight_ms"
  | "time_to_decision_frame_ms"
  | "decisions_logged"
  | "actions_created"
  | "data_preparation_friction"
  | "executive_return"
  | "would_start_here";

export type DesignPartnerMetricEvent = {
  id: string;
  organisationId: string;
  metricId: DesignPartnerMetricId;
  value: number | null;
  /** Free-form measured label — never fabricated. */
  label: string;
  snapshotId: string | null;
  decisionId: string | null;
  actionId: string | null;
  at: string;
  metadata?: Record<string, string | number | boolean | null>;
};

export type DesignPartnerMetricsSnapshot = {
  organisationId: string;
  asOf: string;
  timeToFirstInsightMs: number | null;
  timeToDecisionFrameMs: number | null;
  decisionsLogged: number;
  actionsCreated: number;
  dataPreparationFrictionCount: number;
  executiveReturnCount: number;
  wouldStartHereYes: number;
  wouldStartHereNo: number;
  /** Honest: nulls mean not yet measured. */
  explanation: string;
};

export type DesignPartnerCheckpoint = {
  week: DesignPartnerPilotWeek;
  title: string;
  themes: string[];
  status: "upcoming" | "current" | "complete" | "not_started";
};

export type ExpansionSignalStatus = "active" | "not_active";

export type ExpansionSignal = {
  id: string;
  label: string;
  status: ExpansionSignalStatus;
  rationale: string;
};

export type DesignPartnerSecurityPosture = {
  claims: Array<{
    id: string;
    title: string;
    statement: string;
    status: "implemented" | "supported_by_architecture" | "not_yet_implemented";
  }>;
  forbiddenClaims: string[];
  retentionLabel: string;
};

export type ManufacturingSnapshotCompareInput = {
  currentId: string;
  previousId: string;
  currentLabel?: string;
  previousLabel?: string;
  currentConfidence: number | null;
  previousConfidence: number | null;
  currentReadiness: StudioReadiness | null;
  previousReadiness: StudioReadiness | null;
  currentAnalysis: ManufacturingAnalysis | null;
  previousAnalysis: ManufacturingAnalysis | null;
};

export type SnapshotCompareChange = {
  id: string;
  category:
    | "demand"
    | "forecast"
    | "actual_vs_forecast"
    | "confidence"
    | "capacity"
    | "inventory"
    | "readiness";
  label: string;
  detail: string;
  deltaLabel: string | null;
};

export type ManufacturingSnapshotComparison = {
  currentId: string;
  previousId: string;
  currentLabel: string;
  previousLabel: string;
  changes: SnapshotCompareChange[];
  unsupported: string[];
};
