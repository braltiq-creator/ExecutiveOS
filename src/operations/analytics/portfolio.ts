/**
 * Portfolio analytics across Design Partners (aggregated only).
 */

import { listPilots } from "@/pilot";
import { syncPartnersFromPilots } from "@/operations/partners";
import { extractTenantTelemetry, trafficLightFromScore } from "@/operations/isolation";
import { computePilotOpsHealth } from "@/operations/health";
import type { PortfolioAnalytics } from "@/operations/types";

const healthTrend = new Map<string, number[]>();

export function resetPortfolioAnalyticsState(): void {
  healthTrend.clear();
}

export function buildPortfolioAnalytics(asOf = new Date().toISOString()): PortfolioAnalytics {
  syncPartnersFromPilots(asOf);
  const pilots = listPilots();
  if (pilots.length === 0) {
    return {
      asOf,
      partnerCount: 0,
      pilotCompletionRate: 0,
      averageReadiness: 0,
      averageEngagement: 0,
      averageIntelligenceScore: 0,
      providerReliability: 0,
      recommendationPerformance: 0,
      knowledgeGraphGrowth: 0,
      customerHealthTrends: [],
      strugglingPartners: [],
      explanation: "No Design Partners provisioned yet.",
    };
  }

  const rows = pilots.map((pilot) => {
    const t = extractTenantTelemetry({
      tenantId: pilot.tenantId,
      profileId: pilot.intelligenceProfileId,
      asOf,
    });
    const health = computePilotOpsHealth({
      tenantId: pilot.tenantId,
      profileId: pilot.intelligenceProfileId,
      asOf,
      telemetry: t,
    });
    const series = healthTrend.get(pilot.tenantId) ?? [];
    series.push(health.overall.score);
    healthTrend.set(pilot.tenantId, series.slice(-14));
    const prev = series.length > 1 ? series[series.length - 2]! : health.overall.score;
    const trend =
      health.overall.score > prev + 2
        ? ("up" as const)
        : health.overall.score < prev - 2
          ? ("down" as const)
          : ("flat" as const);
    return { pilot, t, health, trend };
  });

  const completed = pilots.filter(
    (p) => p.stage === "pilot_complete" || p.stage === "review",
  ).length;
  const avg = (values: number[]) =>
    Math.round(values.reduce((a, b) => a + b, 0) / values.length);

  const strugglingPartners = rows
    .filter((r) => r.health.overall.score < 55 || r.health.overall.trafficLight === "red")
    .map((r) => ({
      tenantId: r.pilot.tenantId,
      companyName: r.pilot.partnerName,
      reason:
        r.health.overall.gaps[0] ??
        `Health ${r.health.overall.score}/100 — early CS intervention recommended`,
      healthScore: r.health.overall.score,
    }));

  return {
    asOf,
    partnerCount: pilots.length,
    pilotCompletionRate: Math.round((completed / pilots.length) * 100),
    averageReadiness: avg(rows.map((r) => r.t.readinessScore)),
    averageEngagement: avg(rows.map((r) => r.t.engagementPct)),
    averageIntelligenceScore: avg(
      rows.map((r) => r.t.executiveIntelligenceScore),
    ),
    providerReliability: avg(rows.map((r) => r.t.connectorUptimePct || 0)),
    recommendationPerformance: avg(rows.map((r) => r.t.recommendationAccuracy)),
    knowledgeGraphGrowth: avg(rows.map((r) => r.t.knowledgeGraphGrowth)),
    customerHealthTrends: rows.map((r) => ({
      tenantId: r.pilot.tenantId,
      companyName: r.pilot.partnerName,
      healthScore: r.health.overall.score,
      trafficLight: trafficLightFromScore(r.health.overall.score),
      trend: r.trend,
    })),
    strugglingPartners,
    explanation: `Portfolio of ${pilots.length} partner(s): avg readiness ${avg(rows.map((r) => r.t.readinessScore))}, avg engagement ${avg(rows.map((r) => r.t.engagementPct))}%, ${strugglingPartners.length} needing attention.`,
  };
}
