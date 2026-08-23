import type { PlanId } from "@/lib/billing/types";
import {
  activatePaidSubscription,
  startTrialSubscription,
} from "@/growth/subscriptions";
import { recordGrowthTelemetry } from "@/growth/telemetry";

export const GROWTH_PLANS: Array<{
  id: PlanId;
  name: string;
  tagline: string;
  monthlyFrom: number;
  highlights: string[];
}> = [
  {
    id: "starter",
    name: "Starter",
    tagline: "Single executive orientation",
    monthlyFrom: 990,
    highlights: ["Executive Brief", "1 provider pack", "14-day trial"],
  },
  {
    id: "professional",
    name: "Professional",
    tagline: "Operations or Commercial edition",
    monthlyFrom: 4500,
    highlights: [
      "Full edition providers",
      "Scenario packs",
      "Executive Value Score",
    ],
  },
  {
    id: "executive",
    name: "Executive",
    tagline: "Leadership team expansion",
    monthlyFrom: 7500,
    highlights: ["Additional seats", "ROI reports", "Priority activation"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "Multi-edition + governance",
    monthlyFrom: 15000,
    highlights: ["SSO-ready", "Audit export", "Dedicated success"],
  },
];

/** Self-service checkout facade — pairs with Stripe actions in UI. */
export function beginSelfServiceCheckout(input: {
  organizationId: string;
  planId: PlanId;
  mode: "trial" | "paid";
  billingCycle?: "monthly" | "annual";
}) {
  recordGrowthTelemetry({
    organizationId: input.organizationId,
    name: "checkout_started",
    properties: { planId: input.planId, mode: input.mode },
  });

  if (input.mode === "trial") {
    const sub = startTrialSubscription({
      organizationId: input.organizationId,
      planId: input.planId,
      billingCycle: input.billingCycle,
    });
    return {
      subscription: sub,
      nextPath: "/activate",
      message: "Trial started — connect providers to unlock your first brief",
    };
  }

  const sub = activatePaidSubscription({
    organizationId: input.organizationId,
    planId: input.planId,
    billingCycle: input.billingCycle,
  });
  return {
    subscription: sub,
    nextPath: "/activate",
    message: "Subscription active — continue activation",
  };
}
