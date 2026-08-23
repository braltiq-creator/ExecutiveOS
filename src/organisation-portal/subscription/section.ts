import {
  getSubscriptionForOrganization,
  listInvoices,
} from "@/growth/subscriptions";
import {
  getTrialDaysRemaining,
  refreshTrialStatus,
} from "@/provisioning";
import { getTrialByTenant } from "@/provisioning/store";
import type { SubscriptionSection } from "@/organisation-portal/types";

const PLAN_NAMES: Record<string, string> = {
  starter: "Starter",
  professional: "Professional",
  executive: "Executive",
  enterprise: "Enterprise",
};

export function buildSubscriptionSection(input: {
  organisationId: string;
  tenantId: string | null;
  asOf?: string;
}): SubscriptionSection {
  const asOf = input.asOf ?? new Date().toISOString();
  const sub = getSubscriptionForOrganization(input.organisationId);
  const trial = input.tenantId
    ? refreshTrialStatus(input.tenantId, asOf) ?? getTrialByTenant(input.tenantId)
    : null;
  const daysRemaining = input.tenantId
    ? getTrialDaysRemaining(input.tenantId, asOf)
    : 0;

  const invoices = listInvoices(input.organisationId).map((inv) => ({
    id: inv.id,
    amountLabel: `$${inv.amount.toLocaleString()} ${inv.currency}`,
    status: inv.status,
    issuedAt: inv.createdAt,
  }));

  return {
    planId: sub?.planId ?? "professional",
    planName: PLAN_NAMES[sub?.planId ?? "professional"] ?? "Professional",
    status: sub?.status ?? (trial ? "trialing" : "none"),
    trial: {
      active: Boolean(
        trial && trial.status !== "expired" && trial.status !== "converted",
      ),
      daysRemaining,
      endsAt: trial?.endsAt ?? sub?.trialEndsAt ?? null,
    },
    renewalAt: sub?.renewsAt ?? trial?.endsAt ?? null,
    invoices:
      invoices.length > 0
        ? invoices
        : [
            {
              id: "inv-preview",
              amountLabel: "$0",
              status: "trial",
              issuedAt: asOf,
            },
          ],
    paymentMethod: sub?.status === "active" ? "Card on file" : "None — trial",
    usage: {
      seatsUsed: sub?.seatCount ?? 1,
      seatsLimit: sub?.seatLimit ?? 3,
      executivesActive: trial?.usage.executives ?? 1,
    },
    upgradePath: "/subscribe",
    cancelPath: "/organisation/subscription",
  };
}
