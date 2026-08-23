import { deriveBehaviourSnapshot } from "@/intelligence/executive-memory/behaviour";
import type { ExecutiveMemoryStore } from "@/intelligence/executive-memory/store/memory-store";
import type {
  BehaviourComparison,
  BehaviourDimension,
  DriftReport,
  ExecutiveCommitment,
  ImprovementReport,
  MemoryEvent,
} from "@/intelligence/executive-memory/types";
import type { ExecutiveIntentProfile } from "@/intelligence/executive-intent/types";
import { clampScore } from "@/intelligence/executive-intelligence/lib/helpers";
import { BEHAVIOUR_DIMENSIONS } from "@/intelligence/executive-memory/behaviour";

/** Compare two windows of executive behaviour. */
export function compareBehaviour(input: {
  store: ExecutiveMemoryStore;
  executiveId: string;
  asOf: string;
  baselineFrom: string;
  baselineTo: string;
  currentFrom: string;
  currentTo: string;
}): BehaviourComparison {
  const from = deriveBehaviourSnapshot({
    store: input.store,
    executiveId: input.executiveId,
    asOf: input.baselineTo,
    from: input.baselineFrom,
    to: input.baselineTo,
  });
  const to = deriveBehaviourSnapshot({
    store: input.store,
    executiveId: input.executiveId,
    asOf: input.asOf,
    from: input.currentFrom,
    to: input.currentTo,
  });

  const deltas = Object.fromEntries(
    BEHAVIOUR_DIMENSIONS.map((dimension) => [
      dimension,
      to.dimensions[dimension] - from.dimensions[dimension],
    ]),
  ) as Record<BehaviourDimension, number>;

  const improving: BehaviourDimension[] = [];
  const deteriorating: BehaviourDimension[] = [];
  const stable: BehaviourDimension[] = [];

  for (const dimension of BEHAVIOUR_DIMENSIONS) {
    const delta = deltas[dimension];
    if (delta >= 8) improving.push(dimension);
    else if (delta <= -8) deteriorating.push(dimension);
    else stable.push(dimension);
  }

  const summaryParts: string[] = [];
  if (improving.length) {
    summaryParts.push(
      `Improving: ${improving.map(labelDimension).join(", ")}.`,
    );
  }
  if (deteriorating.length) {
    summaryParts.push(
      `Deteriorating: ${deteriorating.map(labelDimension).join(", ")}.`,
    );
  }
  if (summaryParts.length === 0) {
    summaryParts.push("Behaviour is broadly stable across tracked dimensions.");
  }

  return {
    from,
    to,
    deltas,
    improving,
    deteriorating,
    stable,
    summary: summaryParts.join(" "),
  };
}

/** Detect improvements / deteriorations from behaviour comparison. */
export function detectImprovement(input: {
  store: ExecutiveMemoryStore;
  executiveId: string;
  asOf: string;
  baselineFrom: string;
  baselineTo: string;
  currentFrom: string;
  currentTo: string;
}): ImprovementReport {
  const comparison = compareBehaviour(input);
  const events = input.store.listEvents({
    executiveId: input.executiveId,
    from: input.currentFrom,
    to: input.currentTo,
  });

  return {
    asOf: input.asOf,
    executiveId: input.executiveId,
    improving: comparison.improving.map((dimension) => ({
      dimension,
      delta: comparison.deltas[dimension],
      evidence: evidenceForDimension(dimension, events, "improvement"),
    })),
    deteriorating: comparison.deteriorating.map((dimension) => ({
      dimension,
      delta: comparison.deltas[dimension],
      evidence: evidenceForDimension(dimension, events, "deterioration"),
    })),
    summary: comparison.summary,
  };
}

/**
 * Compare executive intent against observed behaviour.
 * Produces strategic drift, leadership consistency, execution quality, attention drift.
 */
