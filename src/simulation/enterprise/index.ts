/**
 * Enterprise Simulation Environment — internal Braltiq stress-test harness.
 * Never exposed to customers. Reuses Reality Lab + experience capabilities.
 */

export type * from "@/simulation/enterprise/types";
export {
  ENTERPRISE_SCORE_DIMENSIONS,
  ENTERPRISE_SCORE_LABELS,
} from "@/simulation/enterprise/types";

export {
  getEnterpriseModel,
  listEnterpriseModels,
  resolveOrganisation,
} from "@/simulation/enterprise/models";

export {
  BUSINESS_EVENTS,
  getBusinessEvent,
  listBusinessEvents,
  modeForScenarioId,
} from "@/simulation/enterprise/events";

export {
  applyScenarioPressureToPortfolio,
  buildExperienceSurface,
} from "@/simulation/enterprise/experience-bridge";
export type { ExperienceSurface } from "@/simulation/enterprise/experience-bridge";

export {
  OPERATING_LOOP_FLOW,
  validateOperatingLoop,
} from "@/simulation/enterprise/operating-loop";

export { validateCouncil } from "@/simulation/enterprise/council-validation";

export { buildEnterpriseScorecard } from "@/simulation/enterprise/scoring";

export {
  generateEnterpriseReport,
  summariseEnterpriseSuite,
} from "@/simulation/enterprise/report";

export {
  runEnterpriseSimulation,
  runEnterpriseSimulationSuite,
  listSimulationModes,
} from "@/simulation/enterprise/runner";
