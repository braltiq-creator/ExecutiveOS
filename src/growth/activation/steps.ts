import type { ActivationStep, ActivationStepId } from "@/growth/framework/types";

export const ACTIVATION_STEP_ORDER: ActivationStepId[] = [
  "account_created",
  "plan_selected",
  "checkout_complete",
  "microsoft_connected",
  "provider_connected",
  "data_validated",
  "executive_discovery",
  "profile_created",
  "knowledge_graph_ready",
  "scenarios_ready",
  "first_brief_ready",
  "value_explained",
];

const LABELS: Record<ActivationStepId, string> = {
  account_created: "Account created",
  plan_selected: "Plan selected",
  checkout_complete: "Checkout complete",
  microsoft_connected: "Microsoft 365 connected",
  provider_connected: "Simpro or Salesforce connected",
  data_validated: "Data validated",
  executive_discovery: "Executive Discovery complete",
  profile_created: "Executive profile created",
  knowledge_graph_ready: "Knowledge graph initialised",
  scenarios_ready: "Scenarios ready",
  first_brief_ready: "First Executive Brief ready",
  value_explained: "Business value explained",
};

export function createActivationSteps(
  initialComplete: ActivationStepId[] = ["account_created"],
): ActivationStep[] {
  return ACTIVATION_STEP_ORDER.map((id) => {
    const complete = initialComplete.includes(id);
    return {
      id,
      label: LABELS[id],
      status: complete ? "complete" : id === initialComplete.at(-1) ? "complete" : "pending",
      completedAt: complete ? new Date().toISOString() : null,
      detail: LABELS[id],
    };
  });
}

export function activationProgressPct(steps: ActivationStep[]): number {
  const complete = steps.filter((s) => s.status === "complete").length;
  return Math.round((complete / Math.max(1, steps.length)) * 100);
}
