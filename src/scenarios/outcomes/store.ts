/**
 * Scenario business outcome records (per-tenant).
 */

import type { ScenarioOutcomeRecord } from "@/scenarios/framework/types";

const outcomes = new Map<string, ScenarioOutcomeRecord>();

export function resetScenarioOutcomes(): void {
  outcomes.clear();
}

export function recordScenarioOutcome(input: {
  tenantId: string;
  scenarioId: string;
  outcome: string;
  realised: boolean;
  notes?: string;
  asOf?: string;
}): ScenarioOutcomeRecord {
  const record: ScenarioOutcomeRecord = {
    id: `sout-${input.tenantId}-${outcomes.size + 1}`,
    tenantId: input.tenantId,
    scenarioId: input.scenarioId,
    outcome: input.outcome,
    realised: input.realised,
    recordedAt: input.asOf ?? new Date().toISOString(),
    notes: input.notes ?? "",
  };
  outcomes.set(record.id, record);
  return record;
}

export function listOutcomesForScenario(
  tenantId: string,
  scenarioId: string,
): ScenarioOutcomeRecord[] {
  return [...outcomes.values()].filter(
    (o) => o.tenantId === tenantId && o.scenarioId === scenarioId,
  );
}

export function listOutcomesForTenant(
  tenantId: string,
): ScenarioOutcomeRecord[] {
  return [...outcomes.values()].filter((o) => o.tenantId === tenantId);
}
