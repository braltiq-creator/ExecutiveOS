/**
 * Organisation Portal — Phase 54
 * Customer-facing commercial SaaS portal.
 */

export type * from "@/organisation-portal/types";

export {
  ORGANISATION_PORTAL_NAV,
  isPortalNavActive,
} from "@/organisation-portal/navigation";

export {
  getOrganisationPortalSnapshot,
} from "@/organisation-portal/snapshot";
export type { PortalContextInput } from "@/organisation-portal/snapshot";

export { reviewOrganisationPortal } from "@/organisation-portal/self-review";

export { buildOrganisationDetails } from "@/organisation-portal/organisation/details";
export { buildConnectedSystems } from "@/organisation-portal/connected-systems/catalog";
export { buildExecutiveIntelligenceSection } from "@/organisation-portal/executive-intelligence/section";
export { buildSubscriptionSection } from "@/organisation-portal/subscription/section";
export { buildUsageValueSection } from "@/organisation-portal/usage-value/section";
export { buildSupportSection } from "@/organisation-portal/support/section";
