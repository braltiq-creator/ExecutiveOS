/**
 * Organisational executive timeline.
 */

import type {
  OrganisationalTimelineEvent,
  TimelineEventKind,
} from "@/memory/framework/types";
import { listEpisodes } from "@/memory/episodes";
import { listMemoryDecisions } from "@/memory/decision-history";

const events = new Map<string, OrganisationalTimelineEvent>();

export function resetMemoryTimeline(): void {
  events.clear();
}

export function listTimelineEvents(
  tenantId: string,
): OrganisationalTimelineEvent[] {
  return [...events.values()]
    .filter((e) => e.tenantId === tenantId)
    .sort((a, b) => b.at.localeCompare(a.at));
}

export function addTimelineEvent(input: {
  tenantId: string;
  kind: TimelineEventKind;
  title: string;
  detail: string;
  at?: string;
  relatedEpisodeId?: string | null;
  relatedDecisionId?: string | null;
  importance?: OrganisationalTimelineEvent["importance"];
}): OrganisationalTimelineEvent {
  const event: OrganisationalTimelineEvent = {
    id: `tl-${input.tenantId}-${events.size + 1}`,
    tenantId: input.tenantId,
    kind: input.kind,
    title: input.title,
    detail: input.detail,
    at: input.at ?? new Date().toISOString(),
    relatedEpisodeId: input.relatedEpisodeId ?? null,
    relatedDecisionId: input.relatedDecisionId ?? null,
    importance: input.importance ?? "moderate",
  };
  events.set(event.id, event);
  return event;
}

/** Rebuild timeline projection from episodes + decisions + explicit events. */
export function buildOrganisationalTimeline(
  tenantId: string,
): OrganisationalTimelineEvent[] {
  const explicit = listTimelineEvents(tenantId);
  const fromEpisodes = listEpisodes(tenantId).map(
    (ep): OrganisationalTimelineEvent => ({
      id: `tl-ep-${ep.id}`,
      tenantId,
      kind: "memory_episode",
      title: ep.name,
      detail: ep.context,
      at: ep.timestamp,
      relatedEpisodeId: ep.id,
      relatedDecisionId: null,
      importance: ep.confidence >= 75 ? "high" : "moderate",
    }),
  );
  const fromDecisions = listMemoryDecisions(tenantId).map(
    (d): OrganisationalTimelineEvent => ({
      id: `tl-dec-${d.id}`,
      tenantId,
      kind: "executive_decision",
      title: d.title,
      detail: d.summary,
      at: d.decidedAt,
      relatedEpisodeId: d.episodeId,
      relatedDecisionId: d.id,
      importance: "high",
    }),
  );

  const merged = new Map<string, OrganisationalTimelineEvent>();
  for (const e of [...explicit, ...fromEpisodes, ...fromDecisions]) {
    merged.set(e.id, e);
  }
  return [...merged.values()].sort((a, b) => b.at.localeCompare(a.at));
}
