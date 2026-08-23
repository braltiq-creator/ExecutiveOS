import type { UpgradeRecommendation } from "@/growth/framework/types";
import type { PlanId } from "@/lib/billing/types";
import { getSubscriptionForOrganization } from "@/growth/subscriptions";
import { computeExecutiveValueScore } from "@/growth/executive-value";

const ORDER: PlanId[] = [
  "starter",
  "professional",
  "executive",
  "enterprise",
];

export function recommendUpgrades(organizationId: string): UpgradeRecommendation[] {
  const sub = getSubscriptionForOrganization(organizationId);
  const evs = computeExecutiveValueScore({ organizationId });
  const fromPlan = sub?.planId ?? "starter";
  const idx = ORDER.indexOf(fromPlan);
  const next = ORDER[idx + 1];
  if (!next) return [];

  const recommendations: UpgradeRecommendation[] = [];

  if (evs.last30Days >= 5000 || evs.score >= 60) {
    recommendations.push({
      id: `upg-${organizationId}-${next}`,
      organizationId,
      fromPlan,
      toPlan: next,
      rationale:
        "Measured executive value and engagement support expanding seats and reporting depth.",
      confidence: Math.min(90, 55 + Math.round(evs.score / 3)),
      milestone: "Value milestone reached",
    });
  }

  if (sub && sub.seatCount >= sub.seatLimit * 0.8) {
    recommendations.push({
      id: `upg-seats-${organizationId}`,
      organizationId,
      fromPlan,
      toPlan: next,
      rationale: "Seat utilisation is high — upgrade unlocks additional executives.",
      confidence: 78,
      milestone: "Seat utilisation ≥ 80%",
    });
  }

  return recommendations;
}
