/**
 * Memory episodes — reusable institutional experience units.
 */

import type { IntelligenceProfileId } from "@/profiles";
import type { MemoryEpisode } from "@/memory/framework/types";

const episodes = new Map<string, MemoryEpisode>();

export function resetMemoryEpisodes(): void {
  episodes.clear();
}

export function listEpisodes(tenantId: string): MemoryEpisode[] {
  return [...episodes.values()]
    .filter((e) => e.tenantId === tenantId)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

export function getEpisode(id: string): MemoryEpisode | undefined {
  return episodes.get(id);
}

export function recordMemoryEpisode(input: {
  tenantId: string;
  name: string;
  profileId: IntelligenceProfileId;
  businessQuestion: string;
  context: string;
  scenarioId?: string | null;
  evidence?: string[];
  decision?: string | null;
  actionsTaken?: string[];
  observedOutcome?: string | null;
  lessonsLearned?: string[];
  confidence?: number;
  participants?: string[];
  relatedBusinessEventIds?: string[];
  timestamp?: string;
}): MemoryEpisode {
  const asOf = input.timestamp ?? new Date().toISOString();
  const episode: MemoryEpisode = {
    id: `ep-${input.tenantId}-${episodes.size + 1}`,
    tenantId: input.tenantId,
    name: input.name,
    profileId: input.profileId,
    scenarioId: input.scenarioId ?? null,
    businessQuestion: input.businessQuestion,
    context: input.context,
    evidence: input.evidence ?? [],
    decision: input.decision ?? null,
    actionsTaken: input.actionsTaken ?? [],
    observedOutcome: input.observedOutcome ?? null,
    lessonsLearned: input.lessonsLearned ?? [],
    confidence: input.confidence ?? 60,
    participants: input.participants ?? [],
    relatedBusinessEventIds: input.relatedBusinessEventIds ?? [],
    timestamp: asOf,
    createdAt: asOf,
    updatedAt: asOf,
  };
  episodes.set(episode.id, episode);
  return episode;
}

export function updateMemoryEpisode(
  id: string,
  patch: Partial<
    Pick<
      MemoryEpisode,
      | "decision"
      | "actionsTaken"
      | "observedOutcome"
      | "lessonsLearned"
      | "evidence"
      | "confidence"
      | "participants"
    >
  >,
): MemoryEpisode | null {
  const existing = episodes.get(id);
  if (!existing) return null;
  const next: MemoryEpisode = {
    ...existing,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  episodes.set(id, next);
  return next;
}
