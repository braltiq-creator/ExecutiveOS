import { assessConfidence } from "@/intelligence/executive-intelligence/engines/confidence-engine";
import { buildReasoningGraph } from "@/intelligence/executive-intelligence/engines/reasoning-graph";
import {
  ensureSentence,
  shortLine,
} from "@/intelligence/executive-intelligence/lib/helpers";
import type {
  EnterpriseSignals,
  IntelligentDecision,
  IntelligentOutcome,
  IntelligentRecommendation,
  RecommendationAct,
} from "@/intelligence/executive-intelligence/types";
import type { KnowledgeGraph } from "@/knowledge-graph";
import {
  evidenceFor,
  graphPathsForEntity,
  outcomeLabelsAffected,
  riskLabelsIncreased,
} from "@/knowledge-graph";

/**
 * Recommendation Engine — every act requires reason, evidence, benefit, downside, confidence.
 * When a Knowledge Graph is provided, reasoning traverses materialised relationship paths.
 */
export function deriveRecommendations(input: {
  signals: EnterpriseSignals;
  decisions: IntelligentDecision[];
  outcomes: IntelligentOutcome[];
  graph?: KnowledgeGraph;
}): IntelligentRecommendation[] {
  const { signals, decisions, outcomes, graph } = input;
  const recommendations: IntelligentRecommendation[] = [];

  for (const decision of decisions.filter((item) => item.priority !== "resolved")) {
    const act = recommendAct(decision);
    const linked = outcomes.filter((outcome) =>
      decision.outcomeIds.includes(outcome.id),
    );
    const graphPaths = graph ? graphPathsForEntity(graph, decision.id) : [];
    const graphEvidence = graph ? evidenceFor(graph, decision.id) : [];
    recommendations.push(
      buildRecommendation({
        id: `rec-${decision.id}`,
        act,
        title: titleForAct(act, decision.question),
        reason: decision.businessNarrative,
        evidence: [
          decision.reasoningGraph.whatChanged[0] ?? decision.businessNarrative,
          ...linked.map((outcome) => outcome.lastSignificantChange),
          ...graphEvidence.slice(0, 2),
          ...graphPaths.slice(0, 2),
        ].filter(Boolean),
        expectedBenefit: benefitFor(act, linked),
        expectedDownside: downsideFor(act),
        relatedOutcomeIds: decision.outcomeIds,
        relatedDecisionIds: [decision.id],
        href: `/decisions/${decision.id}`,
        attentionValue: decision.executiveImportance,
        systems: decision.reasoningGraph.systems,
        graphPaths,
        graphOutcomes: graph ? outcomeLabelsAffected(graph, decision.id) : [],
        graphRisks: graph ? riskLabelsIncreased(graph, decision.id) : [],
      }),
    );
  }

  // Surface pending actions as investigate / schedule recommendations when budget allows
  for (const outcome of outcomes) {
    const source = signals.outcomes.find((item) => item.id === outcome.id);
    if (!source) continue;
    for (const action of source.pendingActions.slice(0, 1)) {
      const act: RecommendationAct =
        action.status === "blocked" ? "investigate" : "schedule";
      const actionPaths = graph ? graphPathsForEntity(graph, action.id) : [];
      recommendations.push(
        buildRecommendation({
          id: `rec-action-${action.id}`,
          act,
          title: shortLine(action.label, 10),
          reason: shortLine(action.why, 12),
          evidence: [
            action.why,
            outcome.lastSignificantChange,
            ...actionPaths.slice(0, 2),
          ],
          expectedBenefit: shortLine(action.expectedOutcomeImpact, 8),
          expectedDownside: "Deferred action lets Outcome drift continue.",
          relatedOutcomeIds: [outcome.id],
          relatedDecisionIds: outcome.reasoningGraph.evidence
            .filter((node) => node.kind === "decision")
            .map((node) => node.id),
          href: "/actions",
          attentionValue: Math.max(20, 70 - outcome.healthScore / 2),
          systems: outcome.contributingSystems,
          graphPaths: actionPaths,
          graphOutcomes: graph ? outcomeLabelsAffected(graph, outcome.id) : [],
          graphRisks: graph ? riskLabelsIncreased(graph, outcome.id) : [],
        }),
      );
    }
  }

  return recommendations
    .sort((left, right) => right.attentionValue - left.attentionValue)
    .slice(0, 8);
}

function recommendAct(decision: IntelligentDecision): RecommendationAct {
  if (decision.priority === "immediate") return "approve";
  if (decision.urgency >= 50 && decision.confidence.value < 60) return "investigate";
  if (decision.estimatedEffortMinutes <= 8 && decision.priority === "today")
    return "delegate";
  if (decision.priority === "watch") return "wait";
  if (decision.businessImpactScore >= 60) return "escalate";
  return "schedule";
}

