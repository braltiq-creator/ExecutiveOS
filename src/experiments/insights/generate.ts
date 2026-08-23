import type { IntelligenceProfileId } from "@/profiles";
import type { ProductInsight } from "@/experiments/framework/types";
import { measureFeatureAdoption } from "@/experiments/feature-adoption";
import { measurePilotIntelligence } from "@/experiments/pilot-intelligence";
import { countBehaviourEvents } from "@/experiments/behaviour";
import { listProductFeedback } from "@/experiments/feedback";
import { listInterviews } from "@/experiments/interviews";
import { listExperiments } from "@/experiments/experiments";

let insightSeq = 0;
const insightCache = new Map<string, ProductInsight[]>();

export function resetProductInsights(): void {
  insightCache.clear();
  insightSeq = 0;
}

function nextId(): string {
  insightSeq += 1;
  return `ins-${insightSeq}`;
}

/**
 * Generate prioritised product insights from anonymised adoption, behaviour, and feedback.
 */
export function generateProductInsights(input: {
  tenantId: string;
  profileId: IntelligenceProfileId;
  asOf?: string;
}): ProductInsight[] {
  const asOf = input.asOf ?? new Date().toISOString();
  const adoption = measureFeatureAdoption(input);
  const intelligence = measurePilotIntelligence(input);
  const feedback = listProductFeedback(input.tenantId);
  const interviews = listInterviews(input.tenantId);
  const experiments = listExperimentsForPartners([input.tenantId]);

  const insights: ProductInsight[] = [];

  for (const series of adoption.series) {
    if (
      series.total < 2 &&
      (series.metricId === "strategy_page_usage" ||
        series.metricId === "trust_panel_usage" ||
        series.metricId === "memory_usage")
    ) {
      insights.push({
        id: nextId(),
        kind: "low_adoption",
        title: `Low adoption: ${series.label}`,
        detail: `${series.explanation} Current total ${series.total} — investigate discoverability and first-run value.`,
        priority: series.metricId === "trust_panel_usage" ? "p1" : "p2",
        confidence: 72,
        evidence: [`adoption.total=${series.total}`, `trend=${series.trend}`],
        profileId: input.profileId,
        experimentIds: experiments.map((e) => e.id).slice(0, 3),
        createdAt: asOf,
      });
    }
  }

  const ignores = countBehaviourEvents({
    tenantId: input.tenantId,
    kind: "recommendation_ignore",
  });
  const accepts = countBehaviourEvents({
    tenantId: input.tenantId,
    kind: "recommendation_accept",
  });
  if (ignores > accepts && ignores >= 2) {
    insights.push({
      id: nextId(),
      kind: "frequently_ignored_recommendation",
      title: "Recommendations ignored more than accepted",
      detail:
        "Executives are dismissing recommendations faster than accepting them — review relevance, timing, and evidence quality.",
      priority: "p0",
      confidence: 78,
      evidence: [`ignores=${ignores}`, `accepts=${accepts}`],
      profileId: input.profileId,
      experimentIds: [],
      createdAt: asOf,
    });
  } else if (accepts >= 2 && accepts > ignores) {
    insights.push({
      id: nextId(),
      kind: "highly_valued_recommendation",
      title: "Recommendations landing with executives",
      detail:
        "Acceptance outpaces ignores — double down on the framing and evidence patterns that work for this profile.",
      priority: "p2",
      confidence: 74,
      evidence: [`accepts=${accepts}`, `ignores=${ignores}`],
      profileId: input.profileId,
      experimentIds: [],
      createdAt: asOf,
    });
  }

  if (intelligence.metrics.executiveConfidence.value < 55) {
    insights.push({
      id: nextId(),
      kind: "executive_friction",
      title: "Executive confidence below target",
      detail:
        "Trust and confidence signals are weak. Prioritise explainability, evidence quality, and interview follow-up.",
      priority: "p0",
      confidence: 80,
      evidence: [
        `confidence=${intelligence.metrics.executiveConfidence.value}`,
        `trust_panel=${adoption.series.find((s) => s.metricId === "trust_panel_usage")?.total ?? 0}`,
      ],
      profileId: input.profileId,
      experimentIds: [],
      createdAt: asOf,
    });
  }

  const pain = [
    ...interviews.flatMap((i) => i.painPoints),
    ...feedback.filter((f) => f.sentiment === "negative").map((f) => f.theme),
  ];
  if (pain.length > 0) {
    insights.push({
      id: nextId(),
      kind: "confusing_workflow",
      title: "Workflow friction reported",
      detail: `Recurring themes: ${pain.slice(0, 3).join("; ")}`,
      priority: "p1",
      confidence: 70,
      evidence: pain.slice(0, 4).map((p) => `theme:${p}`),
      profileId: input.profileId,
      experimentIds: interviews.flatMap((i) => i.experimentIds).slice(0, 3),
      createdAt: asOf,
    });
  }

  const requests = interviews.flatMap((i) => i.featureRequests);
  if (requests.length > 0) {
    insights.push({
      id: nextId(),
      kind: "feature_opportunity",
      title: "Feature opportunity from executive interviews",
      detail: requests.slice(0, 3).join("; "),
      priority: "p2",
      confidence: 68,
      evidence: requests.slice(0, 4).map((r) => `request:${r}`),
      profileId: input.profileId,
      experimentIds: interviews.flatMap((i) => i.experimentIds).slice(0, 3),
      createdAt: asOf,
    });
  }

  const prioritised = insights.sort((a, b) => {
    const order = { p0: 0, p1: 1, p2: 2, p3: 3 };
    return order[a.priority] - order[b.priority] || b.confidence - a.confidence;
  });

  insightCache.set(input.tenantId, prioritised);
  return prioritised;
}

function listExperimentsForPartners(tenantIds: string[]) {
  return listExperiments().filter((exp) =>
    exp.targetPartnerTenantIds.some((id) => tenantIds.includes(id)),
  );
}

export function listCachedInsights(tenantId?: string): ProductInsight[] {
  if (tenantId) return insightCache.get(tenantId) ?? [];
  return [...insightCache.values()].flat();
}
