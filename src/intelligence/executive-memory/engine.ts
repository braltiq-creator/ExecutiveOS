import {
  compareBehaviour,
  detectDrift,
  detectImprovement,
} from "@/intelligence/executive-memory/drift";
import type { ExecutiveMemoryStore } from "@/intelligence/executive-memory/store/memory-store";
import type {
  BehaviourPrediction,
  HistoryRecommendation,
  HistorySummary,
  MemoryEvent,
  MemoryInsight,
  MemoryQuery,
} from "@/intelligence/executive-memory/types";
import type { ExecutiveIntentProfile } from "@/intelligence/executive-intent/types";
import { clampScore } from "@/intelligence/executive-intelligence/lib/helpers";

const DEFAULT_EXEC = "exec-alex";
const AS_OF = "2026-07-20T06:15:00+10:00";

/** Append a memory event — never invent; caller supplies traceable source. */
export function remember(
  store: ExecutiveMemoryStore,
  event: MemoryEvent,
): MemoryEvent {
  store.append(event);
  return event;
}

/** Recall events matching a query, newest first. */
export function recall(
  store: ExecutiveMemoryStore,
  query: MemoryQuery = {},
): MemoryEvent[] {
  return store.listEvents(query);
}

/** Entity timeline — every remembered moment for one entity. */
export function entityTimeline(
  store: ExecutiveMemoryStore,
  entityId: string,
  limit = 50,
): MemoryEvent[] {
  return store.listEvents({ entityId, limit });
}

/** Answer the memory questions: what changed, repeats, commitments, etc. */
export function summariseHistory(input: {
  store: ExecutiveMemoryStore;
  executiveId?: string;
  from: string;
  to: string;
  intent?: ExecutiveIntentProfile;
}): HistorySummary {
  const executiveId = input.executiveId ?? DEFAULT_EXEC;
  const events = recall(input.store, {
    executiveId,
    from: input.from,
    to: input.to,
  });
  const commitments = input.store
    .listCommitments(executiveId)
    .filter((commitment) => commitment.status === "open");

  const improvement = detectImprovement({
    store: input.store,
    executiveId,
    asOf: input.to,
    baselineFrom: shiftDays(input.from, -21),
    baselineTo: input.from,
    currentFrom: input.from,
    currentTo: input.to,
  });

  const drift = input.intent
    ? detectDrift({
        store: input.store,
        intent: input.intent,
        executiveId,
        asOf: input.to,
        from: input.from,
        to: input.to,
      })
    : null;

  const succeeded = events
    .filter((event) => event.kind === "recommendation_succeeded")
    .map((event) => event.label);
  const failed = events
    .filter((event) => event.kind === "recommendation_failed")
    .map((event) => event.label);

  const whatChanged = events
    .filter((event) =>
      ["outcome_moved", "risk_raised", "decision_recorded", "focus_shift"].includes(
        event.kind,
      ),
    )
    .slice(0, 5)
    .map((event) => event.detail);

  const whatKeepsHappening =
    drift?.repeatingPatterns ??
    repeatingFromEvents(events);

  const evidenceEventIds = unique([
    ...events.map((event) => event.id),
    ...(drift?.evidenceEventIds ?? []),
    ...improvement.improving.flatMap(() => []),
  ]);

  const narrative = [
    whatKeepsHappening[0],
    improvement.improving[0]
      ? `${labelDim(improvement.improving[0].dimension)} has improved since the prior window.`
      : null,
    commitments[0]
      ? `Open commitment remains: ${commitments[0].label}.`
      : null,
    succeeded[0]
      ? `Historical success on file: ${succeeded[0]}.`
      : null,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    executiveId,
    from: input.from,
    to: input.to,
    whatChanged:
      whatChanged.length > 0
        ? whatChanged
        : ["No material change events in the window."],
    whatKeepsHappening:
      whatKeepsHappening.length > 0
        ? whatKeepsHappening
        : ["No repeating patterns in the window."],
    openCommitments: commitments.map((commitment) => commitment.label),
    improving: improvement.improving.map(
      (item) =>
        `${labelDim(item.dimension)} (+${item.delta}): ${item.evidence}`,
    ),
    deteriorating: improvement.deteriorating.map(
      (item) =>
        `${labelDim(item.dimension)} (${item.delta}): ${item.evidence}`,
    ),
    repeatingPatterns: whatKeepsHappening,
    recommendationOutcomes: { succeeded, failed },
    narrative:
      narrative ||
      "Memory window holds events, but no strong journey sentence is warranted.",
    evidenceEventIds,
  };
}

