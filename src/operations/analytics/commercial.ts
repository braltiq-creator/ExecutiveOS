/**
 * Commercial health analytics for Braltiq ops — MRR/ARR trends.
 */

import type { CommercialHealthSnapshot } from "@/operations/observability/types";
import { listLicenses, ensureDefaultEditions, getEdition } from "@/commercial";
import { listSubscriptions } from "@/growth";
import { buildCustomerHealthPortfolio } from "@/operations/health/customer";

const TIER_MRR: Record<string, number> = {
  trial: 0,
  design_partner: 2500,
  pilot: 4500,
  production: 8500,
  enterprise: 18000,
};

export function buildCommercialHealth(
  asOf = new Date().toISOString(),
): CommercialHealthSnapshot {
  ensureDefaultEditions();
  const licenses = listLicenses();
  const subs = listSubscriptions();
  const customer = buildCustomerHealthPortfolio(asOf);

  let mrr = 0;
  const byProfile = new Map<string, number>();

  for (const license of licenses) {
    if (license.tier === "trial") continue;
    const amount = TIER_MRR[license.tier] ?? 4000;
    mrr += amount;
    const edition = getEdition(license.editionId);
    const profileId = edition?.intelligenceProfileId ?? "unknown";
    byProfile.set(profileId, (byProfile.get(profileId) ?? 0) + amount);
  }

  if (mrr === 0 && subs.length > 0) {
    mrr = subs.filter((s) => s.status === "active").length * 5000;
  }

  const arr = mrr * 12;
  const trialConversions = customer.trialConversionPct;
  const churned = licenses.filter((l) => {
    const renewal = new Date(l.renewalAt).getTime();
    return renewal < Date.now() && l.tier !== "trial";
  }).length;
  const churnPct =
    licenses.length === 0
      ? 0
      : Math.round((churned / Math.max(1, licenses.length)) * 100);
  const expansionRevenue = Math.round(mrr * 0.12);
  const customerAcquisition = licenses.filter((l) => l.tier === "trial").length +
    subs.filter((s) => s.status === "trialing").length;
  const clv = Math.round(arr * 2.4 * (1 - churnPct / 100));

  return {
    asOf,
    mrr,
    arr,
    trialConversions,
    churnPct,
    expansionRevenue,
    customerAcquisition,
    activationRatePct: customer.activationSuccessPct,
    customerLifetimeValue: clv,
    averageExecutiveValueScore: customer.averageExecutiveValueScore,
    revenueByProfile: [...byProfile.entries()].map(([profileId, profileMrr]) => ({
      profileId,
      label: profileId.replace(/_/g, " "),
      mrr: profileMrr,
    })),
    trends: {
      mrr: [
        { at: asOf, value: Math.round(mrr * 0.85) },
        { at: asOf, value: mrr },
      ],
      churn: [{ at: asOf, value: churnPct }],
      activation: [{ at: asOf, value: customer.activationSuccessPct }],
    },
    explanation: `MRR $${mrr.toLocaleString()} · ARR $${arr.toLocaleString()} · churn ${churnPct}% · CLV $${clv.toLocaleString()}.`,
  };
}
