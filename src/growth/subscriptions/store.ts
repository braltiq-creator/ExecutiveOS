import type {
  GrowthInvoice,
  GrowthSubscription,
  GrowthSubscriptionStatus,
} from "@/growth/framework/types";
import type { PlanId } from "@/lib/billing/types";

const subscriptions = new Map<string, GrowthSubscription>();
const invoices = new Map<string, GrowthInvoice>();
let subSeq = 0;
let invSeq = 0;

export function resetGrowthSubscriptions(): void {
  subscriptions.clear();
  invoices.clear();
  subSeq = 0;
  invSeq = 0;
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString();
}

function addMonths(iso: string, months: number): string {
  const d = new Date(iso);
  d.setUTCMonth(d.getUTCMonth() + months);
  return d.toISOString();
}

const SEAT_LIMITS: Record<PlanId, number> = {
  starter: 3,
  professional: 10,
  executive: 25,
  enterprise: 100,
};

export function startTrialSubscription(input: {
  organizationId: string;
  planId?: PlanId;
  billingCycle?: "monthly" | "annual";
}): GrowthSubscription {
  const now = new Date().toISOString();
  subSeq += 1;
  const planId = input.planId ?? "professional";
  const record: GrowthSubscription = {
    id: `gsub-${subSeq}`,
    organizationId: input.organizationId,
    planId,
    status: "trialing",
    trialEndsAt: addDays(now, 14),
    renewsAt: addDays(now, 14),
    cancelledAt: null,
    seatLimit: SEAT_LIMITS[planId],
    seatCount: 1,
    billingCycle: input.billingCycle ?? "monthly",
    createdAt: now,
    updatedAt: now,
  };
  subscriptions.set(record.id, record);
  return record;
}

export function activatePaidSubscription(input: {
  organizationId: string;
  planId: PlanId;
  billingCycle?: "monthly" | "annual";
}): GrowthSubscription {
  const existing = getSubscriptionForOrganization(input.organizationId);
  const now = new Date().toISOString();
  if (existing) {
    const next: GrowthSubscription = {
      ...existing,
      planId: input.planId,
      status: "active",
      trialEndsAt: null,
      renewsAt: addMonths(now, input.billingCycle === "annual" ? 12 : 1),
      billingCycle: input.billingCycle ?? existing.billingCycle,
      seatLimit: SEAT_LIMITS[input.planId],
      updatedAt: now,
    };
    subscriptions.set(next.id, next);
    recordInvoice({
      organizationId: input.organizationId,
      amount: input.billingCycle === "annual" ? 78000 : 7500,
      status: "paid",
    });
    return next;
  }
  subSeq += 1;
  const record: GrowthSubscription = {
    id: `gsub-${subSeq}`,
    organizationId: input.organizationId,
    planId: input.planId,
    status: "active",
    trialEndsAt: null,
    renewsAt: addMonths(now, input.billingCycle === "annual" ? 12 : 1),
    cancelledAt: null,
    seatLimit: SEAT_LIMITS[input.planId],
    seatCount: 1,
    billingCycle: input.billingCycle ?? "monthly",
    createdAt: now,
    updatedAt: now,
  };
  subscriptions.set(record.id, record);
  recordInvoice({
    organizationId: input.organizationId,
    amount: input.billingCycle === "annual" ? 78000 : 7500,
    status: "paid",
  });
  return record;
}

export function changeSubscriptionPlan(input: {
  organizationId: string;
  planId: PlanId;
}): GrowthSubscription | null {
  const current = getSubscriptionForOrganization(input.organizationId);
  if (!current) return null;
  const next: GrowthSubscription = {
    ...current,
    planId: input.planId,
    seatLimit: SEAT_LIMITS[input.planId],
    updatedAt: new Date().toISOString(),
  };
  subscriptions.set(next.id, next);
  return next;
}

export function cancelSubscription(
  organizationId: string,
): GrowthSubscription | null {
  const current = getSubscriptionForOrganization(organizationId);
  if (!current) return null;
  const now = new Date().toISOString();
  const next: GrowthSubscription = {
    ...current,
    status: "cancelled",
    cancelledAt: now,
    updatedAt: now,
  };
  subscriptions.set(next.id, next);
  return next;
}

export function setSubscriptionStatus(input: {
  organizationId: string;
  status: GrowthSubscriptionStatus;
}): GrowthSubscription | null {
  const current = getSubscriptionForOrganization(input.organizationId);
  if (!current) return null;
  const next = {
    ...current,
    status: input.status,
    updatedAt: new Date().toISOString(),
  };
  subscriptions.set(next.id, next);
  return next;
}

export function getSubscriptionForOrganization(
  organizationId: string,
): GrowthSubscription | undefined {
  return [...subscriptions.values()]
    .filter((s) => s.organizationId === organizationId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
}

export function listSubscriptions(): GrowthSubscription[] {
  return [...subscriptions.values()];
}

export function recordInvoice(input: {
  organizationId: string;
  amount: number;
  status?: GrowthInvoice["status"];
  invoiceUrl?: string | null;
}): GrowthInvoice {
  invSeq += 1;
  const now = new Date().toISOString();
  const invoice: GrowthInvoice = {
    id: `ginv-${invSeq}`,
    organizationId: input.organizationId,
    amount: input.amount,
    currency: "AUD",
    status: input.status ?? "paid",
    invoiceUrl: input.invoiceUrl ?? `/settings/billing#invoice-${invSeq}`,
    paidAt: input.status === "open" ? null : now,
    createdAt: now,
  };
  invoices.set(invoice.id, invoice);
  return invoice;
}

export function listInvoices(organizationId: string): GrowthInvoice[] {
  return [...invoices.values()]
    .filter((i) => i.organizationId === organizationId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
