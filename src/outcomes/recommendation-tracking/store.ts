/**
 * Recommendation lifecycle tracking with timestamps and evidence.
 */

import type { IntelligenceProfileId } from "@/profiles";
import type {
  RecommendationLifecycleStatus,
  RecommendationTrack,
} from "@/outcomes/framework/types";

const tracks = new Map<string, RecommendationTrack>();

const LIFECYCLE: RecommendationLifecycleStatus[] = [
  "generated",
  "viewed",
  "accepted",
  "deferred",
  "dismissed",
  "implemented",
  "observed",
  "confirmed",
  "archived",
];

export function resetRecommendationTracks(): void {
  tracks.clear();
}

export function listRecommendationTracks(
  tenantId: string,
): RecommendationTrack[] {
  return [...tracks.values()]
    .filter((t) => t.tenantId === tenantId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getRecommendationTrack(
  id: string,
): RecommendationTrack | undefined {
  return tracks.get(id);
}

export function trackRecommendation(input: {
  tenantId: string;
  profileId: IntelligenceProfileId;
  title: string;
  businessQuestion: string;
  scenarioId?: string | null;
  evidence?: string[];
  asOf?: string;
  id?: string;
}): RecommendationTrack {
  const asOf = input.asOf ?? new Date().toISOString();
  const id = input.id ?? `rec-${input.tenantId}-${tracks.size + 1}`;
  const existing = tracks.get(id);
  if (existing) return existing;

  const track: RecommendationTrack = {
    id,
    tenantId: input.tenantId,
    profileId: input.profileId,
    scenarioId: input.scenarioId ?? null,
    title: input.title,
    businessQuestion: input.businessQuestion,
    status: "generated",
    evidence: input.evidence ?? [],
    createdAt: asOf,
    updatedAt: asOf,
    timestamps: { generated: asOf },
    notes: [],
  };
  tracks.set(id, track);
  return track;
}

export function advanceRecommendation(input: {
  id: string;
  status: RecommendationLifecycleStatus;
  evidence?: string[];
  note?: string;
  asOf?: string;
}): RecommendationTrack | null {
  const existing = tracks.get(input.id);
  if (!existing) return null;
  if (!LIFECYCLE.includes(input.status)) return existing;

  const asOf = input.asOf ?? new Date().toISOString();
  const timestamps = { ...existing.timestamps };
  if (!timestamps[input.status]) timestamps[input.status] = asOf;

  const next: RecommendationTrack = {
    ...existing,
    status: input.status,
    evidence: input.evidence
      ? [...existing.evidence, ...input.evidence].slice(-20)
      : existing.evidence,
    updatedAt: asOf,
    timestamps,
    notes: input.note
      ? [...existing.notes, `${asOf}: ${input.note}`].slice(-30)
      : existing.notes,
  };
  tracks.set(next.id, next);
  return next;
}

export function countRecommendationsByStatus(
  tenantId: string,
): Record<RecommendationLifecycleStatus, number> {
  const counts = Object.fromEntries(
    LIFECYCLE.map((s) => [s, 0]),
  ) as Record<RecommendationLifecycleStatus, number>;
  for (const track of listRecommendationTracks(tenantId)) {
    counts[track.status] += 1;
  }
  return counts;
}

export { LIFECYCLE as RECOMMENDATION_LIFECYCLE };
