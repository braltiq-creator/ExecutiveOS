import type { ExecutiveMemoryStore } from "@/intelligence/executive-memory/store/memory-store";
import type {
  BehaviourDimension,
  BehaviourSnapshot,
  MemoryEvent,
} from "@/intelligence/executive-memory/types";
import { clampScore } from "@/intelligence/executive-intelligence/lib/helpers";

const DIMENSIONS: BehaviourDimension[] = [
  "deep_work",
  "meeting_load",
  "decision_velocity",
  "delegation",
  "approval_latency",
  "interruptions",
  "strategic_focus",
];

/**
 * Derive a behaviour snapshot from memory events in a window.
 * Higher scores = healthier executive behaviour for that dimension.
 * Deterministic. Traceable via sourceEventIds.
 */
export function deriveBehaviourSnapshot(input: {
  store: ExecutiveMemoryStore;
  executiveId: string;
  asOf: string;
  from: string;
  to: string;
}): BehaviourSnapshot {
  const events = input.store.listEvents({
    executiveId: input.executiveId,
    from: input.from,
    to: input.to,
  });

  const dimensions = Object.fromEntries(
    DIMENSIONS.map((dimension) => [
      dimension,
      scoreDimension(dimension, events),
    ]),
  ) as Record<BehaviourDimension, number>;

  const sourceEventIds = events
    .filter((event) => contributesToBehaviour(event))
    .map((event) => event.id);

  return {
    asOf: input.asOf,
    executiveId: input.executiveId,
    dimensions,
    reasoning: behaviourReasoning(dimensions, events),
    sourceEventIds,
  };
}

function scoreDimension(
  dimension: BehaviourDimension,
  events: MemoryEvent[],
): number {
  switch (dimension) {
    case "deep_work": {
      const protectedCount = count(events, "deep_work_protected");
      const brokenCount = count(events, "deep_work_broken");
      return clampScore(55 + protectedCount * 18 - brokenCount * 22);
    }
    case "meeting_load": {
      const meetingEvents = events.filter(
        (event) =>
          (event.kind === "meeting_held" ||
            event.tags?.includes("meeting_load")) &&
          typeof event.metrics?.meetingHours === "number",
      );
      if (meetingEvents.length === 0) return 50;
      // Newest-first listing — prefer latest measured load
      const latest = meetingEvents[0];
      const hours = latest.metrics!.meetingHours;
      // Lower meeting hours → higher health score
      const base = 100 - hours * 4;
      const boost = latest.tags?.includes("improvement") ? 8 : 0;
      return clampScore(base + boost);
    }
    case "decision_velocity": {
      const latency = latestMetric(events, "latencyDays", "approval_latency");
      if (latency == null) return 55;
      // Faster binds → higher score
      return clampScore(100 - latency * 18);
    }
    case "delegation": {
      const delegated = count(events, "delegation_made");
      return clampScore(45 + delegated * 20);
    }
    case "approval_latency": {
      const latency = latestMetric(events, "latencyDays", "approval_latency");
      const prior = latestMetric(events, "priorLatencyDays", "approval_latency");
      if (latency == null) return 55;
      let score = 100 - latency * 16;
      if (prior != null && latency > prior) score -= 10;
      if (prior != null && latency < prior) score += 10;
      return clampScore(score);
    }
    case "interruptions": {
      const interruptEvents = events.filter(
        (event) => event.kind === "interruption",
      );
      if (interruptEvents.length === 0) return 70;
      const total = interruptEvents.reduce(
        (sum, event) => sum + (event.metrics?.interruptions ?? 1),
        0,
      );
      return clampScore(80 - total * 8);
    }
    case "strategic_focus": {
      const drift = latestMetric(events, "focusDrift", "focus_shift");
      const focusShifts = count(events, "focus_shift");
      if (drift == null && focusShifts === 0) return 65;
      return clampScore(70 - (drift ?? focusShifts * 12));
    }
    default:
      return 50;
  }
}

function count(events: MemoryEvent[], kind: MemoryEvent["kind"]): number {
  return events.filter((event) => event.kind === kind).length;
}

function latestMetric(
  events: MemoryEvent[],
  key: string,
  kind: MemoryEvent["kind"],
): number | undefined {
  const match = events.find(
    (event) => event.kind === kind && typeof event.metrics?.[key] === "number",
  );
  return match?.metrics?.[key];
}

function contributesToBehaviour(event: MemoryEvent): boolean {
  return (
    event.entityKind === "behaviour" ||
    event.kind === "delegation_made" ||
    event.kind === "meeting_held" ||
    event.kind === "deep_work_protected" ||
    event.kind === "deep_work_broken" ||
    event.kind === "approval_latency" ||
    event.kind === "focus_shift" ||
    event.kind === "interruption"
  );
}

function behaviourReasoning(
  dimensions: Record<BehaviourDimension, number>,
  events: MemoryEvent[],
): string {
  const ranked = DIMENSIONS.map((dimension) => ({
    dimension,
    score: dimensions[dimension],
  })).sort((a, b) => a.score - b.score);
  const weakest = ranked[0];
  const strongest = ranked[ranked.length - 1];
  return [
    `Behaviour derived from ${events.filter(contributesToBehaviour).length} traceable events.`,
    `Strongest: ${strongest.dimension.replaceAll("_", " ")} (${strongest.score}).`,
    `Weakest: ${weakest.dimension.replaceAll("_", " ")} (${weakest.score}).`,
  ].join(" ");
}

export { DIMENSIONS as BEHAVIOUR_DIMENSIONS };
