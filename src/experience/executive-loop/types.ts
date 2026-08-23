/** Executive Operating Loop — presentation state only. */

export type LoopFeedEvent = {
  id: string;
  at: string;
  timeLabel: string;
  headline: string;
  href: string;
};

export type LoopImpactRecord = {
  decisionId: string;
  decisionTitle: string;
  approvedAt: string;
  predictedHealthDelta: number;
  actualHealthDelta: number;
  predictedValueAud: number;
  actualValueAud: number;
  confidenceBefore: number;
  confidenceAfter: number;
  healthBefore: number;
  healthAfter: number;
  commercialBefore: string;
  commercialAfter: string;
};

export type LoopMemory = {
  yesterday: Array<{ decisionTitle: string; href: string }>;
  today: Array<{ label: string; value: string }>;
};

export type LoopState = {
  impacts: LoopImpactRecord[];
  feedEvents: LoopFeedEvent[];
  healthDeltaCumulative: number;
  valueDeltaCumulative: number;
  confidenceBoost: number;
  lastRecalculatedAt: string | null;
  changedKpiIds: string[];
  pendingCeremony: LoopImpactRecord | null;
  version: number;
};

export type RecordApprovalInput = {
  decisionId: string;
  decisionTitle: string;
  actor: string;
  healthBefore?: number;
  confidenceBefore?: number;
};
