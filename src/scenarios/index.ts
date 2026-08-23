/**
 * Executive Scenario Packs
 *
 * Acceptance criteria for Design Partners — measured by executive questions answered,
 * not by software features. Portable across tenants; never compares business data
 * between tenants.
 */

export type * from "@/scenarios/framework/types";
export {
  registerScenarioPack,
  listScenarioPacks,
  getScenarioPack,
  getScenarioPackForProfile,
  getScenarioById,
  listScenariosForProfile,
  resetScenarioPackRegistry,
  attachScenariosToTodayActions,
} from "@/scenarios/framework";

export { OPERATIONS_SCENARIO_PACK } from "@/scenarios/operations";
export { COMMERCIAL_SCENARIO_PACK } from "@/scenarios/commercial";

export {
  listExecutiveQuestions,
  findQuestionByText,
} from "@/scenarios/questions";
export type { ExecutiveQuestionRef } from "@/scenarios/questions";

export {
  getScenarioDatasetSignals,
  getDatasetSignalForScenario,
} from "@/scenarios/datasets";
export type { ScenarioDatasetSignal } from "@/scenarios/datasets";

export {
  getScenarioPlaybook,
  listScenarioPlaybooks,
} from "@/scenarios/playbooks";
export type { ScenarioPlaybook } from "@/scenarios/playbooks";

export {
  runScenarioPack,
  recordScenarioFeedback,
  listScenarioRunsForTenant,
  resetScenarioValidationState,
  buildScenarioScorecard,
  signalsFromIntelligentSnapshot,
  signalsFromPresentationSnapshot,
} from "@/scenarios/validation";
export type { ScenarioSignalBag } from "@/scenarios/validation";

export {
  recordScenarioEvidence,
  listEvidenceForScenario,
  listEvidenceForTenant,
  resetScenarioEvidence,
} from "@/scenarios/evidence";

export {
  recordScenarioOutcome,
  listOutcomesForScenario,
  listOutcomesForTenant,
  resetScenarioOutcomes,
} from "@/scenarios/outcomes";

export { generateScenarioReport } from "@/scenarios/reports";
export { benchmarkScenarioPerformance } from "@/scenarios/benchmarking";

export { resetScenarioCentre } from "@/scenarios/reset";
