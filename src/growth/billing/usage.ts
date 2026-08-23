import {
  getSubscriptionForOrganization,
  listInvoices,
} from "@/growth/subscriptions";

export function buildUsageDashboard(organizationId: string) {
  const subscription = getSubscriptionForOrganization(organizationId);
  const invoices = listInvoices(organizationId);
  return {
    organizationId,
    planId: subscription?.planId ?? null,
    status: subscription?.status ?? "incomplete",
    seats: {
      used: subscription?.seatCount ?? 0,
      limit: subscription?.seatLimit ?? 0,
    },
    renewsAt: subscription?.renewsAt ?? null,
    trialEndsAt: subscription?.trialEndsAt ?? null,
    invoices,
    history: invoices.map((invoice) => ({
      id: invoice.id,
      amount: invoice.amount,
      status: invoice.status,
      at: invoice.createdAt,
      url: invoice.invoiceUrl,
    })),
  };
}