/** Predict likely near-term behaviour from repeating history — never invents. */
export function predictBehaviour(input: {
  store: ExecutiveMemoryStore;
  executiveId?: string;
  asOf?: string;
  horizonDays?: number;
  intent?: ExecutiveIntentProfile;
}): BehaviourPrediction {
  const executiveId = input.executiveId ?? DEFAULT_EXEC;
  const asOf = input.asOf ?? AS_OF;
  const horizonDays = input.horizonDays ?? 14;
  const from = shiftDays(asOf, -42);
  const events = recall(input.store, { executiveId, from, to: asOf });

  const drift = input.intent
    ? detectDrift({
        store: input.store,
        intent: input.intent,
        executiveId,
        asOf,
        from,
        to: asOf,
      })
    : null;

  const likelyPatterns = [
    ...(drift?.repeatingPatterns ?? repeatingFromEvents(events)),
  ];

  if (
    events.some(
      (event) =>
        event.kind === "approval_latency" &&
        (event.metrics?.latencyDays ?? 0) >
          (event.metrics?.priorLatencyDays ?? 0),
    )
  ) {
    likelyPatterns.push(
      "Approval latency is likely to remain elevated without a bind cadence reset.",
    );
  }

  const openCommitments = input.store
    .listCommitments(executiveId)
    .filter((commitment) => commitment.status === "open");
  if (openCommitments.length > 0) {
    likelyPatterns.push(
      `${openCommitments.length} open commitment(s) will continue to pressure attention until closed.`,
    );
  }

  const evidenceEventIds = unique([
    ...(drift?.evidenceEventIds ?? []),
    ...events.slice(0, 8).map((event) => event.id),
  ]);

  const riskOfDrift = drift?.strategicDriftScore ?? 40;
  const confidence = clampScore(
    35 + Math.min(40, evidenceEventIds.length * 4) - (likelyPatterns.length === 0 ? 20 : 0),
  );

  return {
    executiveId,
    horizonDays,
    likelyPatterns:
      likelyPatterns.length > 0
        ? likelyPatterns.slice(0, 5)
        : ["Insufficient repeating history to predict behaviour."],
    riskOfDrift,
    confidence,
    reasoning: [
      `Prediction horizon ${horizonDays} days from ${evidenceEventIds.length} evidence events.`,
      "Patterns only surface when the store already holds them — nothing is invented.",
    ].join(" "),
    evidenceEventIds,
  };
}

/**
 * Recommendations grounded only in successful/failed history.
 * If no historical analogue exists, returns empty — never invents.
 */
export function recommendBasedOnHistory(input: {
  store: ExecutiveMemoryStore;
  executiveId?: string;
  relatedEntityIds?: string[];
}): HistoryRecommendation[] {
  const executiveId = input.executiveId ?? DEFAULT_EXEC;
  const related = new Set(input.relatedEntityIds ?? []);
  const events = recall(input.store, { executiveId });

  const successes = events.filter(
    (event) => event.kind === "recommendation_succeeded",
  );
  const failures = events.filter(
    (event) => event.kind === "recommendation_failed",
  );

  const recommendations: HistoryRecommendation[] = [];

  for (const success of successes) {
    const overlap =
      related.size === 0 ||
      (success.relatedEntityIds ?? []).some((id) => related.has(id)) ||
      related.has(success.entityId);
    if (!overlap && related.size > 0) continue;

    recommendations.push({
      id: `hist-rec-${success.id}`,
      act: "approve",
      title: "Reuse a previously successful path",
      reason: `This recommendation aligns with a previous successful decision: ${success.detail}`,
      basedOnEventIds: [success.id],
      confidence: clampScore(70 + (success.metrics?.outcomeDelta ?? 0)),
      relatedEntityIds: success.relatedEntityIds ?? [],
    });
  }

  for (const failure of failures) {
    const overlap =
      related.size === 0 ||
      (failure.relatedEntityIds ?? []).some((id) => related.has(id)) ||
      related.has(failure.entityId);
    if (!overlap && related.size > 0) continue;

    recommendations.push({
      id: `hist-rec-${failure.id}`,
      act: "investigate",
      title: "Avoid a previously failed path",
      reason: `History warns against repeating this path: ${failure.detail}`,
      basedOnEventIds: [failure.id],
      confidence: clampScore(65 + Math.abs(failure.metrics?.outcomeDelta ?? 0)),
      relatedEntityIds: failure.relatedEntityIds ?? [],
    });
  }

  return recommendations.sort((a, b) => b.confidence - a.confidence);
}