export function detectDrift(input: {
  store: ExecutiveMemoryStore;
  intent: ExecutiveIntentProfile;
  executiveId: string;
  asOf: string;
  from: string;
  to: string;
}): DriftReport {
  const events = input.store.listEvents({
    executiveId: input.executiveId,
    from: input.from,
    to: input.to,
  });
  const commitments = input.store
    .listCommitments(input.executiveId)
    .filter((commitment) => commitment.status === "open");

  const behaviour = deriveBehaviourSnapshot({
    store: input.store,
    executiveId: input.executiveId,
    asOf: input.asOf,
    from: input.from,
    to: input.to,
  });

  const attentionDrift = clampScore(
    100 - behaviour.dimensions.strategic_focus,
  );
  const leadershipConsistency = clampScore(
    (behaviour.dimensions.decision_velocity +
      behaviour.dimensions.delegation +
      (100 - attentionDrift)) /
      3,
  );
  const executionQuality = clampScore(
    (behaviour.dimensions.deep_work +
      behaviour.dimensions.meeting_load +
      behaviour.dimensions.approval_latency) /
      3,
  );

  const intentPressure = intentBehaviourGap(input.intent, events, commitments);
  const strategicDriftScore = clampScore(
    (attentionDrift + intentPressure + (100 - leadershipConsistency) * 0.4) / 2.2,
  );

  const repeatingPatterns = detectRepeatingPatterns(events);
  const evidenceEventIds = [
    ...behaviour.sourceEventIds,
    ...commitments.map((commitment) => commitment.sourceEventId),
    ...events.filter((event) => event.tags?.includes("recurrence")).map((e) => e.id),
  ];

  const reasoning = [
    `Strategic drift ${strategicDriftScore} from intent–behaviour gap and focus pressure.`,
    `Leadership consistency ${leadershipConsistency}; execution quality ${executionQuality}.`,
    commitments.length
      ? `${commitments.length} open commitment(s) remain on the ledger.`
      : "No open commitments on the ledger.",
    repeatingPatterns[0] ?? "No repeating patterns in the window.",
  ].join(" ");

  return {
    asOf: input.asOf,
    executiveId: input.executiveId,
    strategicDriftScore,
    leadershipConsistency,
    executionQuality,
    attentionDrift,
    openCommitments: commitments,
    repeatingPatterns,
    reasoning,
    evidenceEventIds: unique(evidenceEventIds),
  };
}

function intentBehaviourGap(
  intent: ExecutiveIntentProfile,
  events: MemoryEvent[],
  commitments: ExecutiveCommitment[],
): number {
  let gap = 0;
  const priorities = intent.strategicPriorities;

  const caresAboutMeetings = priorities.some((priority) =>
    /meeting|capacity|forum/i.test(priority.title),
  );
  if (caresAboutMeetings) {
    const meetingImprove = events.some((event) =>
      event.tags?.includes("meeting_load"),
    );
    gap += meetingImprove ? 8 : 22;
  }

  const caresAboutGrowth = priorities.some((priority) =>
    /arr|growth|enterprise/i.test(priority.title),
  );
  if (caresAboutGrowth) {
    const helixRecurrence = events.filter((event) =>
      event.tags?.includes("helix"),
    ).length;
    gap += Math.min(40, helixRecurrence * 12);
  }

  gap += Math.min(25, commitments.length * 10);
  return clampScore(gap);
}

function detectRepeatingPatterns(events: MemoryEvent[]): string[] {
  const byEntity = new Map<string, MemoryEvent[]>();
  for (const event of events) {
    if (event.kind !== "risk_raised" && !event.tags?.includes("recurrence")) {
      continue;
    }
    const key = event.entityId;
    const list = byEntity.get(key) ?? [];
    list.push(event);
    byEntity.set(key, list);
  }

  const patterns: string[] = [];
  for (const group of byEntity.values()) {
    if (group.length < 2) continue;
    const label = group[0].label.replace(/\s*—.*$/, "").replace(/\s+resurfaced.*$/i, "");
    patterns.push(
      `${label} has appeared ${group.length} times in the remembered window.`,
    );
  }
  return patterns;
}

function evidenceForDimension(
  dimension: BehaviourDimension,
  events: MemoryEvent[],
  tone: "improvement" | "deterioration",
): string {
  const tag =
    tone === "improvement"
      ? events.find(
          (event) =>
            event.tags?.includes(dimension) ||
            event.tags?.includes("improvement"),
        )
      : events.find(
          (event) =>
            event.tags?.includes(dimension) ||
            event.tags?.includes("deterioration") ||
            event.tags?.includes("drift"),
        );
  if (tag) return tag.detail;
  return `No single event sentence for ${labelDimension(dimension)}; score delta is derived from the window.`;
}

function labelDimension(dimension: BehaviourDimension): string {
  return dimension.replaceAll("_", " ");
}

function unique(ids: string[]): string[] {
  return [...new Set(ids)];
}
