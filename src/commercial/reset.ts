import { resetEditions } from "@/commercial/editions";
import { resetLicenses } from "@/commercial/licensing";
import { resetImplementationPlans } from "@/commercial/implementation";
import { resetSuccessPlans } from "@/commercial/success-plans";
import { resetRoiReports } from "@/commercial/roi";
import { resetExpansionOpportunities } from "@/commercial/expansion";
import { resetRenewals } from "@/commercial/renewals";
import { resetContracts } from "@/commercial/contracts";

export function resetCommercialPlatform(): void {
  resetEditions();
  resetLicenses();
  resetImplementationPlans();
  resetSuccessPlans();
  resetRoiReports();
  resetExpansionOpportunities();
  resetRenewals();
  resetContracts();
}
