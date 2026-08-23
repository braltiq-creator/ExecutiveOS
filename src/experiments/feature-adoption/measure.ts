import type { IntelligenceProfileId } from "@/profiles";
import { extractTenantTelemetry } from "@/operations";
import { countBehaviourEvents, listBehaviourEvents } from "@/experiments/behaviour";
import type {
  FeatureAdoptionMetricId,
  FeatureAdoptionSeries,
  FeatureAdoptionSnapshot,
} from "@/experiments/framework/types";

const METRIC_META: Record<
  FeatureAdoptionMetricId,
  { label: string; explanation: string; kind?: string }
> = {
  executive_brief_opens: {
    label: "Executive Brief opens",
    explanation: "How often executives open Today / Executive Brief.",
    kind: "brief_open",
  },
  strategy_page_usage: {
    label: "Strategy page usage",
    explanation: "Visits to the executive Strategy surface.",
    kind: "strategy_view",
  },
  memory_usage: {
    label: "Memory usage",
    explanation: "Opens of organisational memory recall surfaces.",
    kind: "memory_open",
  },
  scenario_usage: {
    label: "Scenario usage",
    explanation: "Scenario pack interactions from recommendations.",
    kind: "scenario_open",
  },
  trust_panel_usage: {
    label: "Trust panel usage",
    explanation: "Explainability / trust panel expansions.",
    kind: "trust_panel_open",
  },
  recommendation_interactions: {
    label: "Recommendation interactions",
    explanation: "Views, accepts, and ignores of recommendations.",
  },
  review_completion: {
    label: "Review completion",
    explanation: "Executive review submissions on recommendations.",
    kind: "review_complete",
  },
  time_spent_minutes: {
    label: "Time spent",
    explanation: "Aggregate session minutes attributed to product learning.",
    kind: "session_minutes",
  },
  repeat_usage: {
    label: "Repeat usage",
    explanation: "Sessions beyond the first — habit formation signal.",
  },
};

function trendFromPoints(
  points: Array<{ value: number }>,
): "up" | "down" | "flat" {
  if (points.length < 2) return "flat";
  const first = points[0]!.value;
  const last = points[points.length - 1]!.value;
  if (last > first * 1.08) return "up";
  if (last < first * 0.92) return "down";
  return "flat";
}

export function measureFeatureAdoption(input: {
  tenantId: string;
  profileId: IntelligenceProfileId;
  asOf?: string;
}): FeatureAdoptionSnapshot {
  const asOf = input.asOf ?? new Date().toISOString();
  const t = extractTenantTelemetry({
    tenantId: input.tenantId,
    profileId: input.profileId,
    asOf,
  });
  const events = listBehaviourEvents(input.tenantId);

  const series: FeatureAdoptionSeries[] = (
    Object.keys(METRIC_META) as FeatureAdoptionMetricId[]
  ).map((metricId) => {
    const meta = METRIC_META[metricId];
    let total = 0;

    if (metricId === "executive_brief_opens") {
      total =
        countBehaviourEvents({
          tenantId: input.tenantId,
          kind: "brief_open",
        }) + t.morningBriefOpens;
    } else if (metricId === "recommendation_interactions") {
      total =
        countBehaviourEvents({
          tenantId: input.tenantId,
          kind: "recommendation_view",
        }) +
        countBehaviourEvents({
          tenantId: input.tenantId,
          kind: "recommendation_accept",
        }) +
        countBehaviourEvents({
          tenantId: input.tenantId,
          kind: "recommendation_ignore",
        }) +
        t.recommendationsViewed;
    } else if (metricId === "repeat_usage") {
      total = Math.max(
        0,
        t.weeklyActiveExecutives - 1 + (events.length > 2 ? 3 : 0),
      );
    } else if (metricId === "time_spent_minutes") {
      total =
        countBehaviourEvents({
          tenantId: input.tenantId,
          kind: "session_minutes",
        }) + t.averageSessionMinutes * t.dailyActiveExecutives;
    } else if (meta.kind) {
      total = countBehaviourEvents({
        tenantId: input.tenantId,
        kind: meta.kind as never,
      });
    }

    const related = events
      .filter((e) => {
        if (metricId === "recommendation_interactions") {
          return e.kind.startsWith("recommendation_");
        }
        return meta.kind ? e.kind === meta.kind : false;
      })
      .slice(0, 6)
      .reverse()
      .map((e) => ({ at: e.at, value: e.value }));

    const points =
      related.length > 0
        ? related
        : [
            { at: asOf, value: Math.max(0, Math.round(total * 0.4)) },
            { at: asOf, value: total },
          ];

    return {
      metricId,
      label: meta.label,
      explanation: meta.explanation,
      points,
      total,
      trend: trendFromPoints(points),
    };
  });

  return {
    tenantId: input.tenantId,
    profileId: input.profileId,
    asOf,
    series,
  };
}
