/**
 * Pilot Readiness Toolkit
 *
 * For Braltiq implementation and customer success teams.
 * Enables repeatable Design Partner provisioning, validation, and health.
 */

export type * from "@/pilot/types";
export { PILOT_LIFECYCLE_STAGES } from "@/pilot/types";

export {
  provisionDesignPartner,
  getPilot,
  getPilotByTenant,
  getPilotByOrganisation,
  listPilots,
  savePilot,
  resetPilotRegistry,
  updatePilotStage,
  markPilotStarted,
} from "@/pilot/provisioning";

export {
  createPilotRecord,
  advancePilotStage,
  lifecycleProgress,
  hoursBetweenStages,
} from "@/pilot/deployment";

export {
  OPERATIONS_TENANT_TEMPLATE,
  COMMERCIAL_TENANT_TEMPLATE,
  MANUFACTURING_FORECASTING_TENANT_TEMPLATE,
  getTenantTemplate,
  buildTenantFromTemplate,
} from "@/pilot/tenant-templates";
export type { TenantTemplate } from "@/pilot/tenant-templates";

export {
  buildProviderChecklists,
  checklistCompletionPct,
  requiredProvidersConnected,
} from "@/pilot/checklists";

export { computePilotReadinessScore } from "@/pilot/readiness";
export { diagnosePilot } from "@/pilot/diagnostics";
export { buildPilotHealthSnapshot } from "@/pilot/health";
export {
  measurePilotSuccess,
  recordReadinessSample,
  resetReadinessHistory,
} from "@/pilot/success";

export {
  OPERATIONS_EXECUTIVE_PLAYBOOK,
  COMMERCIAL_EXECUTIVE_PLAYBOOK,
  getPlaybook,
  listPlaybooks,
} from "@/pilot/playbooks";
export type { PilotPlaybook } from "@/pilot/playbooks";

export { buildSupportGuidance } from "@/pilot/support";
export type { SupportGuidance } from "@/pilot/support";

export {
  exportPilotDocument,
  exportAllPilotDocuments,
} from "@/pilot/exports";
