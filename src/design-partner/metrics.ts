/**
 * Design Partner pilot metrics — recorded events only; never fabricate.
 */

import type {
  DesignPartnerMetricEvent,
  DesignPartnerMetricId,
  DesignPartnerMetricsSnapshot,
} from "./types";

const events: DesignPartnerMetricEvent[] = [];

function idFor(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${events.length}`;
}

export function recordDesignPartnerMetric(
  partial: Omit<DesignPartnerMetricEvent, "id" | "at"> & { at?: string },
): DesignPartnerMetricEvent {
  const entry: DesignPartnerMetricEvent = {
    id: idFor("dpm"),
    at: partial.at ?? new Date().toISOString(),
    organisationId: partial.organisationId,
    metricId: partial.metricId,
    value: partial.value,
    label: partial.label,
    snapshotId: partial.snapshotId,
    decisionId: partial.decisionId,
    actionId: partial.actionId,
    metadata: partial.metadata,
  };
  events.push(entry);
  return entry;
}

export function listDesignPartnerMetrics(
  organisationId?: string,
): DesignPartnerMetricEvent[] {
  if (!organisationId) return [...events];
  return events.filter((e) => e.organisationId === organisationId);
}

export function clearDesignPartnerMetrics(): void {
  events.length = 0;
}

function latestValue(
  list: DesignPartnerMetricEvent[],
  metricId: DesignPartnerMetricId,
): number | null {
  const matched = list.filter((e) => e.metricId === metricId && e.value != null);
  if (matched.length === 0) return null;
  return matched[matched.length - 1]!.value;
}

function count(
  list: DesignPartnerMetricEvent[],
  metricId: DesignPartnerMetricId,
): number {
  return list.filter((e) => e.metricId === metricId).length;
}

export function buildDesignPartnerMetricsSnapshot(input: {
  organisationId: string;
  asOf?: string;
}): DesignPartnerMetricsSnapshot {
  const asOf = input.asOf ?? new Date().toISOString();
  const list = listDesignPartnerMetrics(input.organisationId);
  const wouldYes = list.filter(
    (e) => e.metricId === "would_start_here" && e.value === 1,
  ).length;
  const wouldNo = list.filter(
    (e) => e.metricId === "would_start_here" && e.value === 0,
  ).length;

  const measured = [
    latestValue(list, "time_to_first_insight_ms") != null
      ? "time to first insight"
      : null,
    latestValue(list, "time_to_decision_frame_ms") != null
      ? "time to decision frame"
      : null,
    count(list, "decisions_logged") > 0 ? "decisions logged" : null,
    count(list, "actions_created") > 0 ? "actions created" : null,
  ].filter(Boolean);

  return {
    organisationId: input.organisationId,
    asOf,
    timeToFirstInsightMs: latestValue(list, "time_to_first_insight_ms"),
    timeToDecisionFrameMs: latestValue(list, "time_to_decision_frame_ms"),
    decisionsLogged: count(list, "decisions_logged"),
    actionsCreated: count(list, "actions_created"),
    dataPreparationFrictionCount: count(list, "data_preparation_friction"),
    executiveReturnCount: count(list, "executive_return"),
    wouldStartHereYes: wouldYes,
    wouldStartHereNo: wouldNo,
    explanation:
      measured.length === 0
        ? "No pilot metrics recorded yet. Values remain unknown until measured."
        : `Measured: ${measured.join(", ")}. Unmeasured fields remain null.`,
  };
}

/** Convenience recorders — value null when duration unknown. */
export function recordTimeToFirstInsight(input: {
  organisationId: string;
  ms: number | null;
  snapshotId?: string | null;
  actorId?: string;
}): DesignPartnerMetricEvent {
  return recordDesignPartnerMetric({
    organisationId: input.organisationId,
    metricId: "time_to_first_insight_ms",
    value: input.ms,
    label:
      input.ms == null
        ? "Time to first insight not yet measured."
        : `Time to first insight: ${Math.round(input.ms / 1000)}s`,
    snapshotId: input.snapshotId ?? null,
    decisionId: null,
    actionId: null,
    metadata: input.actorId ? { actorId: input.actorId } : undefined,
  });
}

export function recordDecisionLogged(input: {
  organisationId: string;
  decisionId: string;
  snapshotId?: string | null;
}): DesignPartnerMetricEvent {
  return recordDesignPartnerMetric({
    organisationId: input.organisationId,
    metricId: "decisions_logged",
    value: 1,
    label: "Executive decision recorded",
    snapshotId: input.snapshotId ?? null,
    decisionId: input.decisionId,
    actionId: null,
  });
}

export function recordActionCreated(input: {
  organisationId: string;
  actionId: string;
  decisionId?: string | null;
  snapshotId?: string | null;
}): DesignPartnerMetricEvent {
  return recordDesignPartnerMetric({
    organisationId: input.organisationId,
    metricId: "actions_created",
    value: 1,
    label: "Follow-through action created",
    snapshotId: input.snapshotId ?? null,
    decisionId: input.decisionId ?? null,
    actionId: input.actionId,
  });
}

export function recordWouldStartHere(input: {
  organisationId: string;
  would: boolean;
  snapshotId?: string | null;
  screen?: string;
}): DesignPartnerMetricEvent {
  return recordDesignPartnerMetric({
    organisationId: input.organisationId,
    metricId: "would_start_here",
    value: input.would ? 1 : 0,
    label: input.would
      ? "Would start day here before email or Teams"
      : "Would not start day here",
    snapshotId: input.snapshotId ?? null,
    decisionId: null,
    actionId: null,
    metadata: input.screen ? { screen: input.screen } : undefined,
  });
}
