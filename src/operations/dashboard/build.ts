/**
 * Design Partner Operations Centre dashboard builder.
 */

import { listPilots } from "@/pilot";
import { syncPartnersFromPilots, getPartnerOpsRecord } from "@/operations/partners";
import {
  extractTenantTelemetry,
  trafficLightFromScore,
} from "@/operations/isolation";
import { computePilotOpsHealth } from "@/operations/health";
import { evaluateOpsAlerts, listOpenOpsAlerts } from "@/operations/alerts";
import { detectSupportPatterns } from "@/operations/support";
import { buildPortfolioAnalytics } from "@/operations/analytics";
import { buildOperationalExcellenceDashboard } from "@/operations/observability/build";
import type {
  OperationsCentreDashboard,
  OpsPartnerDashboardRow,
} from "@/operations/types";

function aggregateProviderLight(
  statuses: Array<{ status: "green" | "amber" | "red" }>,
): "green" | "amber" | "red" {
  if (statuses.some((s) => s.status === "red")) return "red";
  if (statuses.some((s) => s.status === "amber")) return "amber";
  return statuses.length ? "green" : "red";
}

export function buildPartnerDashboardRow(input: {
  tenantId: string;
  profileId: import("@/profiles").IntelligenceProfileId;
  companyName: string;
  industry: string;
  pilotStage: import("@/pilot").PilotLifecycleStage;
  asOf?: string;
}): OpsPartnerDashboardRow {
  const asOf = input.asOf ?? new Date().toISOString();
  const t = extractTenantTelemetry({
    tenantId: input.tenantId,
    profileId: input.profileId,
    asOf,
  });
  const health = computePilotOpsHealth({
    tenantId: input.tenantId,
    profileId: input.profileId,
    asOf,
    telemetry: t,
  });
  const partner = getPartnerOpsRecord(input.tenantId);
  const providers = aggregateProviderLight(t.providerStatuses);

  return {
    tenantId: input.tenantId,
    companyName: input.companyName,
    intelligenceProfileId: input.profileId,
    industry: input.industry,
    pilotStage: input.pilotStage,
    readinessScore: t.readinessScore,
    executiveIntelligenceScore: t.executiveIntelligenceScore,
    lastExecutiveLoginAt:
      partner?.lastExecutiveLoginAt ?? t.lastExecutiveLoginAt,
    activeExecutives: t.dailyActiveExecutives,
    providerStatus: providers,
    knowledgeGraphGrowth: t.knowledgeGraphGrowth,
    recommendationAccuracy: t.recommendationAccuracy,
    validationProgress: t.validationProgressPct,
    overallHealth: health.overall.trafficLight,
    overallHealthScore: health.overall.score,
    trafficLights: {
      readiness: trafficLightFromScore(t.readinessScore),
      intelligence: trafficLightFromScore(t.executiveIntelligenceScore),
      engagement: trafficLightFromScore(t.engagementPct),
      providers,
      graph: trafficLightFromScore(t.knowledgeGraphConfidence),
      validation: trafficLightFromScore(t.validationProgressPct),
      overall: health.overall.trafficLight,
    },
  };
}

export function buildOperationsCentreDashboard(
  asOf = new Date().toISOString(),
): OperationsCentreDashboard {
  syncPartnersFromPilots(asOf);
  const pilots = listPilots();
  const partners = pilots.map((pilot) => {
    evaluateOpsAlerts({
      tenantId: pilot.tenantId,
      profileId: pilot.intelligenceProfileId,
      companyName: pilot.partnerName,
      asOf,
    });
    return buildPartnerDashboardRow({
      tenantId: pilot.tenantId,
      profileId: pilot.intelligenceProfileId,
      companyName: pilot.partnerName,
      industry: pilot.industry,
      pilotStage: pilot.stage,
      asOf,
    });
  });

  const healthByTenant: OperationsCentreDashboard["healthByTenant"] = {};
  for (const pilot of pilots) {
    healthByTenant[pilot.tenantId] = computePilotOpsHealth({
      tenantId: pilot.tenantId,
      profileId: pilot.intelligenceProfileId,
      asOf,
    });
  }

  return {
    asOf,
    partners,
    analytics: buildPortfolioAnalytics(asOf),
    openAlerts: listOpenOpsAlerts(),
    supportPatterns: detectSupportPatterns(),
    healthByTenant,
    excellence: buildOperationalExcellenceDashboard(asOf),
  };
}
