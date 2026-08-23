import {
  generateIntentNarrative,
  recommendDelegation,
  scoreAgainstIntent,
} from "@/intelligence/executive-intent/engine";
import type { ExecutiveIntentProfile } from "@/intelligence/executive-intent/types";
import type {
  IntelligentDecision,
  IntelligentOutcome,
  IntelligentRecommendation,
  NarrativeBundle,
  StrategicAlignment,
} from "@/intelligence/executive-intelligence/types";

/**
 * Apply executive intent across EIE artefacts.
 * Re-ranks by business importance AND intent alignment.
 */
export function applyExecutiveIntent(input: {
  intent: ExecutiveIntentProfile;
  decisions: IntelligentDecision[];
  outcomes: IntelligentOutcome[];
  recommendations: IntelligentRecommendation[];
  narrative: NarrativeBundle;
}): {
  decisions: IntelligentDecision[];
  outcomes: IntelligentOutcome[];
  recommendations: IntelligentRecommendation[];
  narrative: NarrativeBundle;
} {
  const scoredOutcomes = input.outcomes.map((outcome) => {
    const score = scoreAgainstIntent(input.intent, {
      id: outcome.id,
      kind: "outcome",
      label: outcome.shortName,
      outcomeIds: [outcome.id],
      businessImportance: 100 - outcome.healthScore / 2,
      themes: [outcome.shortName],
    });
    return {
      ...outcome,
      strategicAlignment: toAlignment(score),
    };
  });

  const scoredDecisions = input.decisions
    .map((decision) => {
      const score = scoreAgainstIntent(input.intent, {
        id: decision.id,
        kind: "decision",
        label: decision.question,
        outcomeIds: decision.outcomeIds,
        businessImportance: decision.executiveImportance,
        estimatedMinutes: decision.estimatedEffortMinutes,
        themes: themeTokens(decision.question),
      });
      const delegation = recommendDelegation(input.intent, {
        id: decision.id,
        kind: "decision",
        label: decision.question,
        outcomeIds: decision.outcomeIds,
        businessImportance: decision.executiveImportance,
        estimatedMinutes: decision.estimatedEffortMinutes,
        recommendedAct: "approve",
      }, score);

      return {
        ...decision,
        executiveImportance: score.attentionPriority,
        strategicAlignment: toAlignment(score),
        reasoning: `${decision.reasoning} ${score.reasoning} Delegation: ${delegation.reason}`,
      };
    })
    .sort((left, right) => {
      if (left.priority === "resolved" && right.priority !== "resolved") return 1;
      if (right.priority === "resolved" && left.priority !== "resolved") return -1;
      return right.executiveImportance - left.executiveImportance;
    })
    .map((decision, index) => ({
      ...decision,
      recommendedOrder: index + 1,
    }));

  const scoredRecommendations = input.recommendations
    .map((recommendation) => {
      const score = scoreAgainstIntent(input.intent, {
        id: recommendation.id,
        kind: "recommendation",
        label: recommendation.title,
        outcomeIds: recommendation.relatedOutcomeIds,
        businessImportance: recommendation.attentionValue,
        recommendedAct: recommendation.act,
        themes: themeTokens(recommendation.title),
      });
      const delegation = recommendDelegation(input.intent, {
        id: recommendation.id,
        kind: "recommendation",
        label: recommendation.title,
        outcomeIds: recommendation.relatedOutcomeIds,
        businessImportance: recommendation.attentionValue,
        recommendedAct: recommendation.act,
      }, score);

      const actAdjusted =
        delegation.shouldDelegate && recommendation.act === "approve"
          ? "delegate"
          : recommendation.act;

      return {
        ...recommendation,
        act: actAdjusted,
        attentionValue: score.attentionPriority,
        strategicAlignment: toAlignment(score),
        reason: `${recommendation.reason} ${score.alignmentLabel}.`,
        reasoningGraph: {
          ...recommendation.reasoningGraph,
          summary: `${recommendation.reasoningGraph.summary} Intent: ${score.reasoning}`,
          systems: [
            ...recommendation.reasoningGraph.systems,
            "Executive Intent Engine",
          ],
        },
      };
    })
    .sort((left, right) => right.attentionValue - left.attentionValue);

  const scores = [
    ...scoredDecisions.map((decision) =>
      scoreAgainstIntent(input.intent, {
        id: decision.id,
        kind: "decision" as const,
        label: decision.question,
        outcomeIds: decision.outcomeIds,
        businessImportance: decision.businessImpactScore,
      }),
    ),
    ...scoredOutcomes.map((outcome) =>
      scoreAgainstIntent(input.intent, {
        id: outcome.id,
        kind: "outcome" as const,
        label: outcome.shortName,
        outcomeIds: [outcome.id],
        businessImportance: 100 - outcome.healthScore / 2,
      }),
    ),
  ];

  const intentNarrative = generateIntentNarrative(input.intent, scores);
  const narrative = weaveIntentNarrative(
    input.narrative,
    intentNarrative,
    scoredDecisions,
    input.intent.strategicPriorities.length > 0,
  );

  return {
    decisions: scoredDecisions,
    outcomes: rankOutcomesByIntent(scoredOutcomes),
    recommendations: scoredRecommendations,
    narrative,
  };
}

