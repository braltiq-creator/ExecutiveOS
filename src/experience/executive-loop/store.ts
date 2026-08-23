/**
 * In-memory Executive Operating Loop store.
 * Presentation layer only — no providers / Core changes.
 */

import type {
  LoopFeedEvent,
  LoopImpactRecord,
  LoopState,
  RecordApprovalInput,
} from "@/experience/executive-loop/types";

const listeners = new Set<() => void>();

let state: LoopState = {
  impacts: [],
  feedEvents: [],
  healthDeltaCumulative: 0,
  valueDeltaCumulative: 0,
  confidenceBoost: 0,
  lastRecalculatedAt: null,
  changedKpiIds: [],
  pendingCeremony: null,
  version: 0,
};

function emit() {
  state = { ...state, version: state.version + 1 };
  listeners.forEach((l) => l());
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function briefTitle(title: string): string {
  const cleaned = title.replace(/\s+/g, " ").trim();
  const words = cleaned.split(/\s+/);
  if (words.length <= 8) return cleaned.replace(/\?$/, "");
  return `${words.slice(0, 8).join(" ")}…`;
}

export function getLoopState(): LoopState {
  return state;
}

export function subscribeLoop(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Record an approved decision and queue the recalculation ceremony. */
export function recordLoopApproval(input: RecordApprovalInput): LoopImpactRecord {
  const now = new Date();
  const at = now.toISOString();
  const healthBefore = input.healthBefore ?? 69;
  const predictedHealthDelta = 5;
  const actualHealthDelta = 5;
  const healthAfter = Math.min(99, healthBefore + actualHealthDelta);
  const predictedValueAud = 420_000;
  const actualValueAud = 420_000;
  const confidenceBefore = input.confidenceBefore ?? 74;
  const confidenceAfter = Math.min(96, confidenceBefore + 4);
  const title = briefTitle(input.decisionTitle);

  const impact: LoopImpactRecord = {
    decisionId: input.decisionId,
    decisionTitle: title,
    approvedAt: at,
    predictedHealthDelta,
    actualHealthDelta,
    predictedValueAud,
    actualValueAud,
    confidenceBefore,
    confidenceAfter,
    healthBefore,
    healthAfter,
    commercialBefore: "Watch",
    commercialAfter: "Improving",
  };

  const href = `/decisions/${input.decisionId}`;
  const feed: LoopFeedEvent[] = [
    {
      id: `loop-approved-${input.decisionId}-${at}`,
      at,
      timeLabel: formatTime(now),
      headline: `${title} approved`,
      href,
    },
    {
      id: `loop-health-${input.decisionId}-${at}`,
      at,
      timeLabel: formatTime(now),
      headline: `Organisation Health ${healthBefore} → ${healthAfter}`,
      href,
    },
    {
      id: `loop-commercial-${input.decisionId}-${at}`,
      at,
      timeLabel: formatTime(now),
      headline: "Commercial Capacity improved",
      href,
    },
    {
      id: `loop-value-${input.decisionId}-${at}`,
      at,
      timeLabel: formatTime(now),
      headline: `Executive Value +£${actualValueAud.toLocaleString()}`,
      href,
    },
    {
      id: `loop-confidence-${input.decisionId}-${at}`,
      at,
      timeLabel: formatTime(now),
      headline: "Executive Confidence improved",
      href,
    },
  ];

  state = {
    ...state,
    impacts: [impact, ...state.impacts].slice(0, 24),
    feedEvents: [...feed, ...state.feedEvents].slice(0, 40),
    healthDeltaCumulative: state.healthDeltaCumulative + actualHealthDelta,
    valueDeltaCumulative: state.valueDeltaCumulative + actualValueAud,
    confidenceBoost: Math.min(20, state.confidenceBoost + 4),
    lastRecalculatedAt: at,
    changedKpiIds: [
      "organisation_health",
      "executive_intelligence",
      "executive_value",
      "priority_decisions",
      "commercial_health",
    ],
    pendingCeremony: impact,
  };
  emit();
  return impact;
}

export function clearPendingCeremony() {
  if (!state.pendingCeremony) return;
  state = { ...state, pendingCeremony: null };
  emit();
}

export function clearLoopHighlights() {
  if (state.changedKpiIds.length === 0) return;
  state = { ...state, changedKpiIds: [] };
  emit();
}

export function getImpactForDecision(
  decisionId: string,
): LoopImpactRecord | undefined {
  return state.impacts.find((i) => i.decisionId === decisionId);
}

export function listLoopImpacts(): LoopImpactRecord[] {
  return state.impacts;
}

/** Test helper */
export function resetLoopStore() {
  state = {
    impacts: [],
    feedEvents: [],
    healthDeltaCumulative: 0,
    valueDeltaCumulative: 0,
    confidenceBoost: 0,
    lastRecalculatedAt: null,
    changedKpiIds: [],
    pendingCeremony: null,
    version: 0,
  };
  emit();
}
