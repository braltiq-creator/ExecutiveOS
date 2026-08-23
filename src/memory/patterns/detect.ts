/**
 * Pattern recognition from recurring episodes / decisions.
 */

import type {
  MemoryPattern,
  MemoryPatternKind,
} from "@/memory/framework/types";
import { listEpisodes } from "@/memory/episodes";
import { listMemoryDecisions } from "@/memory/decision-history";
import { textSimilarity } from "@/memory/similarity";

const patterns = new Map<string, MemoryPattern>();

const KIND_HINTS: Array<{ kind: MemoryPatternKind; keywords: string[] }> = [
  {
    kind: "forecast_confidence_decline",
    keywords: ["forecast", "confidence", "pipeline"],
  },
  {
    kind: "capacity_shortage",
    keywords: ["capacity", "shortage", "overloaded", "utilisation"],
  },
  {
    kind: "customer_churn_signal",
    keywords: ["churn", "retention", "customer risk", "account weakening"],
  },
  {
    kind: "repeated_safety_risk",
    keywords: ["safety", "hazard", "incident"],
  },
  {
    kind: "pipeline_deterioration",
    keywords: ["pipeline", "deal", "opportunity"],
  },
  {
    kind: "operational_bottleneck",
    keywords: ["bottleneck", "constraint", "backlog"],
  },
  {
    kind: "recurring_executive_intervention",
    keywords: ["escalat", "intervention", "executive"],
  },
];

export function resetMemoryPatterns(): void {
  patterns.clear();
}

export function listMemoryPatterns(tenantId: string): MemoryPattern[] {
  return [...patterns.values()]
    .filter((p) => p.tenantId === tenantId)
    .sort((a, b) => b.occurrenceCount - a.occurrenceCount);
}

export function detectMemoryPatterns(tenantId: string): MemoryPattern[] {
  const episodes = listEpisodes(tenantId);
  const decisions = listMemoryDecisions(tenantId);
  const detected: MemoryPattern[] = [];

  for (const hint of KIND_HINTS) {
    const matchedEpisodes = episodes.filter((ep) => {
      const hay = `${ep.name} ${ep.businessQuestion} ${ep.context} ${ep.observedOutcome ?? ""}`.toLowerCase();
      return hint.keywords.some((k) => hay.includes(k));
    });
    const matchedDecisions = decisions.filter((d) => {
      const hay = `${d.title} ${d.summary}`.toLowerCase();
      return hint.keywords.some((k) => hay.includes(k));
    });
    const count = matchedEpisodes.length + matchedDecisions.length;
    if (count < 2) continue;

    const episodeIds = matchedEpisodes.map((e) => e.id);
    const timestamps = [
      ...matchedEpisodes.map((e) => e.timestamp),
      ...matchedDecisions.map((d) => d.decidedAt),
    ].sort();
    const pairwise =
      matchedEpisodes.length >= 2
        ? textSimilarity(
            matchedEpisodes[0]!.context,
            matchedEpisodes[1]!.context,
          )
        : 55;

    const pattern: MemoryPattern = {
      id: `pat-${tenantId}-${hint.kind}`,
      tenantId,
      kind: hint.kind,
      name: hint.kind.replace(/_/g, " "),
      description: `Recurring ${hint.kind.replace(/_/g, " ")} across ${count} memory signal(s).`,
      occurrenceCount: count,
      episodeIds,
      firstSeenAt: timestamps[0] ?? new Date().toISOString(),
      lastSeenAt: timestamps[timestamps.length - 1] ?? new Date().toISOString(),
      confidence: Math.min(95, 40 + count * 12 + Math.round(pairwise * 0.2)),
      reusableGuidance: `When ${hint.keywords[0]} signals recur, recall prior episodes and apply confirmed lessons before escalating.`,
    };
    patterns.set(pattern.id, pattern);
    detected.push(pattern);
  }

  return detected.sort((a, b) => b.occurrenceCount - a.occurrenceCount);
}