function toAlignment(score: {
  alignment: StrategicAlignment["level"];
  alignmentLabel: string;
  intentScore: number;
  attentionPriority: number;
  matchedPriorities: Array<{ title: string }>;
  reasoning: string;
}): StrategicAlignment {
  return {
    level: score.alignment,
    label: score.alignmentLabel,
    intentScore: score.intentScore,
    attentionPriority: score.attentionPriority,
    matchedPriorities: score.matchedPriorities.map((priority) => priority.title),
    reasoning: score.reasoning,
  };
}

function rankOutcomesByIntent(
  outcomes: IntelligentOutcome[],
): IntelligentOutcome[] {
  return [...outcomes].sort((left, right) => {
    const leftRank =
      left.strategicAlignment.attentionPriority +
      (left.status === "off_track" ? 10 : 0);
    const rightRank =
      right.strategicAlignment.attentionPriority +
      (right.status === "off_track" ? 10 : 0);
    return rightRank - leftRank;
  });
}

function weaveIntentNarrative(
  base: NarrativeBundle,
  intentNarrative: ReturnType<typeof generateIntentNarrative>,
  decisions: IntelligentDecision[],
  prioritiesEstablished: boolean,
): NarrativeBundle {
  const topAligned = decisions.find(
    (decision) =>
      decision.priority !== "resolved" &&
      decision.strategicAlignment.level === "high",
  );

  const executiveSummary = [
    intentNarrative.morningFocus,
    prioritiesEstablished
      ? "Filter everything through your priorities."
      : null,
    topAligned
      ? `Highest-alignment call: ${topAligned.question}`
      : intentNarrative.priorityLens,
  ]
    .filter(Boolean)
    .join(" ")
    .split(/\s+/)
    .slice(0, 60)
    .join(" ");

  const sinceYesterday = [
    {
      id: "since-intent-lens",
      sentence: intentNarrative.sinceYesterdayLens,
      href: "/today",
    },
    ...base.sinceYesterday.filter((item) => item.id !== "since-quiet"),
  ].slice(0, 3);

  return {
    ...base,
    executiveSummary: /[.!?]$/.test(executiveSummary)
      ? executiveSummary
      : `${executiveSummary}.`,
    sinceYesterday:
      sinceYesterday.length > 0
        ? sinceYesterday
        : base.sinceYesterday,
    executiveBrief: [
      intentNarrative.morningFocus,
      intentNarrative.operatingPosture,
      base.executiveBrief,
    ].join(" "),
  };
}

function themeTokens(text: string): string[] {
  const lower = text.toLowerCase();
  const tokens: string[] = [];
  if (lower.includes("arr") || lower.includes("helix") || lower.includes("revenue"))
    tokens.push("growth", "theme-growth");
  if (lower.includes("board")) tokens.push("governance", "theme-governance");
  if (lower.includes("meeting") || lower.includes("forum") || lower.includes("capacity"))
    tokens.push("capacity", "theme-capacity", "theme-ops");
  if (lower.includes("retention")) tokens.push("growth");
  return tokens;
}
