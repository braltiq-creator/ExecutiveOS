/**
 * Reset all Scenario Pack in-memory stores (tests).
 */

import { resetScenarioPackRegistry } from "@/scenarios/framework";
import { resetScenarioValidationState } from "@/scenarios/validation";
import { resetScenarioEvidence } from "@/scenarios/evidence";
import { resetScenarioOutcomes } from "@/scenarios/outcomes";

export function resetScenarioCentre(): void {
  resetScenarioPackRegistry();
  resetScenarioValidationState();
  resetScenarioEvidence();
  resetScenarioOutcomes();
}
