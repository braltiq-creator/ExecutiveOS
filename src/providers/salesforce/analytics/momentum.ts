/**
 * Commercial analytics helpers — forecast confidence & momentum.
 */

export function computeCommercialMomentum(input: {
  wonValue: number;
  lostValue: number;
  atRiskDealCount: number;
}): { level: "healthy" | "watch" | "strained" | "critical"; label: string; detail: string } {
  if (input.lostValue > input.wonValue && input.atRiskDealCount > 0) {
    return {
      level: "strained",
      label: "Momentum under pressure",
      detail: "Losses and at-risk deals are slowing commercial momentum.",
    };
  }
  if (input.wonValue >= input.lostValue) {
    return {
      level: "healthy",
      label: "Momentum building",
      detail: "Secured revenue is outpacing losses.",
    };
  }
  return {
    level: "watch",
    label: "Momentum mixed",
    detail: "Watch conversion quality and at-risk pursuits.",
  };
}
