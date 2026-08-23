import {
  insertSubscriptionRecord,
  updateOrganizationPlanField,
  updateSubscriptionRecord,
} from "@/lib/billing/mutations";
import {
  fetchPaymentHistory,
  fetchPlanById,
  fetchPlans,
  fetchSubscriptionByOrganizationId,
} from "@/lib/billing/queries";
import {
  cancelStripeSubscriptionAtPeriodEnd,
  createStripeCheckoutSession,
  createStripeCustomer,
  createStripePortalSession,
  reactivateStripeSubscription,
  updateStripeSubscriptionPlan,
} from "@/lib/billing/stripe";
import { getOrganizationUsageSnapshot, incrementUsage } from "@/lib/billing/usage";
import { validateChangePlanInput, validateCheckoutInput } from "@/lib/billing/validation";
import {
  fetchOrganizationInvitations,
  fetchOrganizationMembers,
} from "@/lib/organizations/queries";
import type {
  BillingOverview,
  ChangePlanInput,
  CheckoutSessionInput,
  PlanRecord,
  SeatLicenseSnapshot,
  SubscriptionRecord,
} from "@/lib/billing/types";
import { BillingError, isPaidSubscriptionStatus } from "@/lib/billing/types";
import { canUpdateOrganizationSettings } from "@/lib/organizations/permissions";
import type { OrganizationMembership } from "@/lib/organizations/types";
import { fetchActiveMembership } from "@/lib/organizations/queries";

const TRIAL_DAYS = 14;

export async function ensureOrganizationSubscription(
  organizationId: string,
): Promise<SubscriptionRecord> {
  const existing = await fetchSubscriptionByOrganizationId(organizationId);

  if (existing) {
    return existing;
  }

  const starterPlan = await fetchPlanById("starter");

  if (!starterPlan) {
    throw new BillingError("Starter plan not found.", "PLAN_NOT_FOUND");
  }

  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + TRIAL_DAYS);

  const subscription = await insertSubscriptionRecord({
    organizationId,
    plan: "starter",
    seatLimit: starterPlan.seat_limit,
    status: "trialing",
    billingCycle: "monthly",
    trialEndsAt: trialEndsAt.toISOString(),
  });

  await updateOrganizationPlanField(organizationId, "starter");
  return subscription;
}

async function requireBillingAdmin(userId: string): Promise<OrganizationMembership> {
  const membership = await fetchActiveMembership(userId);

  if (!membership) {
    throw new BillingError("Organization membership required.", "NOT_MEMBER");
  }

  if (!canUpdateOrganizationSettings(membership.member.role)) {
    throw new BillingError("Permission denied.", "FORBIDDEN");
  }

  return membership;
}

export async function getBillingOverview(userId: string): Promise<BillingOverview> {
  const membership = await requireBillingAdmin(userId);
  const organizationId = membership.organization.id;
  const subscription = await ensureOrganizationSubscription(organizationId);
  const plan = await fetchPlanById(subscription.plan);

  if (!plan) {
    throw new BillingError("Plan not found.", "PLAN_NOT_FOUND");
  }

  const [usage, payments, members, invitations] = await Promise.all([
    getOrganizationUsageSnapshot(organizationId, membership.organization.created_by),
    fetchPaymentHistory(organizationId),
    fetchOrganizationMembers(organizationId),
    fetchOrganizationInvitations(organizationId),
  ]);

  const activeMembers = members.filter((member) => member.status === "active").length;
  const seatsUsed = activeMembers;
  const pendingInvitations = invitations.length;
  const seatLimit = subscription.seat_limit;
  const seatsAvailable = Math.max(seatLimit - seatsUsed - pendingInvitations, 0);

  await updateSubscriptionRecord(organizationId, {
    seat_count: seatsUsed,
    seat_limit: plan.seat_limit,
  });

  const aiUsagePercent = plan.ai_request_limit
    ? Math.min(Math.round((usage.ai_requests / plan.ai_request_limit) * 100), 100)
    : 0;

  const storageUsagePercent = plan.storage_limit
    ? Math.min(Math.round((Number(usage.storage_bytes) / plan.storage_limit) * 100), 100)
    : 0;

  return {
    subscription: {
      ...subscription,
      seat_count: seatsUsed,
      seat_limit: plan.seat_limit,
    },
    plan,
    usage,
    payments,
    seatsUsed,
    seatsAvailable,
    pendingInvitations,
    aiUsagePercent,
    storageUsagePercent,
    paymentMethodSummary: subscription.stripe_customer_id
      ? "Managed in Stripe Customer Portal"
      : null,
  };
}

export async function listAvailablePlans(): Promise<PlanRecord[]> {
  return fetchPlans();
}

