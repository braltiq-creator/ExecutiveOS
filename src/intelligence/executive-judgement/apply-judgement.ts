import type {
  IntelligentDecision,
  IntelligentOutcome,
  IntelligentRecommendation,
  NarrativeBundle,
} from "@/intelligence/executive-intelligence/types";
import type { ExecutiveIntentProfile } from "@/intelligence/executive-intent/types";
import type { ExecutiveMemoryStore } from "@/intelligence/executive-memory";
import {
  deriveMemoryInsights,
  recommendBasedOnHistory,
} from "@/intelligence/executive-memory";
import type { KnowledgeGraph } from "@/knowledge-graph";
import { graphPathsForEntity } from "@/knowledge-graph";
import type { EnterpriseDigitalTwin } from "@/digital-twin";
import { deriveDecisionBrief } from "@/intelligence/executive-judgement/brief";
import { generateJudgement } from "@/intelligence/executive-judgement/evaluate";
import type {
  DecisionBrief,
  JudgementResult,
} from "@/intelligence/executive-judgement/types";
import { ensureSentence } from "@/intelligence/executive-intelligence/lib/helpers";

/**
 * Apply Executive Judgement above Intelligence / Intent / Memory.
 * Structures decision support; never binds.
 */
export function applyExecutiveJudgement(input: {
  intent: ExecutiveIntentProfile;
  decisions: IntelligentDecision[];
  outcomes: IntelligentOutcome[];
  recommendations: IntelligentRecommendation[];
  narrative: NarrativeBundle;
  asOf: string;
  graph?: KnowledgeGraph;
  memory?: ExecutiveMemoryStore;
  twin?: EnterpriseDigitalTwin;
}): {
  judgements: JudgementResult[];
  briefs: DecisionBrief[];
  recommendations: IntelligentRecommendation[];
  narrative: NarrativeBundle;
} {
  const openDecisions = input.decisions.filter(
    (decision) => decision.priority !== "resolved",
  );

  const judgements: JudgementResult[] = [];
  const briefs: DecisionBrief[] = [];

  for (const decision of openDecisions) {
    const recommendation = input.recommendations.find((item) =>
      item.relatedDecisionIds.includes(decision.id),
    );
    const graphPaths = input.graph
      ? graphPathsForEntity(input.graph, decision.id).slice(0, 4)
      : [];
    const memoryEvidence = memoryEvidenceFor(
      decision,
      input.memory,
      input.intent,
    );
    const twinSignals = twinSignalsFor(decision, input.twin);

    const ctx = {
      decision,
      outcomes: input.outcomes,
      intent: input.intent,
      asOf: input.asOf,
      recommendation,
      graphPaths,
      memoryEvidence,
      twinSignals,
    };

    judgements.push(generateJudgement(ctx));
    briefs.push(deriveDecisionBrief(ctx));
  }

  const recommendations = enrichRecommendations(
    input.recommendations,
    judgements,
  );

  const narrative = weaveJudgementNarrative(input.narrative, briefs);

  return { judgements, briefs, recommendations, narrative };
}

function memoryEvidenceFor(
  decision: IntelligentDecision,
  memory: ExecutiveMemoryStore | undefined,
  intent: ExecutiveIntentProfile,
): string[] {
  if (!memory) return [];
  const insights = deriveMemoryInsights({
    store: memory,
    intent,
  });
  const related = insights
    .filter((insight) =>
      insight.relatedEntityIds.some(
        (id) => id === decision.id || decision.outcomeIds.includes(id),
      ),
    )
    .map((insight) => insight.sentence);

  const history = recommendBasedOnHistory({
    store: memory,
    relatedEntityIds: [decision.id, ...decision.outcomeIds],
  }).map((item) => item.reason);

  return [...related, ...history].slice(0, 5);
}

function twinSignalsFor(
  decision: IntelligentDecision,
  twin: EnterpriseDigitalTwin | undefined,
): string[] {
  if (!twin) return [];
  const entity = twin.getEntity(decision.id);
  const signals: string[] = [];
  if (entity) {
    signals.push(
      `Twin: ${entity.label} (${entity.status ?? "no status"}, v${entity.version})`,
    );
  }
  for (const outcomeId of decision.outcomeIds) {
    const outcome = twin.getEntity(outcomeId);
    if (outcome) {
      signals.push(`Twin outcome ${outcome.label}: importance ${outcome.importance}`);
    }
  }
  return signals.slice(0, 4);
}

function enrichRecommendations(
  recommendations: IntelligentRecommendation[],
  judgements: JudgementResult[],
): IntelligentRecommendation[] {
  return recommendations.map((recommendation) => {
    const judgement = judgements.find(
      (item) =>
        item.recommendationId === recommendation.id ||
        item.decisionId === recommendation.relatedDecisionIds[0],
    );
    if (!judgement) return recommendation;

    const altCount = judgement.pack.alternatives.length;
    const unknownCount = judgement.pack.unknowns.length;
    const tradeoffCount = judgement.pack.tradeoffs.length;

    const judgementNote = ensureSentence(
      [
        `Judgement stance: ${judgement.stance.replaceAll("_", " ")}.`,
        altCount > 0
          ? `${altCount} viable alternative(s) presented.`
          : "No catalogue alternatives — investigate before sole-path bind.",
        `${tradeoffCount} trade-off(s) and ${unknownCount} unknown(s) exposed.`,
      ].join(" "),
    );

    return {
      ...recommendation,
      reason: `${recommendation.reason} ${judgementNote}`,
      expectedBenefit:
        judgement.pack.benefits[0] ?? recommendation.expectedBenefit,
      expectedDownside: judgement.pack.risks[0] ?? recommendation.expectedDownside,
      evidence: unique([
        ...recommendation.evidence,
        ...judgement.pack.evidence.slice(0, 3),
      ]),
      confidence: judgement.pack.confidence,
      reasoningGraph: {
        ...recommendation.reasoningGraph,
        summary: `${recommendation.reasoningGraph.summary} ${judgementNote}`,
        systems: unique([
          ...recommendation.reasoningGraph.systems,
          "Executive Judgement Engine",
        ]),
        whatChanged: [
          ...recommendation.reasoningGraph.whatChanged,
          `judgement:${judgement.stance}`,
        ],
      },
    };
  });
}

function weaveJudgementNarrative(
  base: NarrativeBundle,
  briefs: DecisionBrief[],
): NarrativeBundle {
  const top = briefs[0];
  if (!top) return base;

  const judgementLine = ensureSentence(
    `Judgement ready on ${top.question} — ${top.optionsInPlay.length} options, trade-offs explicit.`,
  );

  // Keep Intent / Memory lenses first; Judgement deepens options after.
  const sinceYesterday = [
    ...base.sinceYesterday.filter(
      (item) =>
        item.id !== "since-quiet" && item.id !== "since-judgement-brief",
    ),
    {
      id: "since-judgement-brief",
      sentence: judgementLine,
      href: `/decisions/${top.decisionId}`,
    },
  ].slice(0, 3);

  return {
    ...base,
    sinceYesterday,
    executiveBrief: ensureSentence(
      [base.executiveBrief, top.closingNote].join(" "),
    ),
  };
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}
