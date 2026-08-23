/**
 * Pilot success metrics for implementation / CS reporting.
 */

import { buildValidationSuite } from "@/validation";
import type { DesignPartnerDashboard } from "@/validation";
import { getPilotByTenant } from "@/pilot/provisioning";
import { hoursBetweenStages } from "@/pilot/deployment";
import { computePilotReadinessScore } from "@/pilot/readiness";
import type { IntelligenceProfileId } from "@/profiles";
import type { PilotReadinessScore, PilotSuccessMetrics } from "@/pilot/types";

const readinessHistory = new Map<string, number[]>();

export function recordReadinessSample(
  tenantId: string,
  score: number,
): void {
  const list = readinessHistory.get(tenantId) ?? [];
  list.push(score);
  readinessHistory.set(tenantId, list.slice(-14));
}

export function resetReadinessHistory(): void {
  readinessHistory.clear();
}

export function measurePilotSuccess(input: {
  tenantId: string;
  profileId: IntelligenceProfileId;
  asOf?: string;
  suite?: DesignPartnerDashboard;
  readiness?: PilotReadinessScore;
}): PilotSuccessMetrics {
  const asOf = input.asOf ?? new Date().toISOString();
  const suite =
    input.suite ?? buildValidationSuite({ tenantId: input.tenantId, asOf });
  const readiness =
    input.readiness ??
    computePilotReadinessScore({ ...input, suite });
  recordReadinessSample(input.tenantId, readiness.overall);

  const pilot = getPilotByTenant(input.tenantId);
  const history = readinessHistory.get(input.tenantId) ?? [readiness.overall];
  const previous = history.length > 1 ? history[history.length - 2]! : readiness.overall;
  const trend: PilotSuccessMetrics["readinessTrend"] =
    readiness.overall > previous + 2
      ? "up"
      : readiness.overall < previous - 2
        ? "down"
        : "flat";

  const timeToFirstBriefMinutes =
    suite.successMetrics.timeToFirstBriefSeconds != null
      ? Math.round(suite.successMetrics.timeToFirstBriefSeconds / 60)
      : pilot
        ? (() => {
            const hours = hoursBetweenStages(
              pilot,
              "provisioning",
              "first_executive_brief",
            );
            return hours == null ? null : hours * 60;
          })()
        : null;

  const readinessHours = pilot
    ? hoursBetweenStages(pilot, "provisioning", "active_pilot")
    : null;

  const completionRate =
    pilot?.stage === "pilot_complete"
      ? 100
      : pilot?.stage === "review"
        ? 85
        : pilot?.stage === "active_pilot"
          ? 70
          : Math.min(60, readiness.overall);

  return {
    tenantId: input.tenantId,
    asOf,
    timeToFirstBriefMinutes,
    timeToOperationalReadinessHours: readinessHours,
    executiveEngagementPct: suite.successMetrics.executiveEngagementPct,
    dailyActiveUsers: suite.successMetrics.dailyActiveExecutives,
    recommendationUsefulnessPct:
      suite.successMetrics.recommendationUsefulnessPct,
    readinessTrend: trend,
    pilotCompletionRate: completionRate,
    explanation: [
      `Readiness ${readiness.overall}/100 (${trend}).`,
      timeToFirstBriefMinutes != null
        ? `Time to first brief ${timeToFirstBriefMinutes} min.`
        : "First brief timing not yet measured.",
      `Engagement ${suite.successMetrics.executiveEngagementPct}%.`,
    ].join(" "),
  };
}
