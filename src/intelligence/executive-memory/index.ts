/**
 * Executive Memory Engine (EME)
 *
 * Long-term learning system of ExecutiveOS.
 * Remembers what matters. Never invents history.
 * Pure TypeScript. Deterministic. Mock persistence. Supabase-ready.
 */

export type * from "@/intelligence/executive-memory/types";

export type { ExecutiveMemoryStore } from "@/intelligence/executive-memory/store/memory-store";
export { InMemoryExecutiveMemoryStore } from "@/intelligence/executive-memory/store/in-memory-store";
export { createSeededExecutiveMemoryStore } from "@/intelligence/executive-memory/store/seed-memory";

export type { ExecutiveMemoryProvider } from "@/intelligence/executive-memory/provider";
export {
  createMockExecutiveMemoryProvider,
  getExecutiveMemoryProvider,
  getExecutiveMemoryStore,
  setExecutiveMemoryProvider,
} from "@/intelligence/executive-memory/provider";

export { deriveBehaviourSnapshot, BEHAVIOUR_DIMENSIONS } from "@/intelligence/executive-memory/behaviour";

export {
  remember,
  recall,
  entityTimeline,
  summariseHistory,
  predictBehaviour,
  recommendBasedOnHistory,
  deriveMemoryInsights,
  compareBehaviour,
  detectDrift,
  detectImprovement,
} from "@/intelligence/executive-memory/engine";

export { applyExecutiveMemory } from "@/intelligence/executive-memory/apply-memory";
