import type { CommercialDashboard } from "@/commercial/framework/types";
import { listEditions, ensureDefaultEditions } from "@/commercial/editions";
import { listLicenses } from "@/commercial/licensing";
import { listPricingBands } from "@/commercial/pricing";
import {
  IMPLEMENTATION_STAGES,
  listImplementationPlans,
} from "@/commercial/implementation";
import { listSuccessPlans } from "@/commercial/success-plans";
import { listRoiReports } from "@/commercial/roi";
import { recommendExpansionOpportunities } from "@/commercial/expansion";
import { listRenewals, syncRenewalsFromLicenses } from "@/commercial/renewals";
import { listContracts } from "@/commercial/contracts";
import { buildSecurityPack } from "@/commercial/security-pack";
import { buildSalesEnablementAssets } from "@/commercial/sales-enablement";

export function buildCommercialDashboard(input?: {
  asOf?: string;
}): CommercialDashboard {
  const asOf = input?.asOf ?? new Date().toISOString();
  ensureDefaultEditions();
  syncRenewalsFromLicenses();

  const licenses = listLicenses();
  const implementationPlans = listImplementationPlans();
  const roiReports = listRoiReports();
  const expansion = recommendExpansionOpportunities({ asOf });
  const renewals = listRenewals();

  void IMPLEMENTATION_STAGES;

  return {
    asOf,
    editions: listEditions(),
    licenses,
    implementationPlans,
    successPlans: listSuccessPlans(),
    roiReports,
    expansion,
    renewals,
    contracts: listContracts(),
    securityPack: buildSecurityPack(asOf),
    salesAssets: buildSalesEnablementAssets(asOf),
    pricing: listPricingBands(),
    summary: {
      activeLicenses: licenses.length,
      pilotsInImplementation: implementationPlans.filter(
        (p) => p.currentStageId !== "go_live",
      ).length,
      productionReady: licenses.filter(
        (l) => l.tier === "production" || l.tier === "enterprise",
      ).length,
      expansionOpportunities: expansion.length,
      renewalsUpcoming: renewals.filter((r) => r.status === "upcoming").length,
      avgRoiConfidence:
        roiReports.length === 0
          ? 0
          : Math.round(
              roiReports.reduce(
                (sum, r) => sum + r.decisionConfidence.confidence,
                0,
              ) / roiReports.length,
            ),
    },
  };
}
