/**
 * Tenant isolation for Outcomes Engine.
 * Never compares customer business outcomes across tenants.
 */

import type { AnonymisedOutcomesTelemetry } from "@/outcomes/framework/types";

const FORBIDDEN = [
  "opportunities",
  "jobs",
  "emails",
  "customerNames",
  "dealAmounts",
  "rawProviderPayload",
];

export function assertOutcomesPayload(payload: Record<string, unknown>): void {
  for (const key of FORBIDDEN) {
    if (key in payload) {
      throw new Error(
        `Tenant isolation violation: Outcomes Engine must not expose "${key}"`,
      );
    }
  }
}

/** Portfolio telemetry — counts and rates only. */
export function anonymisePortfolioTelemetry(input: {
  asOf: string;
  confirmationRates: number[];
  influenceScores: number[];
  roiMids: number[];
}): AnonymisedOutcomesTelemetry {
  const avg = (values: number[]) =>
    values.length === 0
      ? 0
      : Math.round(values.reduce((a, b) => a + b, 0) / values.length);

  return {
    asOf: input.asOf,
    partnerCount: input.confirmationRates.length,
    avgConfirmationRate: avg(input.confirmationRates),
    avgInfluenceScore: avg(input.influenceScores),
    avgRoiMid: avg(input.roiMids),
    explanation:
      "Anonymised aggregated product telemetry only — no customer business outcomes compared.",
  };
}
