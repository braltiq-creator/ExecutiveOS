/**
 * Organisational Memory administration dashboard.
 */

import { detectMemoryPatterns } from "@/memory/patterns";
import { evolvePlaybooksFromExperience, listPlaybooks } from "@/memory/playbooks";
import { buildOrganisationalTimeline } from "@/memory/timeline";
import { listMemoryDecisions } from "@/memory/decision-history";
import { listMemoryPatterns } from "@/memory/patterns";
import { listLessons } from "@/memory/lessons";
import { listRecentRecalls } from "@/memory/recall";
import {
  deriveMemoryInsights,
  measureMemoryGrowth,
} from "@/memory/insights";
import type { MemoryDashboard } from "@/memory/framework/types";

export function buildMemoryDashboard(input: {
  tenantId: string;
  asOf?: string;
}): MemoryDashboard {
  const asOf = input.asOf ?? new Date().toISOString();
  detectMemoryPatterns(input.tenantId);
  evolvePlaybooksFromExperience(input.tenantId, asOf);

  return {
    asOf,
    tenantId: input.tenantId,
    growth: measureMemoryGrowth(input.tenantId, asOf),
    timeline: buildOrganisationalTimeline(input.tenantId).slice(0, 20),
    decisions: listMemoryDecisions(input.tenantId).slice(0, 15),
    patterns: listMemoryPatterns(input.tenantId),
    lessons: listLessons(input.tenantId).slice(0, 15),
    playbooks: listPlaybooks(input.tenantId),
    insights: deriveMemoryInsights(input.tenantId, asOf),
    recentRecalls: listRecentRecalls(input.tenantId).slice(0, 5),
  };
}
