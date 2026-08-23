import type { ReasoningStep } from "@/trust/framework/types";

/** Ordered labels for interactive decision-path UI. */
export function decisionPathLabels(path: ReasoningStep[]): string[] {
  return path.map((step) => step.label);
}

export function findDecisionPathStep(
  path: ReasoningStep[],
  id: ReasoningStep["id"],
): ReasoningStep | undefined {
  return path.find((step) => step.id === id);
}
