import { listPilots } from "@/pilot";
import { listExperiments } from "@/experiments/experiments";
import { measurePilotIntelligence } from "@/experiments/pilot-intelligence";
import { buildProfileAnalytics } from "@/experiments/analytics/profile";
import { buildCohortAnalytics } from "@/experiments/cohorts";
import type { PilotIntelligenceSnapshot } from "@/experiments/framework/types";

export function buildPortfolioExperimentAnalytics(input?: {
  asOf?: string;
  intelligence?: PilotIntelligenceSnapshot[];
}) {
  const asOf = input?.asOf ?? new Date().toISOString();
  const pilots = listPilots();
  const experiments = listExperiments();
  const intelligence =
    input?.intelligence ??
    pilots.map((p) =>
      measurePilotIntelligence({
        tenantId: p.tenantId,
        profileId: p.intelligenceProfileId,
        asOf,
      }),
    );

  const avg = (values: number[]) =>
    values.length === 0
      ? 0
      : Math.round(values.reduce((a, b) => a + b, 0) / values.length);

  return {
    asOf,
    partnerCount: pilots.length,
    runningExperiments: experiments.filter((e) => e.status === "running")
      .length,
    completedExperiments: experiments.filter((e) => e.status === "completed")
      .length,
    validatedHypotheses: experiments.filter((e) => e.result === "validated")
      .length,
    avgSuccessProbability: avg(
      intelligence.map((i) => i.metrics.successProbability.value),
    ),
    avgAdoption: avg(intelligence.map((i) => i.metrics.executiveAdoption.value)),
    avgEngagement: avg(
      intelligence.map((i) => i.metrics.executiveEngagement.value),
    ),
    profiles: buildProfileAnalytics({ asOf, intelligence }),
    cohorts: buildCohortAnalytics(asOf, intelligence),
    trend: {
      activation: avg(
        intelligence.map((i) => i.metrics.executiveAdoption.value),
      ),
      retention: avg(
        intelligence.map((i) => i.metrics.executiveEngagement.value),
      ),
      engagement: avg(
        intelligence.map((i) => i.metrics.executiveEngagement.value),
      ),
      recommendationEffectiveness: avg(
        intelligence.map((i) => i.metrics.recommendationAcceptance.value),
      ),
    },
  };
}
