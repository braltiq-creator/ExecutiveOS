/**
 * Benchmarking — peer percentile for Design Partners.
 */

import type { BenchmarkComparison } from "@/validation/types";

export function benchmarkTenant(input: {
  tenantId: string;
  overallScore: number;
  peerAverage?: number;
}): BenchmarkComparison {
  const peerAverage = input.peerAverage ?? 58;
  const overallDelta = input.overallScore - peerAverage;
  const peerPercentile = Math.max(
    5,
    Math.min(
      95,
      Math.round(50 + overallDelta * 1.6),
    ),
  );

  return {
    tenantId: input.tenantId,
    peerPercentile,
    overallDelta,
    explanation:
      overallDelta >= 0
        ? `Above peer average by ${overallDelta} points (≈${peerPercentile}th percentile).`
        : `Below peer average by ${Math.abs(overallDelta)} points (≈${peerPercentile}th percentile).`,
  };
}
