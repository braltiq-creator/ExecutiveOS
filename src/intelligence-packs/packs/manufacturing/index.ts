/**
 * Manufacturing Executive Intelligence Pack — Phase 52
 *
 * First production industry pack on EIPF.
 * Supplies manufacturing context only — Core / Experience / Council / EIM / EJF unchanged.
 */

export { createManufacturingExecutivePack } from "@/intelligence-packs/packs/manufacturing/factory";
export {
  MANUFACTURING_PACK_ID,
  MANUFACTURING_INDUSTRY,
} from "@/intelligence-packs/packs/manufacturing/constants";
export { MANUFACTURING_DECISION_CATALOGUE } from "@/intelligence-packs/packs/manufacturing/catalog/frameworks";
export { MANUFACTURING_FORBIDDEN_CORE_TYPES } from "@/intelligence-packs/packs/manufacturing/catalog/ontology";
export {
  createMockDynamicsManufacturingProvider,
  createBaselineManufacturingSnapshot,
  getManufacturingSimulationDataset,
  MANUFACTURING_SIMULATION_DATASETS,
  MANUFACTURING_SUPPORTED_CONNECTORS,
} from "@/intelligence-packs/packs/manufacturing/providers/dynamics";
export type {
  ManufacturingDynamicsProvider,
  ManufacturingDynamicsSnapshot,
  ManufacturingSimulationDataset,
  DynamicsModuleId,
} from "@/intelligence-packs/packs/manufacturing/providers/dynamics";
export {
  validateManufacturingPack,
  validateManufacturingPackCompleteness,
  smokeManufacturingSimulation,
} from "@/intelligence-packs/packs/manufacturing/validate";
export type { ManufacturingPackValidation } from "@/intelligence-packs/packs/manufacturing/validate";
export { registerManufacturingPack } from "@/intelligence-packs/packs/manufacturing/register";