function titleForAct(act: RecommendationAct, question: string): string {
  const short = shortLine(question, 8);
  switch (act) {
    case "approve":
      return `Take a written position on ${short}`;
    case "delegate":
      return `Have counsel circulate the option paper`;
    case "escalate":
      return `Escalate ${short}`;
    case "wait":
      return `Hold judgement on ${short}`;
    case "investigate":
      return `Investigate gaps before deciding ${short}`;
    case "schedule":
      return `Lock the working session for ${short}`;
    case "reject":
      return `Reject the proposed path on ${short}`;
    case "defer":
      return `Defer ${short} to a named review`;
  }
}

function benefitFor(
  act: RecommendationAct,
  linked: IntelligentOutcome[],
): string {
  if (act === "approve") return "Unblocks linked Outcomes";
  if (act === "schedule") return "Converts judgement into motion";
  if (act === "delegate") return "Preserves executive attention";
  if (act === "investigate") return "Prevents false certainty";
  if (act === "wait") return "Protects Focus capacity";
  if (linked[0]) return `Stabilises ${linked[0].shortName}`;
  return "Protects Focus capacity";
}

function downsideFor(act: RecommendationAct): string {
  switch (act) {
    case "approve":
      return "Binds the organisation before residual risk is fully closed.";
    case "delegate":
      return "May slow the final bind if ownership is unclear.";
    case "escalate":
      return "Consumes scarce leadership bandwidth.";
    case "wait":
      return "Cost of delay continues to accrue.";
    case "investigate":
      return "Delays commercial motion while facts are gathered.";
    case "schedule":
      return "Calendar load rises if the session is poorly scoped.";
    case "reject":
      return "Closes a path that may have been recoverable.";
    case "defer":
      return "Leaves linked Outcomes exposed until the review date.";
  }
}

function buildRecommendation(input: {
  id: string;
  act: RecommendationAct;
  title: string;
  reason: string;
  evidence: string[];
  expectedBenefit: string;
  expectedDownside: string;
  relatedOutcomeIds: string[];
  relatedDecisionIds: string[];
  href: string;
  attentionValue: number;
  systems: string[];
  graphPaths?: string[];
  graphOutcomes?: string[];
  graphRisks?: string[];
}): IntelligentRecommendation {
  const confidence = assessConfidence({
    label: input.title,
    dataCompleteness: Math.min(92, 60 + input.evidence.length * 8),
    freshnessHours: 6,
    sourceAgreement: 72,
    historicalReliability: 68,
    predictionCertainty: 58,
    aiReasoningConfidence: 66,
  });

  const pathNotes = (input.graphPaths ?? []).slice(0, 3);
  const summary = ensureSentence(
    pathNotes.length > 0
      ? `${input.reason} Graph: ${pathNotes[0]}`
      : input.reason,
  );

  const graph = buildReasoningGraph({
    id: input.id,
    question: `Why recommend ${input.act}?`,
    whatChanged: [
      ...input.evidence.slice(0, 2),
      ...(input.graphOutcomes ?? [])
        .slice(0, 2)
        .map((label) => `Outcome affected: ${label}`),
      ...(input.graphRisks ?? [])
        .slice(0, 2)
        .map((label) => `Risk linked: ${label}`),
    ],
    evidence: [
      ...input.evidence.map((item, index) => ({
        id: `${input.id}-ev-${index}`,
        kind: "judgement" as const,
        label: shortLine(item, 8),
        detail: item,
        system: "Recommendation Engine",
      })),
      ...pathNotes.map((path, index) => ({
        id: `${input.id}-path-${index}`,
        kind: "judgement" as const,
        label: shortLine(path, 10),
        detail: path,
        system: "Executive Knowledge Graph",
      })),
    ],
    systems: [
      ...input.systems,
      ...(pathNotes.length > 0 ? ["Executive Knowledge Graph"] : []),
    ],
    summary,
  });

  return {
    id: input.id,
    act: input.act,
    title: input.title,
    reason: ensureSentence(input.reason),
    evidence: input.evidence,
    expectedBenefit: input.expectedBenefit,
    expectedDownside: input.expectedDownside,
    confidence,
    relatedOutcomeIds: input.relatedOutcomeIds,
    relatedDecisionIds: input.relatedDecisionIds,
    href: input.href,
    attentionValue: input.attentionValue,
    reasoningGraph: graph,
    strategicAlignment: {
      level: "medium",
      label: "Medium Alignment",
      intentScore: 50,
      attentionPriority: input.attentionValue,
      matchedPriorities: [],
      reasoning: "Intent pending application.",
    },
  };
}
