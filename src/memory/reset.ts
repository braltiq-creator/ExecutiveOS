/**
 * Reset all Organisational Memory in-memory stores (tests).
 */

import { resetMemoryEpisodes } from "@/memory/episodes";
import { resetMemoryDecisions } from "@/memory/decision-history";
import { resetMemoryTimeline } from "@/memory/timeline";
import { resetMemoryPatterns } from "@/memory/patterns";
import { resetMemoryLessons } from "@/memory/lessons";
import { resetMemoryPlaybooks } from "@/memory/playbooks";
import { resetMemoryRecallLog } from "@/memory/recall";
import { resetMemoryGovernance } from "@/memory/governance";

export function resetOrganisationalMemory(): void {
  resetMemoryEpisodes();
  resetMemoryDecisions();
  resetMemoryTimeline();
  resetMemoryPatterns();
  resetMemoryLessons();
  resetMemoryPlaybooks();
  resetMemoryRecallLog();
  resetMemoryGovernance();
}
