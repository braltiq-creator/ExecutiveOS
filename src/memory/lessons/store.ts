/**
 * Lessons learned — searchable organisational knowledge.
 */

import type { LessonLearned } from "@/memory/framework/types";

const lessons = new Map<string, LessonLearned>();

export function resetMemoryLessons(): void {
  lessons.clear();
}

export function listLessons(tenantId: string): LessonLearned[] {
  return [...lessons.values()]
    .filter((l) => l.tenantId === tenantId)
    .sort((a, b) => b.capturedAt.localeCompare(a.capturedAt));
}

export function captureLesson(input: {
  tenantId: string;
  whatWorked?: string[];
  whatFailed?: string[];
  unexpectedOutcomes?: string[];
  futureRecommendations?: string[];
  episodeId?: string | null;
  decisionId?: string | null;
  capturedBy?: string;
  tags?: string[];
  asOf?: string;
}): LessonLearned {
  const lesson: LessonLearned = {
    id: `les-${input.tenantId}-${lessons.size + 1}`,
    tenantId: input.tenantId,
    episodeId: input.episodeId ?? null,
    decisionId: input.decisionId ?? null,
    whatWorked: input.whatWorked ?? [],
    whatFailed: input.whatFailed ?? [],
    unexpectedOutcomes: input.unexpectedOutcomes ?? [],
    futureRecommendations: input.futureRecommendations ?? [],
    capturedBy: input.capturedBy ?? "executive",
    capturedAt: input.asOf ?? new Date().toISOString(),
    tags: input.tags ?? [],
  };
  lessons.set(lesson.id, lesson);
  return lesson;
}

export function searchLessons(input: {
  tenantId: string;
  query: string;
}): LessonLearned[] {
  const q = input.query.toLowerCase();
  return listLessons(input.tenantId).filter((l) => {
    const hay = [
      ...l.whatWorked,
      ...l.whatFailed,
      ...l.unexpectedOutcomes,
      ...l.futureRecommendations,
      ...l.tags,
    ]
      .join(" ")
      .toLowerCase();
    return hay.includes(q) || q.split(/\s+/).some((w) => w.length > 2 && hay.includes(w));
  });
}
