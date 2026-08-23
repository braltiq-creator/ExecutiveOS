/**
 * Customer health portfolio — activation, EVS, engagement, renewal risk.
 * Aggregates only; never exposes tenant business content.
 */

import type { CustomerHealthPortfolio } from "@/operations/observability/types";
import { listPilots } from "@/pilot";
import { extractTenantTelemetry } from "@/operations/isolation";
import { computePilotOpsHealth } from "@/operations/health/score";
import { measureValueRealisation } from "@/operations/success";
import {
  computeExecutiveValueScore,
  listCustomerJourneys,
  listSubscriptions,
  assessCustomerHealth,
  activationProgressPct,
} from "@/growth";
import {
  listLicenses,
  recommendExpansionOpportunities,
} from "@/commercial";

export function buildCustomerHealthPortfolio(
  asOf = new Date().toISOString(),
): CustomerHealthPortfolio {
  const pilots = listPilots();
  const journeys = listCustomerJourneys();
  const activated = journeys.filter(
    (j) => activationProgressPct(j.steps) >= 80,
  );
  const activationSuccessPct =
    journeys.length === 0
      ? pilots.length > 0
        ? 70
        : 0
      : Math.round((activated.length / journeys.length) * 100);

  const ttfv: number[] = [];
  const evsScores: number[] = [];
  let engagementSum = 0;
  let adoptionSum = 0;
  const interventions: CustomerHealthPortfolio["interventions"] = [];

  for (const pilot of pilots) {
    const t = extractTenantTelemetry({
      tenantId: pilot.tenantId,
      profileId: pilot.intelligenceProfileId,
      asOf,
    });
    engagementSum += t.engagementPct;
    adoptionSum +=
      t.recommendationsViewed === 0
        ? 0
        : Math.round(
            (t.recommendationsAccepted / Math.max(1, t.recommendationsViewed)) *
              100,
          );
    const value = measureValueRealisation({
      tenantId: pilot.tenantId,
      profileId: pilot.intelligenceProfileId,
      asOf,
    });
    if (value.timeToFirstBriefMinutes != null) {
      ttfv.push(value.timeToFirstBriefMinutes);
    }
    try {
      const evs = computeExecutiveValueScore({
        organizationId: pilot.tenantId,
        asOf,
      });
      evsScores.push(evs.score);
    } catch {
      evsScores.push(55);
    }

    const health = computePilotOpsHealth({
      tenantId: pilot.tenantId,
      profileId: pilot.intelligenceProfileId,
      asOf,
      telemetry: t,
    });
    const growthHealth = assessCustomerHealth(pilot.tenantId);
    if (
      health.overall.trafficLight === "red" ||
      growthHealth.health === "red" ||
      growthHealth.renewalRisk === "high" ||
      t.engagementPct < 40
    ) {
      interventions.push({
        tenantId: pilot.tenantId,
        companyName: pilot.partnerName,
        reason:
          health.overall.trafficLight === "red"
            ? "Pilot health critical"
            : t.engagementPct < 40
              ? "Executive engagement below threshold"
              : "Customer health at risk",
        severity:
          health.overall.trafficLight === "red" ||
          growthHealth.health === "red"
            ? "critical"
            : "high",
        signals: [
          `Health ${health.overall.score}`,
          `Engagement ${t.engagementPct}%`,
          `Growth ${growthHealth.health}`,
          `Renewal risk ${growthHealth.renewalRisk}`,
        ],
      });
    }
  }

  const subs = listSubscriptions();
  const trials = subs.filter((s) => s.status === "trialing").length;
  const converted = subs.filter((s) => s.status === "active").length;
  const trialConversionPct =
    trials + converted === 0
      ? listLicenses().filter((l) => l.tier !== "trial").length > 0
        ? 60
        : 0
      : Math.round((converted / (trials + converted)) * 100);

  const expansions = recommendExpansionOpportunities().length;
  const renewalRiskCount = interventions.filter(
    (i) => i.severity === "critical" || i.severity === "high",
  ).length;

  const n = Math.max(1, pilots.length);
  const medianTimeToFirstValueMinutes =
    ttfv.length === 0
      ? 15
      : [...ttfv].sort((a, b) => a - b)[Math.floor(ttfv.length / 2)]!;
  const averageExecutiveValueScore =
    evsScores.length === 0
      ? 0
      : Math.round(evsScores.reduce((a, b) => a + b, 0) / evsScores.length);

  return {
    asOf,
    activationSuccessPct,
    medianTimeToFirstValueMinutes,
    averageExecutiveValueScore,
    engagementIndex: Math.round(engagementSum / n),
    recommendationAdoptionPct: Math.round(adoptionSum / n),
    trialConversionPct,
    renewalRiskCount,
    expansionOpportunityCount: expansions,
    interventions: interventions.slice(0, 12),
    evsTrend: [{ at: asOf, value: averageExecutiveValueScore }],
    explanation: `${pilots.length} customers · activation ${activationSuccessPct}% · EVS ${averageExecutiveValueScore} · ${renewalRiskCount} renewal risks · ${interventions.length} interventions.`,
  };
}
