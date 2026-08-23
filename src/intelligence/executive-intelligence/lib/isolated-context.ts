/**
 * Empty / isolated context factories for real customer snapshots.
 * Prevents demo Northline intent, memory, twin, and graph bleed.
 */

import type { ExecutiveIntentProfile } from "@/intelligence/executive-intent/types";
import { InMemoryExecutiveMemoryStore } from "@/intelligence/executive-memory/store/in-memory-store";
import type { ExecutiveMemoryStore } from "@/intelligence/executive-memory/store/memory-store";
import { KnowledgeGraph } from "@/knowledge-graph";

export const PRIORITIES_NOT_ESTABLISHED =
  "Strategic priorities have not yet been established. Judgement is ranked by materiality, evidence, confidence and potential business impact.";

export function createIsolatedIntentProfile(input?: {
  executiveName?: string;
  asOf?: string;
}): ExecutiveIntentProfile {
  const asOf = input?.asOf ?? new Date().toISOString();
  return {
    id: "intent-profile-isolated",
    role: "CEO",
    executiveName: input?.executiveName ?? "Executive",
    title: "Chief Executive Officer",
    asOf,
    strategicPriorities: [],
    leadershipThemes: [],
    quarterlyObjectives: [],
    preferences: {
      decision: {
        biasTowardAction: 55,
        // Real snapshots must not inherit demo "option paper" counselling copy.
        requiresOptionPaper: false,
        escalateAboveRisk: 80,
        preferredActs: ["investigate", "wait", "approve", "delegate"],
      },
      attention: {
        focusBlockMinutes: 60,
        maxOpenDecisions: 4,
        preferDeepWorkMorning: true,
        interruptTolerance: "medium",
      },
      meeting: {
        maxMeetingsPerDay: 5,
        preferAsyncUpdates: true,
        protectStrategyBlocks: true,
        declineDuplicateForums: true,
      },
    },
    riskAppetite: "balanced",
    timeHorizon: "this_quarter",
    delegationStyle: "selective",
    leadershipCapacity: "standard",
    narrative: PRIORITIES_NOT_ESTABLISHED,
  };
}

export function createIsolatedMemoryStore(asOf?: string): ExecutiveMemoryStore {
  return new InMemoryExecutiveMemoryStore({
    asOf: asOf ?? new Date().toISOString(),
    source: "isolated-customer-snapshot",
  });
}

export function createIsolatedKnowledgeGraph(asOf?: string): KnowledgeGraph {
  return new KnowledgeGraph({
    asOf: asOf ?? new Date().toISOString(),
    source: "isolated-customer-snapshot",
  });
}
