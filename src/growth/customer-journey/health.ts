import type { CustomerHealthSignal } from "@/growth/framework/types";
import { getCustomerJourney, activationProgressPct } from "@/growth/activation";
import { computeExecutiveValueScore } from "@/growth/executive-value";
import { getSubscriptionForOrganization } from "@/growth/subscriptions";

export function assessCustomerHealth(
  organizationId: string,
): CustomerHealthSignal {
  const journey = getCustomerJourney(organizationId);
  const evs = computeExecutiveValueScore({ organizationId });
  const sub = getSubscriptionForOrganization(organizationId);
  const activationPct = journey
    ? activationProgressPct(journey.steps)
    : 0;
  const engagementPct = Math.min(100, Math.round(evs.score * 0.9 + 8));

  let health: CustomerHealthSignal["health"] = "green";
  let renewalRisk: CustomerHealthSignal["renewalRisk"] = "low";
  if (activationPct < 50 || evs.score < 40) {
    health = "red";
    renewalRisk = "high";
  } else if (activationPct < 80 || evs.score < 55 || sub?.status === "past_due") {
    health = "amber";
    renewalRisk = "medium";
  }

  return {
    organizationId,
    health,
    activationPct,
    engagementPct,
    valueScore: evs.score,
    renewalRisk,
    explanation: `Activation ${activationPct}%, EVS ${evs.score}, subscription ${sub?.status ?? "none"}.`,
  };
}
