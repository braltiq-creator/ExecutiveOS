/**
 * Executive Domain Advisor Framework — Phase 52A
 *
 * Specialist domain experts that advise the Executive Council.
 * NOT Council members. Activated by Industry Intelligence Packs.
 *
 * Stack position:
 * EIRL → EIM → EJF → Industry Pack → Domain Advisors → Council → Recommendation → Experience
 */

export type * from "@/domain-advisors/types";

export {
  defineDomainAdvisor,
  defineCatalogueEntry,
  relationships,
  validateDomainAdvisor,
  validateCatalogueEntry,
  PERMANENT_COUNCIL_ROLE_IDS,
} from "@/domain-advisors/define";
export type { DefineDomainAdvisorInput } from "@/domain-advisors/define";

export {
  activateDomainAdvisorsForIndustry,
  getDomainAdvisor,
  listCatalogueEntries,
  listFullDomainAdvisors,
} from "@/domain-advisors/resolve";

export {
  domainAdvisorsActivatedByPack,
  packProvidesDomainAdvisors,
} from "@/domain-advisors/bridge-pack";

export {
  ALL_DOMAIN_ADVISOR_CATALOGUES,
  getDomainAdvisorCatalogue,
  MANUFACTURING_ADVISOR_CATALOGUE,
  MINING_ADVISOR_CATALOGUE,
  UTILITIES_ADVISOR_CATALOGUE,
  CONSTRUCTION_ADVISOR_CATALOGUE,
  HEALTHCARE_ADVISOR_CATALOGUE,
  GOVERNMENT_ADVISOR_CATALOGUE,
  TECHNOLOGY_ADVISOR_CATALOGUE,
  FINANCIAL_SERVICES_ADVISOR_CATALOGUE,
  RETAIL_ADVISOR_CATALOGUE,
  PROFESSIONAL_SERVICES_ADVISOR_CATALOGUE,
  FIELD_SERVICES_ADVISOR_CATALOGUE,
  LOGISTICS_ADVISOR_CATALOGUE,
} from "@/domain-advisors/catalogues";

export {
  MANUFACTURING_DOMAIN_ADVISORS,
  MANUFACTURING_ADVISOR,
  DEMAND_PLANNING_ADVISOR,
  SUPPLY_CHAIN_ADVISOR,
  PRODUCTION_PLANNING_ADVISOR,
  INVENTORY_ADVISOR,
  DEALER_NETWORK_ADVISOR,
  PROCUREMENT_ADVISOR,
  PRODUCT_PORTFOLIO_ADVISOR,
  QUALITY_ADVISOR,
  SUSTAINABILITY_ADVISOR,
} from "@/domain-advisors/advisors/manufacturing/advisors";

export { reviewDomainAdvisorFramework } from "@/domain-advisors/self-review";
export type { DomainAdvisorSelfReview } from "@/domain-advisors/self-review";
