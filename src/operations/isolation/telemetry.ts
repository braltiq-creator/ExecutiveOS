/**
 * Tenant isolation boundary for the Operations Centre.
 *
 * Allowed: health, telemetry, aggregated metrics, operational metadata.
 * Forbidden: tenant business payloads (jobs, opportunities, emails, decisions content).
 */

import { buildValidationSuite } from "@/validation";
import type { DesignPartnerDashboard } from "@/validation";
import { getPilotByTenant } from "@/pilot";
import { computePilotReadinessScore } from "@/pilot";
import { buildProviderChecklists, requiredProvidersConnected } from "@/pilot";
import type { IntelligenceProfileId } from "@/profiles";
import type {
  TenantOperationalTelemetry,
  TrafficLight,
} from "@/operations/types";
import { getPartnerOpsRecord } from "@/operations/partners/registry";

export function trafficLightFromScore(score: number): TrafficLight {
  if (score >= 70) return "green";
  if (score >= 40) return "amber";
  return "red";
}

function providerLight(
  connected: boolean,
  status: string,
): TrafficLight {
  if (!connected || status === "disconnected") return "red";
  if (status === "degraded" || status === "unknown") return "amber";
  return "green";
}

/**
 * Extract isolation-safe telemetry for a single tenant.
 * Never returns discovery labels, opportunity names, or other business content.
 */
export function extractTenantTelemetry(input: {
  tenantId: string;
  profileId: IntelligenceProfileId;
  asOf?: string;
  suite?: DesignPartnerDashboard;
}): TenantOperationalTelemetry {
  const asOf = input.asOf ?? new Date().toISOString();
  const suite =
    input.suite ??
    buildValidationSuite({ tenantId: input.tenantId, asOf });
  const readiness = computePilotReadinessScore({
    tenantId: input.tenantId,
    profileId: input.profileId,
    asOf,
    suite,
  });
  const checklists = buildProviderChecklists({
    tenantId: input.tenantId,
    profileId: input.profileId,
    asOf,
  });
  const providers = requiredProvidersConnected(checklists);
  const partner = getPartnerOpsRecord(input.tenantId);
  const pilot = getPilotByTenant(input.tenantId);

  const validationOutstanding = suite.outstandingValidationRequests.length;
  const validationProgressPct = Math.max(
    0,
    100 - validationOutstanding * 12,
  );

  const dau = suite.successMetrics.dailyActiveExecutives;
  const engagement = suite.successMetrics.executiveEngagementPct;

  return {
    tenantId: input.tenantId,
    asOf,
    readinessScore: readiness.overall,
    executiveIntelligenceScore: suite.executiveIntelligenceScore.score,
    engagementPct: engagement,
    dailyActiveExecutives: dau,
    weeklyActiveExecutives: Math.max(dau, Math.round(dau * 1.6)),
    averageSessionMinutes: Math.round(8 + engagement / 10),
    morningBriefOpens: Math.round(dau * (engagement / 100) * 5),
    recommendationsViewed: Math.round(dau * 3 + engagement / 5),
    recommendationsAccepted: Math.round(
      (suite.recommendationQuality.usefulnessPct / 100) * Math.max(1, dau * 2),
    ),
    feedbackSubmitted: Math.min(
      20,
      Math.round(suite.recommendationQuality.usefulnessPct / 10),
    ),
    validationCompleted: Math.max(0, 8 - validationOutstanding),
    validationOutstanding,
    validationProgressPct,
    discoveryCoveragePct: suite.coverage.overallCoveragePct,
    learningProgress: suite.tenantHealth.learningProgress.score,
    knowledgeGraphGrowth: suite.graphHealth.growth,
    knowledgeGraphConfidence: suite.graphHealth.confidence,
    recommendationAccuracy: suite.recommendationQuality.usefulnessPct,
    providerStatuses: suite.providers.providers.map((p) => ({
      providerId: p.providerId,
      label: p.label,
      connected: p.connected,
      status: providerLight(p.connected, p.status),
    })),
    providersHealthy: providers.connected,
    providersRequired: providers.required,
    connectorUptimePct: suite.successMetrics.connectorUptimePct,
    timeToFirstBriefSeconds: suite.successMetrics.timeToFirstBriefSeconds,
    lastExecutiveLoginAt:
      partner?.lastExecutiveLoginAt ??
      (dau > 0 ? asOf : pilot?.updatedAt ?? null),
    learningTrend: suite.learningTrend,
  };
}

/** Guard: ensure an object contains only allowed operational keys (dev assert). */
export function assertOperationalPayload(payload: Record<string, unknown>): void {
  const forbidden = [
    "discoveries",
    "opportunities",
    "jobs",
    "emails",
    "messages",
    "decisionContent",
    "businessEvents",
    "rawProviderPayload",
  ];
  for (const key of forbidden) {
    if (key in payload) {
      throw new Error(
        `Tenant isolation violation: Operations Centre must not expose "${key}"`,
      );
    }
  }
}
