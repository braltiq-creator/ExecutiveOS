import type { ExperimentationDashboard } from "@/experiments/framework/types";
import { listPilots } from "@/pilot";
import { listExperiments } from "@/experiments/experiments";
import { measurePilotIntelligence } from "@/experiments/pilot-intelligence";
import { measureFeatureAdoption } from "@/experiments/feature-adoption";
import { generateProductInsights, listCachedInsights } from "@/experiments/insights";
import { recommendRoadmapPriorities } from "@/experiments/roadmap";
import { buildCohortAnalytics } from "@/experiments/cohorts";
import { buildProfileAnalytics } from "@/experiments/analytics";
import { listInterviews } from "@/experiments/interviews";
import { buildPortfolioExperimentAnalytics } from "@/experiments/analytics/portfolio";
import { assertExperimentsPayload } from "@/experiments/framework";

export function buildExperimentationDashboard(input?: {
  asOf?: string;
}): ExperimentationDashboard {
  const asOf = input?.asOf ?? new Date().toISOString();
  const pilots = listPilots();

  const pilotIntelligence = pilots.map((p) =>
    measurePilotIntelligence({
      tenantId: p.tenantId,
      profileId: p.intelligenceProfileId,
      asOf,
    }),
  );

  const featureAdoption = pilots.map((p) =>
    measureFeatureAdoption({
      tenantId: p.tenantId,
      profileId: p.intelligenceProfileId,
      asOf,
    }),
  );

  for (const p of pilots) {
    generateProductInsights({
      tenantId: p.tenantId,
      profileId: p.intelligenceProfileId,
      asOf,
    });
  }

  const insights = listCachedInsights()
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 20);

  const portfolio = buildPortfolioExperimentAnalytics({
    asOf,
    intelligence: pilotIntelligence,
  });

  const dashboard: ExperimentationDashboard = {
    asOf,
    portfolio: {
      partnerCount: portfolio.partnerCount,
      runningExperiments: portfolio.runningExperiments,
      completedExperiments: portfolio.completedExperiments,
      validatedHypotheses: portfolio.validatedHypotheses,
      avgSuccessProbability: portfolio.avgSuccessProbability,
      avgAdoption: portfolio.avgAdoption,
      avgEngagement: portfolio.avgEngagement,
    },
    pilotIntelligence,
    experiments: listExperiments(),
    insights,
    roadmap: recommendRoadmapPriorities({
      asOf,
      insights,
      intelligence: pilotIntelligence,
    }).slice(0, 12),
    cohorts: buildCohortAnalytics(asOf, pilotIntelligence),
    profiles: buildProfileAnalytics({
      asOf,
      intelligence: pilotIntelligence,
      insights,
    }),
    featureAdoption,
    interviews: listInterviews().slice(0, 20),
  };

  assertExperimentsPayload(
    dashboard.portfolio as unknown as Record<string, unknown>,
  );
  for (const row of dashboard.pilotIntelligence) {
    assertExperimentsPayload({
      tenantId: row.tenantId,
      partnerLabel: row.partnerLabel,
      successProbability: row.metrics.successProbability.value,
    });
  }

  return dashboard;
}
