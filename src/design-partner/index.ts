/**
 * Design Partner readiness — Manufacturing Forecasting pilot support.
 * Generic. No customer hard-coding. No fake integrations or certifications.
 */

export type * from "./types";

export {
  DESIGN_PARTNER_PILOT_DAYS,
  buildDesignPartnerStatus,
  dataHealthFromReadiness,
  focusLabelForModule,
  pilotDayOf,
  pilotWeekFromDay,
  resolveEnvironmentKind,
  resolveFocusModule,
  retentionPolicyLabel,
} from "./environment";

export { buildDesignPartnerReadinessSummary } from "./readiness";
export { compareManufacturingSnapshots } from "./snapshot-compare";
export {
  buildAccountabilityRows,
  buildContinuityBundle,
  buildSinceYouLastLooked,
  findPreviousSnapshot,
  resolveJudgementContinuity,
} from "./continuity";
export type {
  AccountabilityRow,
  ContinuityBundle,
  ContinuityItem,
  ContinuitySemanticState,
  JudgementContinuity,
} from "./continuity";

export {
  buildDesignPartnerMetricsSnapshot,
  clearDesignPartnerMetrics,
  listDesignPartnerMetrics,
  recordActionCreated,
  recordDecisionLogged,
  recordDesignPartnerMetric,
  recordTimeToFirstInsight,
  recordWouldStartHere,
} from "./metrics";

export {
  clearDesignPartnerFeedback,
  listDesignPartnerFeedback,
  recordDesignPartnerFeedback,
} from "./feedback";

export {
  DESIGN_PARTNER_PILOT_EXCLUDES,
  DESIGN_PARTNER_PILOT_INCLUDES,
  buildDesignPartnerCheckpoints,
} from "./checkpoints";

export { buildManufacturingExpansionSignals } from "./expansion";
export { buildDesignPartnerSecurityPosture } from "./security";

export {
  assertOrganisationAuditIsolation,
  clearDesignPartnerAudit,
  listDesignPartnerAudit,
  recordDesignPartnerAudit,
} from "./audit";
export type {
  DesignPartnerAuditEvent,
  DesignPartnerAuditEventKind,
} from "./audit";

export { probeDesignPartnerIsolation } from "./isolation";
export type { IsolationProbeResult } from "./isolation";

export {
  runManufacturingPilotSimulation,
} from "./pilot-simulation";
export type {
  PilotSimulationInput,
  PilotSimulationResult,
  TaskVerdict,
  HypothesisVerdict,
  ObservedFriction,
  ExecutiveTaskObservation,
} from "./pilot-simulation";

export {
  LIVE_OPENING_INSTRUCTION,
  LIVE_PROTOCOL_STEPS,
  TRUST_PROMPT,
  VISUAL_PROMPT,
  EXECUTIVE_VALUE_PROMPTS,
  LIVE_REQUIRED_CC_SURFACES,
  createLiveSessionEvidenceShell,
  hasLiveTimings,
  resolveF6906Status,
  buildLiveScorecardFromEvidence,
  finalizeLiveSessionVerdict,
  sealLiveSessionEvidence,
} from "./live-executive-validation";
export type {
  LiveTaskId,
  CoachingLevel,
  LiveVerdict,
  VisualUsefulness,
  FrictionSeverity,
  LiveFriction,
  TimedTaskRecord,
  BehaviouralObservation,
  TrustConcerns,
  ExecutiveValueResponses,
  LiveScorecard,
  LiveSessionStatus,
  LiveSessionEvidence,
} from "./live-executive-validation";
