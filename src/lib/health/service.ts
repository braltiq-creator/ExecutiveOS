import { analyzeExecutiveHealth } from "@/lib/health/engine";
import type {
  ExecutiveHealthReport,
  HealthEngine,
  HealthEngineInput,
} from "@/lib/health/types";
import { loadExecutiveDecisionRecords } from "@/lib/intelligence/decisions";
import { loadExecutiveInitiativeRecords } from "@/lib/initiatives/intelligence";
import { loadStrategicObjectiveRecords } from "@/lib/intelligence/objectives";
import { fetchMeetingsWithActions } from "@/lib/meetings/queries";
import { fetchActiveMemory } from "@/lib/memory/queries";

let healthEngine: HealthEngine = analyzeExecutiveHealth;

export function setHealthEngine(engine: HealthEngine): void {
  healthEngine = engine;
}

export function getHealthEngine(): HealthEngine {
  return healthEngine;
}

export async function loadHealthEngineInput(
  userId: string,
): Promise<HealthEngineInput> {
  const [objectives, initiatives, decisions, memories, meetings] =
    await Promise.all([
      loadStrategicObjectiveRecords(userId),
      loadExecutiveInitiativeRecords(userId),
      loadExecutiveDecisionRecords(userId),
      fetchActiveMemory(userId),
      fetchMeetingsWithActions(userId),
    ]);

  return {
    objectives,
    initiatives,
    decisions,
    memories,
    meetings,
  };
}

export async function computeExecutiveHealth(
  userId: string,
): Promise<ExecutiveHealthReport> {
  const input = await loadHealthEngineInput(userId);
  return healthEngine(input);
}

export function computeExecutiveHealthFromInput(
  input: HealthEngineInput,
): ExecutiveHealthReport {
  return healthEngine(input);
}
