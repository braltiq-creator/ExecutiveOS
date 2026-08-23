/**
 * Strategic Initiative Engine
 * Executive coordination — never project management.
 */

export type * from "@/initiatives/models";
export {
  INITIATIVE_PRIORITIES,
  INITIATIVE_PROGRESS_STATES,
  EXECUTION_SYSTEMS,
} from "@/initiatives/models";

export {
  INITIATIVE_TEMPLATES,
  getInitiativeTemplate,
} from "@/initiatives/planner/catalogue";
export type { InitiativeTemplate } from "@/initiatives/planner/catalogue";
export { planStrategicInitiatives } from "@/initiatives/planner/plan";

export { coordinateInitiative } from "@/initiatives/coordination/council";
export { deriveDependencies, deriveProgress } from "@/initiatives/dependencies";
export {
  buildInitiativeGovernance,
  reviewCadenceFor,
  boardReadinessFrom,
} from "@/initiatives/governance/define";
export {
  buildInitiativeExplanation,
  explainInitiativeForExecutive,
} from "@/initiatives/explainability/explain";
export {
  toExecutionSystemRefs,
  executionBoundaryNote,
  SYSTEM_LABELS,
} from "@/initiatives/integration/execution-systems";
export {
  PROGRESS_LABELS,
  PRIORITY_LABELS,
  MOMENTUM_LABELS,
} from "@/initiatives/tracking/progress";

export {
  simulateInitiativesForScenario,
} from "@/initiatives/simulations/evaluate";
export type { InitiativeSimulationResult } from "@/initiatives/simulations/evaluate";
