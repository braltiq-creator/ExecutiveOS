/**
 * Executive Organisational Memory Engine
 *
 * Preserves institutional experience — episodes, decisions, patterns, lessons,
 * and living playbooks — without changing Core architecture.
 * Distinct from src/lib/memory and src/intelligence/executive-memory.
 */

export type * from "@/memory/framework/types";
export {
  assertMemoryPayload,
  anonymiseMemoryTelemetry,
  attachMemoryRecallToTodayActions,
} from "@/memory/framework";

export {
  resetMemoryEpisodes,
  listEpisodes,
  getEpisode,
  recordMemoryEpisode,
  updateMemoryEpisode,
} from "@/memory/episodes";

export {
  resetMemoryDecisions,
  listMemoryDecisions,
  getMemoryDecision,
  recordMemoryDecision,
} from "@/memory/decision-history";

export {
  resetMemoryTimeline,
  listTimelineEvents,
  addTimelineEvent,
  buildOrganisationalTimeline,
} from "@/memory/timeline";

export {
  resetMemoryPatterns,
  listMemoryPatterns,
  detectMemoryPatterns,
} from "@/memory/patterns";

export {
  resetMemoryLessons,
  listLessons,
  captureLesson,
  searchLessons,
} from "@/memory/lessons";

export {
  resetMemoryPlaybooks,
  listPlaybooks,
  evolvePlaybooksFromExperience,
} from "@/memory/playbooks";

export { textSimilarity, bestSimilarity } from "@/memory/similarity";

export {
  resetMemoryRecallLog,
  listRecentRecalls,
  recallOrganisationalMemory,
} from "@/memory/recall";

export {
  deriveMemoryInsights,
  measureMemoryGrowth,
} from "@/memory/insights";

export {
  resetMemoryGovernance,
  getMemoryGovernance,
  setMemoryGovernance,
  buildAnonymisedMemoryPortfolio,
} from "@/memory/governance";
export type { MemoryGovernancePolicy } from "@/memory/governance";

export { buildMemoryDashboard } from "@/memory/dashboard";
export { resetOrganisationalMemory } from "@/memory/reset";
