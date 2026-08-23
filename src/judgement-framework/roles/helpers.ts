import type { FactorWeight, JudgementFactorId } from "@/judgement-framework/types";

export function weights(
  entries: Array<[JudgementFactorId, number, string]>,
): FactorWeight[] {
  return entries.map(([factor, weight, interpretation]) => ({
    factor,
    weight,
    interpretation,
  }));
}

export const EJF_V1 = { major: 1, minor: 0, patch: 0 } as const;
