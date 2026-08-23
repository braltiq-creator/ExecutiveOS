/**
 * Customer Success operating helpers — wraps success plans + health signals.
 */

import { listSuccessPlans, updateSuccessPlan } from "@/commercial/success-plans";
import type { SuccessPlan } from "@/commercial/framework/types";

export function assessSuccessPlanHealth(plan: SuccessPlan): SuccessPlan["health"] {
  const complete = plan.successMilestones.filter((m) => m.complete).length;
  const ratio = complete / Math.max(1, plan.successMilestones.length);
  if (plan.risks.length >= 3 || ratio < 0.25) return "red";
  if (plan.risks.length > 0 || ratio < 0.67) return "amber";
  return "green";
}

export function refreshSuccessPlanHealth(planId: string): SuccessPlan | null {
  const plan = listSuccessPlans().find((p) => p.id === planId);
  if (!plan) return null;
  return updateSuccessPlan(planId, {
    health: assessSuccessPlanHealth(plan),
  });
}

export {
  createSuccessPlan,
  updateSuccessPlan,
  listSuccessPlans,
} from "@/commercial/success-plans";
