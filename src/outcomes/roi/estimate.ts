/**
 * ROI estimates — ranges with explicit assumptions.
 */

import type { IntelligenceProfileId } from "@/profiles";
import { measureValueRealisation } from "@/outcomes/value-realisation";
import type { RoiEstimate } from "@/outcomes/framework/types";

export function estimateOutcomesRoi(input: {
  tenantId: string;
  profileId: IntelligenceProfileId;
  asOf?: string;
  /** Assumed monthly platform cost for range framing */
  assumedMonthlyCostUsd?: number;
}): RoiEstimate {
  const asOf = input.asOf ?? new Date().toISOString();
  const value = measureValueRealisation(input);
  const cost = input.assumedMonthlyCostUsd ?? 5_000;
  const monthlyValueLow = value.businessValueCreated.low / 3;
  const monthlyValueMid = value.businessValueCreated.mid / 3;
  const monthlyValueHigh = value.businessValueCreated.high / 3;

  const roi = (v: number) =>
    cost <= 0 ? 0 : Math.round(((v - cost) / cost) * 100);

  const payback = (v: number) =>
    v <= 0 ? 52 : Math.max(1, Math.round((cost / v) * 4));

  return {
    tenantId: input.tenantId,
    asOf,
    estimatedRoi: {
      low: roi(monthlyValueLow),
      mid: roi(monthlyValueMid),
      high: roi(monthlyValueHigh),
      unit: "percent",
      confidence: Math.min(value.businessValueCreated.confidence, 50),
      explanation:
        "ROI is an indicative range based on estimated value vs assumed cost — not audited finance.",
    },
    paybackWeeks: {
      low: payback(monthlyValueHigh),
      mid: payback(monthlyValueMid),
      high: payback(monthlyValueLow),
      unit: "score",
      confidence: Math.min(value.businessValueCreated.confidence, 50),
      explanation: "Estimated payback weeks (range).",
    },
    explanation: `Indicative ROI mid ${roi(monthlyValueMid)}% with confidence ${Math.min(value.businessValueCreated.confidence, 50)}%.`,
    assumptions: [
      `Assumed monthly platform cost $${cost.toLocaleString()}`,
      "Business value is estimated mid-case from confirmed/observed outcomes",
      "Does not include implementation labour unless recorded as outcomes",
      "Not a substitute for customer finance systems",
    ],
  };
}
