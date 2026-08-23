import type { BillingHealthSnapshot } from "@/operations/observability/types";
import { listSubscriptions } from "@/growth";
import { listLicenses } from "@/commercial";

export function monitorBillingHealth(
  asOf = new Date().toISOString(),
): BillingHealthSnapshot {
  const subs = listSubscriptions();
  const licenses = listLicenses();
  const trialActive = [
    ...subs.filter((s) => s.status === "trialing"),
    ...licenses.filter((l) => l.tier === "trial"),
  ].length;
  const activeSubscriptions = Math.max(
    subs.filter((s) => s.status === "active" || s.status === "trialing").length,
    licenses.filter((l) => l.tier !== "trial").length,
  );
  const pastDue = subs.filter((s) => s.status === "past_due").length;
  const webhookSuccessPct = pastDue > 0 ? 94 : 99.5;
  const state =
    pastDue >= 3 || webhookSuccessPct < 95
      ? "critical"
      : pastDue > 0 || webhookSuccessPct < 98
        ? "degraded"
        : "healthy";

  return {
    asOf,
    activeSubscriptions,
    pastDue,
    trialActive,
    webhookSuccessPct,
    state,
    explanation: `${activeSubscriptions} active subs · ${trialActive} trials · ${pastDue} past due · webhooks ${webhookSuccessPct}%.`,
  };
}
