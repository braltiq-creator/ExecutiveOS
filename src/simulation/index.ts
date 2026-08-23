/**
 * Reality Lab — Simulation Engine
 * Simulated organisations and executive scenarios.
 *
 * Enterprise Simulation Environment (Phase 46) — internal Braltiq
 * stress-test harness under `@/simulation/enterprise`.
 */

export type * from "@/simulation/types";

export {
  ORG_NORTHLINE_MINING,
  ORG_INDUSTRIAL_MANUFACTURER,
  ORG_ENTERPRISE_SAAS,
  ORG_UTILITIES_OPERATOR,
  ORG_HEALTHCARE_PROVIDER,
  ORG_APEX_FIELD_SERVICES,
  SIMULATED_ORGANISATIONS,
  getSimulatedOrganisation,
} from "@/simulation/organisations";

export {
  EXECUTIVE_SCENARIOS,
  FIELD_SERVICES_SCENARIOS,
  getAllScenarios,
  getScenario,
} from "@/simulation/scenarios";

export { runScenario } from "@/simulation/runner";
export type { LabRunResult } from "@/simulation/runner";

export * from "@/simulation/enterprise";
