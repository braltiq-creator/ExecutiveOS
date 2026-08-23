/**
 * Executive engagement — objective metrics + trend history.
 */

import type { IntelligenceProfileId } from "@/profiles";
import { extractTenantTelemetry } from "@/operations/isolation";
import type { EngagementSnapshot } from "@/operations/types";

const history = new Map<string, Array<{ at: string; dau: number; engagementPct: number }>>();

export function resetEngagementHistory(): void {
  history.clear();
}

export function recordEngagementSample(input: {
  tenantId: string;
  at: string;
  dau: number;
  engagementPct: number;
}): void {
  const list = history.get(input.tenantId) ?? [];
  list.push({
    at: input.at,
    dau: input.dau,
    engagementPct: input.engagementPct,
  });
  history.set(input.tenantId, list.slice(-28));
}

export function measureEngagement(input: {
  tenantId: string;
  profileId: IntelligenceProfileId;
  asOf?: string;
}): EngagementSnapshot {
  const asOf = input.asOf ?? new Date().toISOString();
  const t = extractTenantTelemetry({ ...input, asOf });
  recordEngagementSample({
    tenantId: input.tenantId,
    at: asOf,
    dau: t.dailyActiveExecutives,
    engagementPct: t.engagementPct,
  });
  const series = history.get(input.tenantId) ?? [
    { at: asOf, dau: t.dailyActiveExecutives, engagementPct: t.engagementPct },
  ];
  const previous = series.length > 1 ? series[series.length - 2]! : series[0]!;
  const trend: EngagementSnapshot["trend"] =
    t.engagementPct > previous.engagementPct + 3
      ? "up"
      : t.engagementPct < previous.engagementPct - 3
        ? "down"
        : "flat";

  return {
    tenantId: input.tenantId,
    asOf,
    dailyActiveExecutives: t.dailyActiveExecutives,
    weeklyActiveExecutives: t.weeklyActiveExecutives,
    averageSessionMinutes: t.averageSessionMinutes,
    morningBriefOpens: t.morningBriefOpens,
    recommendationsViewed: t.recommendationsViewed,
    recommendationsAccepted: t.recommendationsAccepted,
    feedbackSubmitted: t.feedbackSubmitted,
    validationRequestsCompleted: t.validationCompleted,
    trend,
    history: series,
    explanation: `Engagement ${t.engagementPct}% (${trend}). DAU ${t.dailyActiveExecutives}, WAU ${t.weeklyActiveExecutives}, avg session ${t.averageSessionMinutes}m.`,
  };
}
