import type Stripe from "stripe";
import {
  insertPaymentHistoryRecord,
  updateOrganizationPlanField,
  updateSubscriptionRecord,
} from "@/lib/billing/mutations";
import {
  fetchPlanById,
  fetchSubscriptionByStripeCustomerId,
  fetchSubscriptionByStripeSubscriptionId,
} from "@/lib/billing/queries";
import { mapStripeSubscriptionStatus, getStripeSubscriptionPeriodEnd } from "@/lib/billing/stripe";
import type { BillingCycle, PlanId } from "@/lib/billing/types";
import { BillingError } from "@/lib/billing/types";

function planIdFromMetadata(metadata: Stripe.Metadata | null): PlanId {
  const planId = metadata?.plan_id;

  if (
    planId === "starter" ||
    planId === "professional" ||
    planId === "executive" ||
    planId === "enterprise"
  ) {
    return planId;
  }

  return "starter";
}

function billingCycleFromMetadata(metadata: Stripe.Metadata | null): BillingCycle {
  return metadata?.billing_cycle === "annual" ? "annual" : "monthly";
}

async function syncSubscriptionFromStripe(
  organizationId: string,
  subscription: Stripe.Subscription,
): Promise<void> {
  const planId = planIdFromMetadata(subscription.metadata);
  const billingCycle = billingCycleFromMetadata(subscription.metadata);
  const plan = await fetchPlanById(planId);

  if (!plan) {
    throw new BillingError("Plan not found during webhook sync.", "PLAN_NOT_FOUND");
  }

  await updateSubscriptionRecord(organizationId, {
    stripe_subscription_id: subscription.id,
    stripe_customer_id:
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer.id,
    plan: planId,
    status: mapStripeSubscriptionStatus(subscription.status),
    billing_cycle: billingCycle,
    seat_limit: plan.seat_limit,
    trial_ends_at: subscription.trial_end
      ? new Date(subscription.trial_end * 1000).toISOString()
      : null,
    renews_at: (() => {
      const periodEnd = getStripeSubscriptionPeriodEnd(subscription);
      return periodEnd ? new Date(periodEnd * 1000).toISOString() : null;
    })(),
    cancelled_at: subscription.cancel_at_period_end
      ? new Date().toISOString()
      : null,
  });

  await updateOrganizationPlanField(organizationId, planId);
}

export async function handleStripeWebhookEvent(
  event: Stripe.Event,
): Promise<void> {
  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
      break;
    case "customer.subscription.updated":
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
      break;
    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
      break;
    case "invoice.paid":
      await handleInvoicePaid(event.data.object as Stripe.Invoice);
      break;
    case "invoice.payment_failed":
      await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
      break;
    default:
      break;
  }
}

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
): Promise<void> {
  const organizationId = session.metadata?.organization_id;

  if (!organizationId) {
    return;
  }

  const customerId =
    typeof session.customer === "string" ? session.customer : session.customer?.id;

  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;

  const planId = planIdFromMetadata(session.metadata);
  const billingCycle = billingCycleFromMetadata(session.metadata);
  const plan = await fetchPlanById(planId);

  if (!plan) {
    return;
  }

  await updateSubscriptionRecord(organizationId, {
    stripe_customer_id: customerId ?? null,
    stripe_subscription_id: subscriptionId ?? null,
    plan: planId,
    status: "active",
    billing_cycle: billingCycle,
    seat_limit: plan.seat_limit,
  });

  await updateOrganizationPlanField(organizationId, planId);
}

async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription,
): Promise<void> {
  const existing =
    (await fetchSubscriptionByStripeSubscriptionId(subscription.id)) ??
    (typeof subscription.customer === "string"
      ? await fetchSubscriptionByStripeCustomerId(subscription.customer)
      : null);

  const organizationId =
    existing?.organization_id ?? subscription.metadata.organization_id;

  if (!organizationId) {
    return;
  }

  await syncSubscriptionFromStripe(organizationId, subscription);
}

async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
): Promise<void> {
  const existing = await fetchSubscriptionByStripeSubscriptionId(subscription.id);

  if (!existing) {
    return;
  }

  await updateSubscriptionRecord(existing.organization_id, {
    status: "cancelled",
    cancelled_at: new Date().toISOString(),
    stripe_subscription_id: null,
    plan: "starter",
    seat_limit: (await fetchPlanById("starter"))?.seat_limit ?? 3,
  });

  await updateOrganizationPlanField(existing.organization_id, "starter");
}

async function handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
  const customerId =
    typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;

  if (!customerId || !invoice.id) {
    return;
  }

  const subscription = await fetchSubscriptionByStripeCustomerId(customerId);

  if (!subscription) {
    return;
  }

  await insertPaymentHistoryRecord({
    organizationId: subscription.organization_id,
    stripeInvoiceId: invoice.id,
    amount: invoice.amount_paid ?? invoice.total ?? 0,
    currency: invoice.currency ?? "usd",
    status: invoice.status ?? "paid",
    invoiceUrl: invoice.hosted_invoice_url ?? invoice.invoice_pdf ?? null,
    paidAt: invoice.status_transitions?.paid_at
      ? new Date(invoice.status_transitions.paid_at * 1000).toISOString()
      : new Date().toISOString(),
  });

  if (subscription.status !== "active") {
    await updateSubscriptionRecord(subscription.organization_id, {
      status: "active",
    });
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  const customerId =
    typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;

  if (!customerId || !invoice.id) {
    return;
  }

  const subscription = await fetchSubscriptionByStripeCustomerId(customerId);

  if (!subscription) {
    return;
  }

  await insertPaymentHistoryRecord({
    organizationId: subscription.organization_id,
    stripeInvoiceId: invoice.id,
    amount: invoice.amount_due ?? invoice.total ?? 0,
    currency: invoice.currency ?? "usd",
    status: "payment_failed",
    invoiceUrl: invoice.hosted_invoice_url ?? null,
    paidAt: null,
  });

  await updateSubscriptionRecord(subscription.organization_id, {
    status: "past_due",
  });
}
