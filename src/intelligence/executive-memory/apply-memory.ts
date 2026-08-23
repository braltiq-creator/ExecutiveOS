import {
  deriveMemoryInsights,
  recommendBasedOnHistory,
  summariseHistory,
} from "@/intelligence/executive-memory/engine";
import type { ExecutiveMemoryStore } from "@/intelligence/executive-memory/store/memory-store";
import type { MemoryInsight } from "@/intelligence/executive-memory/types";
import type { ExecutiveIntentProfile } from "@/intelligence/executive-intent/types";
import type {
  IntelligentRecommendation,
  NarrativeBundle,
} from "@/intelligence/executive-intelligence/types";
import { ensureSentence } from "@/intelligence/executive-intelligence/lib/helpers";

/**
 * Weave Executive Memory into narrative + recommendation personalisation.
 * Only injects sentences backed by evidenceEventIds.
 */
export function applyExecutiveMemory(input: {
  store: ExecutiveMemoryStore;
  intent: ExecutiveIntentProfile;
  narrative: NarrativeBundle;
  recommendations: IntelligentRecommendation[];
  executiveId?: string;
  asOf?: string;
}): {
  narrative: NarrativeBundle;
  recommendations: IntelligentRecommendation[];
  insights: MemoryInsight[];
  historyNarrative: string;
} {
  const executiveId = input.executiveId ?? "exec-alex";
  const asOf = input.asOf ?? "2026-07-20T06:15:00+10:00";
  const from = "2026-06-08T00:00:00+10:00";

  const insights = deriveMemoryInsights({
    store: input.store,
    executiveId,
    asOf,
    from,
    to: asOf,
    intent: input.intent,
  });

  const history = summariseHistory({
    store: input.store,
    executiveId,
    from,
    to: asOf,
    intent: input.intent,
  });

  const historyRecs = recommendBasedOnHistory({
    store: input.store,
    executiveId,
    relatedEntityIds: [
      "decision-residency",
      "outcome-enterprise-arr",
      "outcome-efficiency",
    ],
  });

  const narrative = weaveMemoryNarrative(
    input.narrative,
    insights,
    history.narrative,
  );

  const recommendations = personaliseRecommendations(
    input.recommendations,
    historyRecs,
    insights,
  );

  return {
    narrative,
    recommendations,
    insights,
    historyNarrative: history.narrative,
  };
}

function weaveMemoryNarrative(
  base: NarrativeBundle,
  insights: MemoryInsight[],
  historyNarrative: string,
): NarrativeBundle {
  const memoryUpdates = insights.slice(0, 2).map((insight) => ({
    id: `since-memory-${insight.id}`,
    sentence: ensureSentence(insight.sentence),
    href: hrefForInsight(insight),
  }));

  // Keep intent / overnight lens first; Memory deepens the journey after.
  const baseUpdates = base.sinceYesterday.filter(
    (item) =>
      !item.id.startsWith("since-memory-") && item.id !== "since-quiet",
  );
  const sinceYesterday = [...baseUpdates, ...memoryUpdates].slice(0, 3);

  const weeklyBrief = ensureSentence(
    [
      base.weeklyBrief,
      insights.find((insight) => insight.kind === "recurrence")?.sentence,
      insights.find((insight) => insight.kind === "improvement")?.sentence,
    ]
      .filter(Boolean)
      .join(" "),
  );

  const monthlyBrief = ensureSentence(
    [
      base.monthlyBrief,
      historyNarrative || null,
    ]
      .filter(Boolean)
      .join(" "),
  );

  const executiveBrief = ensureSentence(
    [
      base.executiveBrief,
      insights[0]?.sentence,
    ]
      .filter(Boolean)
      .join(" "),
  );

  return {
    ...base,
    sinceYesterday:
      sinceYesterday.length > 0 ? sinceYesterday : base.sinceYesterday,
    executiveBrief,
    weeklyBrief,
    monthlyBrief,
  };
}

function personaliseRecommendations(
  recommendations: IntelligentRecommendation[],
  historyRecs: ReturnType<typeof recommendBasedOnHistory>,
  insights: MemoryInsight[],
): IntelligentRecommendation[] {
  const successInsight = insights.find(
    (insight) => insight.kind === "recommendation_outcome",
  );
  const successHistory = historyRecs.find((item) => item.act === "approve");
  const failureHistory = historyRecs.find((item) => item.act === "investigate");

  return recommendations.map((recommendation) => {
    const related = new Set([
      ...recommendation.relatedDecisionIds,
      ...recommendation.relatedOutcomeIds,
    ]);
    const touchesHelix =
      related.has("decision-residency") ||
      related.has("outcome-enterprise-arr") ||
      /helix|residency|compensating/i.test(recommendation.title);

    if (!touchesHelix) return recommendation;

    const extras: string[] = [];
    if (successHistory || successInsight) {
      extras.push(
        successHistory?.reason ??
          successInsight?.sentence ??
          "Aligns with prior successful path.",
      );
    }
    if (failureHistory && /wait|defer|later/i.test(recommendation.title + recommendation.reason)) {
      extras.push(failureHistory.reason);
    }

    if (extras.length === 0) return recommendation;

    const evidenceIds = [
      ...(successHistory?.basedOnEventIds ?? []),
      ...(failureHistory?.basedOnEventIds ?? []),
      ...(successInsight?.evidenceEventIds ?? []),
    ];

    return {
      ...recommendation,
      reason: `${recommendation.reason} ${extras.join(" ")}`,
      attentionValue: Math.min(
        100,
        recommendation.attentionValue + (successHistory ? 6 : 0),
      ),
      reasoningGraph: {
        ...recommendation.reasoningGraph,
        summary: `${recommendation.reasoningGraph.summary} Memory: ${extras[0]}`,
        systems: [
          ...recommendation.reasoningGraph.systems,
          "Executive Memory Engine",
        ],
        whatChanged: [
          ...recommendation.reasoningGraph.whatChanged,
          ...evidenceIds.map((id) => `memory:${id}`),
        ],
      },
    };
  });
}

function hrefForInsight(insight: MemoryInsight): string {
  if (insight.relatedEntityIds.some((id) => id.startsWith("decision-"))) {
    const decisionId = insight.relatedEntityIds.find((id) =>
      id.startsWith("decision-"),
    );
    return `/decisions/${decisionId}`;
  }
  if (insight.relatedEntityIds.some((id) => id.startsWith("outcome-"))) {
    const outcomeId = insight.relatedEntityIds.find((id) =>
      id.startsWith("outcome-"),
    );
    return `/outcomes/${outcomeId}`;
  }
  return "/today";
}
