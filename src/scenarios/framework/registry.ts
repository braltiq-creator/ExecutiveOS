/**
 * Scenario Pack registry — add packs without Core engine changes.
 */

import type { IntelligenceProfileId } from "@/profiles";
import type {
  ExecutiveScenarioDefinition,
  ScenarioPack,
} from "@/scenarios/framework/types";
import { OPERATIONS_SCENARIO_PACK } from "@/scenarios/operations/pack";
import { COMMERCIAL_SCENARIO_PACK } from "@/scenarios/commercial/pack";

const packs = new Map<string, ScenarioPack>([
  [OPERATIONS_SCENARIO_PACK.id, OPERATIONS_SCENARIO_PACK],
  [COMMERCIAL_SCENARIO_PACK.id, COMMERCIAL_SCENARIO_PACK],
]);

export function registerScenarioPack(pack: ScenarioPack): void {
  packs.set(pack.id, pack);
}

export function listScenarioPacks(): ScenarioPack[] {
  return [...packs.values()];
}

export function getScenarioPack(packId: string): ScenarioPack | undefined {
  return packs.get(packId);
}

export function getScenarioPackForProfile(
  profileId: IntelligenceProfileId,
): ScenarioPack {
  return profileId === "commercial_executive"
    ? COMMERCIAL_SCENARIO_PACK
    : OPERATIONS_SCENARIO_PACK;
}

export function getScenarioById(
  scenarioId: string,
): ExecutiveScenarioDefinition | undefined {
  for (const pack of packs.values()) {
    const found = pack.scenarios.find((s) => s.id === scenarioId);
    if (found) return found;
  }
  return undefined;
}

export function listScenariosForProfile(
  profileId: IntelligenceProfileId,
): ExecutiveScenarioDefinition[] {
  return getScenarioPackForProfile(profileId).scenarios;
}

export function resetScenarioPackRegistry(): void {
  packs.clear();
  packs.set(OPERATIONS_SCENARIO_PACK.id, OPERATIONS_SCENARIO_PACK);
  packs.set(COMMERCIAL_SCENARIO_PACK.id, COMMERCIAL_SCENARIO_PACK);
}
