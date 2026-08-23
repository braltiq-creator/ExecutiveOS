/**
 * Commercial Readiness Platform
 *
 * Braltiq-internal packaging, licensing, implementation, CS, ROI, and expansion.
 * Not customer-facing. Editions register without changing Core.
 */

export type * from "@/commercial/framework/types";

export { resetCommercialPlatform } from "@/commercial/reset";

export {
  ensureDefaultEditions,
  registerEdition,
  getEdition,
  listEditions,
  resetEditions,
} from "@/commercial/editions";

export {
  issueLicense,
  updateLicenseUsage,
  getLicense,
  listLicenses,
  getLicenseForTenant,
  resetLicenses,
} from "@/commercial/licensing";

export { listPricingBands, quoteEdition } from "@/commercial/pricing";

export {
  IMPLEMENTATION_STAGES,
  getImplementationStage,
  createImplementationPlan,
  advanceImplementationStage,
  completeImplementationStage,
  listImplementationPlans,
  getImplementationPlan,
  resetImplementationPlans,
} from "@/commercial/implementation";

export {
  createSuccessPlan,
  updateSuccessPlan,
  listSuccessPlans,
  assessSuccessPlanHealth,
  refreshSuccessPlanHealth,
} from "@/commercial/customer-success";

export {
  generateCustomerRoiReport,
  listRoiReports,
  resetRoiReports,
} from "@/commercial/roi";

export { buildSecurityPack } from "@/commercial/security-pack";
export { buildSalesEnablementAssets } from "@/commercial/sales-enablement";

export {
  recommendExpansionOpportunities,
  listExpansionOpportunities,
  resetExpansionOpportunities,
} from "@/commercial/expansion";

export {
  syncRenewalsFromLicenses,
  updateRenewalStatus,
  listRenewals,
  resetRenewals,
} from "@/commercial/renewals";

export {
  createContract,
  listContracts,
  resetContracts,
} from "@/commercial/contracts";

export { buildCommercialDashboard } from "@/commercial/dashboard/build";
