import type { BillingCycle, ChangePlanInput, PlanId } from "@/lib/billing/types";
import { BillingError } from "@/lib/billing/types";

export function validateCheckoutInput(input: {
  planId: string;
  billingCycle: string;
}): { planId: PlanId; billingCycle: BillingCycle } {
  if (!["starter", "professional", "executive", "enterprise"].includes(input.planId)) {
    throw new BillingError("Invalid plan selected.", "VALIDATION_ERROR");
  }

  if (!["monthly", "annual"].includes(input.billingCycle)) {
    throw new BillingError("Invalid billing cycle.", "VALIDATION_ERROR");
  }

  return {
    planId: input.planId as PlanId,
    billingCycle: input.billingCycle as BillingCycle,
  };
}

export function validateChangePlanInput(input: ChangePlanInput): ChangePlanInput {
  if (!["starter", "professional", "executive", "enterprise"].includes(input.planId)) {
    throw new BillingError("Invalid plan selected.", "VALIDATION_ERROR");
  }

  if (
    input.billingCycle &&
    !["monthly", "annual"].includes(input.billingCycle)
  ) {
    throw new BillingError("Invalid billing cycle.", "VALIDATION_ERROR");
  }

  return input;
}
