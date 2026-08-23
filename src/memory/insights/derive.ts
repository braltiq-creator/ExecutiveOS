/**
 * Memory insights for administration and growth metrics.
 */

import { listEpisodes } from "@/memory/episodes";
import { listMemoryDecisions } from "@/memory/decision-history";
import { listMemoryPatterns, detectMemoryPatterns } from "@/memory/patterns";
import { listLessons } from "@/memory/lessons";
import { listPlaybooks } from "@/memory/playbooks";
import { buildOrganisationalTimeline } from "@/memory/timeline";
import { listRecentRecalls } from "@/memory/recall";
import type {
  MemoryGrowthMetrics,
  MemoryInsight,
} from "@/memory/framework/types";

export function deriveMemoryInsights(
  tenantId: string,
  asOf = new Date().toISOString(),
): MemoryInsight[] {
  detectMemoryPatterns(tenantId);
  const insights: MemoryInsight[] = [];

  for (const pattern of listMemoryPatterns(tenantId).slice(0, 5)) {
    insights.push({
      id: `ins-pat-${pattern.id}`,
      tenantId,
      title: `Pattern: ${pattern.name}`,
      detail: pattern.reusableGuidance,
      kind: "pattern",
      confidence: pattern.confidence,
      asOf,
    });
  }

  for (const lesson of listLessons(tenantId).slice(0, 3)) {
    insights.push({
      id: `ins-les-${lesson.id}`,
      tenantId,
      title: "Lesson captured",
      detail: [
        ...lesson.whatWorked.slice(0, 1).map((w) => `Worked: ${w}`),
        ...lesson.futureRecommendations.slice(0, 1).map((r) => `Next: ${r}`),
      ].join(" · "),
      kind: "lesson",
      confidence: 70,
      asOf,
    });
  }

  for (const pb of listPlaybooks(tenantId).slice(0, 3)) {
    insights.push({
      id: `ins-pb-${pb.id}`,
      tenantId,
      title: pb.title,
      detail: pb.summary,
      kind: "playbook",
      confidence: pb.confidence,
      asOf,
    });
  }

  const timeline = buildOrganisationalTimeline(tenantId);
  if (timeline[0]) {
    insights.push({
      id: `ins-tl-${timeline[0].id}`,
      tenantId,
      title: `Recent: ${timeline[0].title}`,
      detail: timeline[0].detail,
      kind: "timeline",
      confidence: 65,
      asOf,
    });
  }

  return insights;
}

export function measureMemoryGrowth(
  tenantId: string,
  asOf = new Date().toISOString(),
): MemoryGrowthMetrics {
  detectMemoryPatterns(tenantId);
  const recalls = listRecentRecalls(tenantId);
  const recallQuality =
    recalls.length === 0
      ? 0
      : Math.round(
          recalls.reduce((s, r) => s + r.overallSimilarityConfidence, 0) /
            recalls.length,
        );

  const episodeCount = listEpisodes(tenantId).length;
  const decisionCount = listMemoryDecisions(tenantId).length;
  const patternCount = listMemoryPatterns(tenantId).length;
  const lessonCount = listLessons(tenantId).length;
  const playbookCount = listPlaybooks(tenantId).length;
  const timelineEventCount = buildOrganisationalTimeline(tenantId).length;

  return {
    tenantId,
    asOf,
    episodeCount,
    decisionCount,
    patternCount,
    lessonCount,
    playbookCount,
    timelineEventCount,
    recallQuality,
    explanation: `Memory growth: ${episodeCount} episodes, ${decisionCount} decisions, ${patternCount} patterns, ${lessonCount} lessons, recall quality ${recallQuality}%.`,
  };
}
