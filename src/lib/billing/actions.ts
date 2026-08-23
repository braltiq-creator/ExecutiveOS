"use server";

import { requireAuth } from "@/lib/auth/actions";
import {
  cancelSubscription,
  createBillingPortalSession,
  createCheckoutSession,
  downgradePlan,
  getBillingOverview,
  listAvailablePlans,
  reactivateSubscription,
  upgradePlan,
} from "@/lib/billing/service";
import type {
  BillingOverview,
  ChangePlanInput,
  CheckoutSessionInput,
  PlanRecord,
} from "@/lib/billing/types";
import { BillingError } from "@/lib/billing/types";
import { redirect } from "next/navigation";

export type BillingActionResult<T> = {
  error: string | null;
  data: T | null;
};

function formatError(error: unknown): string {
  if (error instanceof BillingError || error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

export async function loadBillingPageData(): Promise<{
  overview: BillingOverview;
  plans: PlanRecord[];
}> {
  const user = await requireAuth();
  const [overview, plans] = await Promise.all([
    getBillingOverview(user.id),
    listAvailablePlans(),
  ]);

  return { overview, plans };
}

export async function startCheckoutAction(
  input: CheckoutSessionInput,
): Promise<BillingActionResult<never>> {
  const user = await requireAuth();
  const url = await createCheckoutSession(user.id, user.email ?? null, input);
  redirect(url);
}

export async function openBillingPortalAction(): Promise<BillingActionResult<never>> {
  const user = await requireAuth();
  const url = await createBillingPortalSession(user.id);
  redirect(url);
}

export async function upgradePlanAction(
  input: ChangePlanInput,
): Promise<BillingActionResult<null>> {
  try {
    const user = await requireAuth();
    await upgradePlan(user.id, input);
    return { error: null, data: null };
  } catch (error) {
    return { error: formatError(error), data: null };
  }
}

export async function downgradePlanAction(
  input: ChangePlanInput,
): Promise<BillingActionResult<null>> {
  try {
    const user = await requireAuth();
    await downgradePlan(user.id, input);
    return { error: null, data: null };
  } catch (error) {
    return { error: formatError(error), data: null };
  }
}

export async function cancelSubscriptionAction(): Promise<BillingActionResult<null>> {
  try {
    const user = await requireAuth();
    await cancelSubscription(user.id);
    return { error: null, data: null };
  } catch (error) {
    return { error: formatError(error), data: null };
  }
}

export async function reactivateSubscriptionAction(): Promise<
  BillingActionResult<null>
> {
  try {
    const user = await requireAuth();
    await reactivateSubscription(user.id);
    return { error: null, data: null };
  } catch (error) {
    return { error: formatError(error), data: null };
  }
}