/** Traceable narrative insights — only when evidence exists. */
export function deriveMemoryInsights(input: {
  store: ExecutiveMemoryStore;
  executiveId?: string;
  asOf?: string;
  from?: string;
  to?: string;
  intent?: ExecutiveIntentProfile;
}): MemoryInsight[] {
  const executiveId = input.executiveId ?? DEFAULT_EXEC;
  const asOf = input.asOf ?? AS_OF;
  const from = input.from ?? shiftDays(asOf, -42);
  const to = input.to ?? asOf;
  const summary = summariseHistory({
    store: input.store,
    executiveId,
    from,
    to,
    intent: input.intent,
  });
  const comparison = compareBehaviour({
    store: input.store,
    executiveId,
    asOf,
    baselineFrom: shiftDays(from, -28),
    baselineTo: from,
    currentFrom: from,
    currentTo: to,
  });
  const events = recall(input.store, { executiveId, from, to });
  const insights: MemoryInsight[] = [];

  const helixEvents = events.filter((event) => event.tags?.includes("helix"));
  if (helixEvents.length >= 3) {
    insights.push({
      id: "insight-helix-recurrence",
      sentence: `This issue has appeared ${helixEvents.length} times in the last six weeks.`,
      evidenceEventIds: helixEvents.map((event) => event.id),
      relatedEntityIds: unique(
        helixEvents.flatMap((event) => [
          event.entityId,
          ...(event.relatedEntityIds ?? []),
        ]),
      ),
      kind: "recurrence",
    });
  }

  const meetingCommitment = input.store
    .listCommitments(executiveId)
    .find((commitment) => commitment.id === "commit-reduce-meetings");
  if (
    meetingCommitment &&
    comparison.improving.includes("meeting_load")
  ) {
    const meetingEvents = events.filter((event) =>
      event.tags?.includes("meeting_load"),
    );
    insights.push({
      id: "insight-meeting-improvement",
      sentence:
        "Meeting load has improved since your commitment last month.",
      evidenceEventIds: unique([
        meetingCommitment.sourceEventId,
        ...meetingEvents.map((event) => event.id),
      ]),
      relatedEntityIds: [
        meetingCommitment.entityId,
        "outcome-efficiency",
      ],
      kind: "improvement",
    });
  }

  const success = events.find(
    (event) => event.kind === "recommendation_succeeded",
  );
  if (success) {
    insights.push({
      id: "insight-rec-success",
      sentence:
        "This recommendation aligns with a previous successful decision.",
      evidenceEventIds: [success.id],
      relatedEntityIds: success.relatedEntityIds ?? [],
      kind: "recommendation_outcome",
    });
  }

  for (const open of summary.openCommitments.slice(0, 2)) {
    const commitment = input.store
      .listCommitments(executiveId)
      .find((item) => item.label === open);
    if (!commitment) continue;
    insights.push({
      id: `insight-open-${commitment.id}`,
      sentence: `Open commitment remains: ${commitment.label}.`,
      evidenceEventIds: [commitment.sourceEventId],
      relatedEntityIds: [commitment.entityId],
      kind: "commitment",
    });
  }

  if (
    comparison.deteriorating.includes("decision_velocity") ||
    comparison.deteriorating.includes("approval_latency")
  ) {
    const latency = events.find((event) => event.kind === "approval_latency");
    if (latency) {
      insights.push({
        id: "insight-latency-deterioration",
        sentence: latency.detail,
        evidenceEventIds: [latency.id],
        relatedEntityIds: [latency.entityId],
        kind: "deterioration",
      });
    }
  }

  return insights;
}

function repeatingFromEvents(events: MemoryEvent[]): string[] {
  const byEntity = new Map<string, MemoryEvent[]>();
  for (const event of events) {
    if (!event.tags?.includes("recurrence") && event.kind !== "risk_raised") {
      continue;
    }
    const list = byEntity.get(event.entityId) ?? [];
    list.push(event);
    byEntity.set(event.entityId, list);
  }
  const patterns: string[] = [];
  for (const group of byEntity.values()) {
    if (group.length < 2) continue;
    patterns.push(
      `${group[0].label.split("—")[0].trim()} has appeared ${group.length} times in the remembered window.`,
    );
  }
  return patterns;
}

function shiftDays(iso: string, days: number): string {
  const date = new Date(iso);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}

function labelDim(dimension: string): string {
  return dimension.replaceAll("_", " ");
}

function unique(ids: string[]): string[] {
  return [...new Set(ids)];
}

export { compareBehaviour, detectDrift, detectImprovement };
