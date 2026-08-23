import Stripe from "stripe";
import type { BillingCycle, PlanId, SubscriptionStatus } from "@/lib/billing/types";
import { BillingError } from "@/lib/billing/types";

export type PaymentProvider = "stripe" | "app_store" | "invoice";

let stripeClient: Stripe | null = null;

export function getPaymentProvider(): PaymentProvider {
  return "stripe";
}

export function getStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new BillingError(
      "Stripe is not configured. Set STRIPE_SECRET_KEY.",
      "STRIPE_NOT_CONFIGURED",
    );
  }

  if (!stripeClient) {
    stripeClient = new Stripe(secretKey);
  }

  return stripeClient;
}

export function getStripePriceId(
  planId: PlanId,
  billingCycle: BillingCycle,
): string {
  const envKey = `STRIPE_PRICE_${planId.toUpperCase()}_${billingCycle.toUpperCase()}`;
  const priceId = process.env[envKey];

  if (!priceId) {
    throw new BillingError(
      `Stripe price is not configured for ${planId} (${billingCycle}). Set ${envKey}.`,
      "STRIPE_PRICE_NOT_CONFIGURED",
    );
  }

  return priceId;
}

export function getAppBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.VERCEL_URL ??
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

export async function createStripeCustomer(input: {
  organizationId: string;
  organizationName: string;
  email: string;
}): Promise<string> {
  const stripe = getStripeClient();

  const customer = await stripe.customers.create({
    email: input.email,
    name: input.organizationName,
    metadata: {
      organization_id: input.organizationId,
      provider: getPaymentProvider(),
    },
  });

  return customer.id;
}

export async function createStripeCheckoutSession(input: {
  customerId: string;
  organizationId: string;
  planId: PlanId;
  billingCycle: BillingCycle;
}): Promise<string> {
  const stripe = getStripeClient();
  const baseUrl = getAppBaseUrl();

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: input.customerId,
    line_items: [
      {
        price: getStripePriceId(input.planId, input.billingCycle),
        quantity: 1,
      },
    ],
    success_url: `${baseUrl}/settings/billing?checkout=success`,
    cancel_url: `${baseUrl}/settings/billing?checkout=cancelled`,
    subscription_data: {
      metadata: {
        organization_id: input.organizationId,
        plan_id: input.planId,
        billing_cycle: input.billingCycle,
      },
    },
    metadata: {
      organization_id: input.organizationId,
      plan_id: input.planId,
      billing_cycle: input.billingCycle,
    },
  });

  if (!session.url) {
    throw new BillingError("Unable to create checkout session.", "STRIPE_ERROR");
  }

  return session.url;
}

export async function createStripePortalSession(
  customerId: string,
): Promise<string> {
  const stripe = getStripeClient();
  const baseUrl = getAppBaseUrl();

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${baseUrl}/settings/billing`,
  });

  return session.url;
}

export async function updateStripeSubscriptionPlan(input: {
  stripeSubscriptionId: string;
  planId: PlanId;
  billingCycle: BillingCycle;
}): Promise<void> {
  const stripe = getStripeClient();
  const subscription = await stripe.subscriptions.retrieve(
    input.stripeSubscriptionId,
  );
  const itemId = subscription.items.data[0]?.id;

  if (!itemId) {
    throw new BillingError("Stripe subscription item not found.", "STRIPE_ERROR");
  }

  await stripe.subscriptions.update(input.stripeSubscriptionId, {
    items: [
      {
        id: itemId,
        price: getStripePriceId(input.planId, input.billingCycle),
      },
    ],
    metadata: {
      plan_id: input.planId,
      billing_cycle: input.billingCycle,
    },
    proration_behavior: "create_prorations",
  });
}

export async function cancelStripeSubscriptionAtPeriodEnd(
  stripeSubscriptionId: string,
): Promise<void> {
  const stripe = getStripeClient();

  await stripe.subscriptions.update(stripeSubscriptionId, {
    cancel_at_period_end: true,
  });
}

export async function reactivateStripeSubscription(
  stripeSubscriptionId: string,
): Promise<void> {
  const stripe = getStripeClient();

  await stripe.subscriptions.update(stripeSubscriptionId, {
    cancel_at_period_end: false,
  });
}

export function getStripeSubscriptionPeriodEnd(
  subscription: Stripe.Subscription,
): number | null {
  const items = subscription.items?.data ?? [];

  if (items.length === 0) {
    return null;
  }

  return Math.max(...items.map((item) => item.current_period_end));
}

export function mapStripeSubscriptionStatus(
  status: Stripe.Subscription.Status,
): SubscriptionStatus {
  switch (status) {
    case "trialing":
      return "trialing";
    case "active":
      return "active";
    case "past_due":
      return "past_due";
    case "canceled":
      return "cancelled";
    case "incomplete":
      return "incomplete";
    case "incomplete_expired":
      return "incomplete_expired";
    case "paused":
      return "paused";
    default:
      return "cancelled";
  }
}

export function verifyStripeWebhookSignature(
  payload: string,
  signature: string | null,
): Stripe.Event {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new BillingError(
      "Stripe webhook secret is not configured.",
      "STRIPE_NOT_CONFIGURED",
    );
  }

  if (!signature) {
    throw new BillingError("Missing Stripe signature.", "INVALID_SIGNATURE");
  }

  const stripe = getStripeClient();
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}
