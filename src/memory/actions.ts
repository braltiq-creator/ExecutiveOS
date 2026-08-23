"use server";

import {
  recordMemoryEpisode,
  recordMemoryDecision,
  captureLesson,
  addTimelineEvent,
  evolvePlaybooksFromExperience,
  detectMemoryPatterns,
} from "@/memory";
import type { SignificantDecisionKind, TimelineEventKind } from "@/memory";
import type { IntelligenceProfileId } from "@/profiles";

export async function recordEpisodeAction(input: {
  tenantId: string;
  name: string;
  profileId: IntelligenceProfileId;
  businessQuestion: string;
  context: string;
  scenarioId?: string | null;
  decision?: string;
  lessonsLearned?: string[];
  participants?: string[];
}): Promise<{ ok: boolean; id?: string; message: string }> {
  const episode = recordMemoryEpisode(input);
  detectMemoryPatterns(input.tenantId);
  evolvePlaybooksFromExperience(input.tenantId);
  return { ok: true, id: episode.id, message: `Recorded episode ${episode.name}` };
}

export async function recordDecisionAction(input: {
  tenantId: string;
  kind: SignificantDecisionKind;
  title: string;
  profileId: IntelligenceProfileId;
  summary: string;
  decidedBy: string;
  scenarioId?: string | null;
  episodeId?: string | null;
  businessEvidence?: string[];
}): Promise<{ ok: boolean; id?: string; message: string }> {
  const decision = recordMemoryDecision(input);
  addTimelineEvent({
    tenantId: input.tenantId,
    kind: "executive_decision",
    title: decision.title,
    detail: decision.summary,
    relatedDecisionId: decision.id,
    relatedEpisodeId: decision.episodeId,
    importance: "high",
  });
  return { ok: true, id: decision.id, message: `Recorded decision ${decision.title}` };
}

export async function captureLessonAction(input: {
  tenantId: string;
  whatWorked?: string[];
  whatFailed?: string[];
  futureRecommendations?: string[];
  episodeId?: string | null;
  capturedBy?: string;
}): Promise<{ ok: boolean; id?: string; message: string }> {
  const lesson = captureLesson(input);
  evolvePlaybooksFromExperience(input.tenantId);
  return { ok: true, id: lesson.id, message: "Lesson captured" };
}

export async function addTimelineEventAction(input: {
  tenantId: string;
  kind: TimelineEventKind;
  title: string;
  detail: string;
}): Promise<{ ok: boolean; message: string }> {
  addTimelineEvent(input);
  return { ok: true, message: "Timeline event added" };
}
