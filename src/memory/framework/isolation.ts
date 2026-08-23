/**
 * Tenant isolation for Organisational Memory.
 * Memory belongs only to the tenant — never shared.
 */

import type { AnonymisedMemoryTelemetry } from "@/memory/framework/types";

const FORBIDDEN = [
  "opportunities",
  "jobs",
  "emails",
  "customerNames",
  "dealAmounts",
  "rawProviderPayload",
  "crossTenantMemories",
];

export function assertMemoryPayload(payload: Record<string, unknown>): void {
  for (const key of FORBIDDEN) {
    if (key in payload) {
      throw new Error(
        `Tenant isolation violation: Organisational Memory must not expose "${key}"`,
      );
    }
  }
}

export function anonymiseMemoryTelemetry(input: {
  asOf: string;
  episodeCounts: number[];
  recallQualities: number[];
  patternCounts: number[];
}): AnonymisedMemoryTelemetry {
  const avg = (values: number[]) =>
    values.length === 0
      ? 0
      : Math.round(values.reduce((a, b) => a + b, 0) / values.length);

  return {
    asOf: input.asOf,
    partnerCount: input.episodeCounts.length,
    avgEpisodes: avg(input.episodeCounts),
    avgRecallQuality: avg(input.recallQualities),
    avgPatterns: avg(input.patternCounts),
    explanation:
      "Anonymised product telemetry only — customer memories are never shared across tenants.",
  };
}
