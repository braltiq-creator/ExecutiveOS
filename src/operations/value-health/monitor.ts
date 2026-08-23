import type { ValueHealthSnapshot } from "@/operations/observability/types";
import { listValueEstimates, computeExecutiveValueScore } from "@/growth";
import { listPilots } from "@/pilot";

export function monitorValueHealth(
  asOf = new Date().toISOString(),
): ValueHealthSnapshot {
  const pilots = listPilots();
  const scores: number[] = [];
  let declining = 0;
  let improving = 0;

  for (const pilot of pilots) {
    const estimates = listValueEstimates(pilot.tenantId);
    if (estimates.length === 0) {
      scores.push(55);
      continue;
    }
    try {
      const evs = computeExecutiveValueScore({
        organizationId: pilot.tenantId,
      });
      scores.push(evs.score);
      if (evs.score < 50) declining += 1;
      else if (evs.score >= 70) improving += 1;
    } catch {
      scores.push(55);
    }
  }

  const portfolioEvs =
    scores.length === 0
      ? 0
      : Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const state =
    portfolioEvs < 45 || declining >= 2
      ? "critical"
      : portfolioEvs < 60
        ? "degraded"
        : "healthy";

  return {
    asOf,
    portfolioEvs,
    decliningTenants: declining,
    improvingTenants: improving,
    state,
    trend: [{ at: asOf, value: portfolioEvs }],
    explanation: `Portfolio EVS ${portfolioEvs} · ${declining} declining · ${improving} improving.`,
  };
}