export async function createCheckoutSession(
  userId: string,
  email: string | null,
  input: CheckoutSessionInput,
): Promise<string> {
  const membership = await requireBillingAdmin(userId);
  const validated = validateCheckoutInput(input);
  const subscription = await ensureOrganizationSubscription(
    membership.organization.id,
  );

  let customerId = subscription.stripe_customer_id;

  if (!customerId) {
    if (!email) {
      throw new BillingError(
        "An email address is required to start checkout.",
        "EMAIL_REQUIRED",
      );
    }

    customerId = await createStripeCustomer({
      organizationId: membership.organization.id,
      organizationName: membership.organization.name,
      email,
    });

    await updateSubscriptionRecord(membership.organization.id, {
      stripe_customer_id: customerId,
    });
  }

  return createStripeCheckoutSession({
    customerId,
    organizationId: membership.organization.id,
    planId: validated.planId,
    billingCycle: validated.billingCycle,
  });
}

export async function createBillingPortalSession(userId: string): Promise<string> {
  const membership = await requireBillingAdmin(userId);
  const subscription = await ensureOrganizationSubscription(
    membership.organization.id,
  );

  if (!subscription.stripe_customer_id) {
    throw new BillingError(
      "No Stripe customer exists for this organization yet.",
      "NO_CUSTOMER",
    );
  }

  return createStripePortalSession(subscription.stripe_customer_id);
}

export async function upgradePlan(
  userId: string,
  input: ChangePlanInput,
): Promise<void> {
  await changePlan(userId, input, "upgrade");
}

export async function downgradePlan(
  userId: string,
  input: ChangePlanInput,
): Promise<void> {
  await changePlan(userId, input, "downgrade");
}

async function changePlan(
  userId: string,
  input: ChangePlanInput,
  _direction: "upgrade" | "downgrade",
): Promise<void> {
  const membership = await requireBillingAdmin(userId);
  const validated = validateChangePlanInput(input);
  const subscription = await ensureOrganizationSubscription(
    membership.organization.id,
  );
  const plan = await fetchPlanById(validated.planId);

  if (!plan) {
    throw new BillingError("Plan not found.", "PLAN_NOT_FOUND");
  }

  const billingCycle = validated.billingCycle ?? subscription.billing_cycle;

  if (subscription.stripe_subscription_id) {
    await updateStripeSubscriptionPlan({
      stripeSubscriptionId: subscription.stripe_subscription_id,
      planId: validated.planId,
      billingCycle,
    });
  }

  await updateSubscriptionRecord(membership.organization.id, {
    plan: validated.planId,
    billing_cycle: billingCycle,
    seat_limit: plan.seat_limit,
    status: isPaidSubscriptionStatus(subscription.status)
      ? subscription.status
      : "active",
  });

  await updateOrganizationPlanField(membership.organization.id, validated.planId);
}

export async function cancelSubscription(userId: string): Promise<void> {
  const membership = await requireBillingAdmin(userId);
  const subscription = await ensureOrganizationSubscription(
    membership.organization.id,
  );

  if (subscription.stripe_subscription_id) {
    await cancelStripeSubscriptionAtPeriodEnd(subscription.stripe_subscription_id);
  }

  await updateSubscriptionRecord(membership.organization.id, {
    cancelled_at: new Date().toISOString(),
  });
}

export async function reactivateSubscription(userId: string): Promise<void> {
  const membership = await requireBillingAdmin(userId);
  const subscription = await ensureOrganizationSubscription(
    membership.organization.id,
  );

  if (!subscription.stripe_subscription_id) {
    throw new BillingError("No active Stripe subscription to reactivate.", "NO_SUBSCRIPTION");
  }

  await reactivateStripeSubscription(subscription.stripe_subscription_id);

  await updateSubscriptionRecord(membership.organization.id, {
    cancelled_at: null,
    status: "active",
  });
}

export async function getSeatLicenseSnapshot(
  organizationId: string,
): Promise<SeatLicenseSnapshot> {
  const subscription = await ensureOrganizationSubscription(organizationId);
  const [members, invitations] = await Promise.all([
    fetchOrganizationMembers(organizationId),
    fetchOrganizationInvitations(organizationId),
  ]);

  const seatsUsed = members.filter((member) => member.status === "active").length;
  const pendingInvitations = invitations.length;
  const seatLimit = subscription.seat_limit;
  const seatsAvailable = Math.max(seatLimit - seatsUsed - pendingInvitations, 0);

  return {
    seatsUsed,
    seatLimit,
    seatsAvailable,
    pendingInvitations,
    isAtLimit: seatsUsed + pendingInvitations >= seatLimit,
    isOverLimit: seatsUsed + pendingInvitations > seatLimit,
  };
}

export async function assertSeatAvailable(organizationId: string): Promise<void> {
  const seats = await getSeatLicenseSnapshot(organizationId);

  if (seats.isAtLimit) {
    throw new BillingError(
      `Seat limit reached (${seats.seatLimit}). Upgrade your plan or remove pending invitations.`,
      "SEAT_LIMIT_REACHED",
    );
  }
}

export async function recordAiRequestUsage(userId: string): Promise<void> {
  const membership = await fetchActiveMembership(userId);

  if (!membership) {
    return;
  }

  await incrementUsage(membership.organization.id, "ai_requests", 1);
}

export { incrementUsage };
