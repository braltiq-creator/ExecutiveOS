import { ensureSentence } from "@/intelligence/executive-intelligence/lib/helpers";
import type {
  IntelligentDecision,
  IntelligentOutcome,
  IntelligentRecommendation,
} from "@/intelligence/executive-intelligence/types";
import type { ExecutiveIntentProfile } from "@/intelligence/executive-intent/types";
import {
  balanceFromDimensions,
  scoreOptionDimensions,
  synthesiseConfidence,
  type JudgementContext,
} from "@/intelligence/executive-judgement/framework";
import { optionsForDecision, defaultOptionsForAct } from "@/intelligence/executive-judgement/options";
import {
  explainTradeoffs,
  surfaceUnknowns,
} from "@/intelligence/executive-judgement/tradeoffs";
import type {
  DecisionEvaluation,
  DecisionOption,
  JudgementDependency,
  JudgementPack,
  JudgementResult,
  OptionEvaluation,
  ReasoningPathStep,
} from "@/intelligence/executive-judgement/types";

export type EvaluateInput = {
  decision: IntelligentDecision;
  outcomes: IntelligentOutcome[];
  intent: ExecutiveIntentProfile;
  asOf: string;
  recommendation?: IntelligentRecommendation;
  options?: DecisionOption[];
  graphPaths?: string[];
  memoryEvidence?: string[];
  twinSignals?: string[];
};

/**
 * Evaluate a material Decision against the common judgement framework.
 * Always surfaces alternatives when the catalogue (or defaults) provides them.
 */
export function evaluateDecision(input: EvaluateInput): DecisionEvaluation {
  const options =
    input.options ??
    (optionsForDecision(input.decision.id).length > 0
      ? optionsForDecision(input.decision.id)
      : defaultOptionsForAct(input.recommendation?.act ?? "approve"));

  const evaluated = options.map((option) =>
    evaluateOption(option, input),
  );

  // Primary = highest balance — a leaning aid, never a sole recommendation
  const ranked = [...evaluated].sort(
    (left, right) => right.balanceScore - left.balanceScore,
  );
  const primary = ranked[0] ?? null;

  const tradeoffs = explainTradeoffs(evaluated).tradeoffs;
  const unknowns = surfaceUnknowns({
    decision: input.decision,
    outcomes: input.outcomes,
    options: evaluated,
    graphPaths: input.graphPaths,
    memoryEvidence: input.memoryEvidence,
    twinSignals: input.twinSignals,
  });

  const dimensions = primary?.dimensions ?? [];
  const comparisonSummary = buildComparisonSummary(ranked, input.decision);

  return {
    decisionId: input.decision.id,
    question: input.decision.question,
    asOf: input.asOf,
    dimensions,
    options: ranked,
    primaryOptionId: primary?.option.id ?? null,
    comparisonSummary,
    unknowns,
    tradeoffs,
    systems: unique([
      ...input.decision.reasoningGraph.systems,
      "Executive Judgement Engine",
      ...(input.graphPaths?.length ? ["Executive Knowledge Graph"] : []),
      ...(input.memoryEvidence?.length ? ["Executive Memory Engine"] : []),
      ...(input.twinSignals?.length ? ["Enterprise Digital Twin"] : []),
    ]),
  };
}

function evaluateOption(
  option: DecisionOption,
  input: EvaluateInput,
): OptionEvaluation {
  const context: JudgementContext = {
    asOf: input.asOf,
    intent: input.intent,
    decision: input.decision,
    outcomes: input.outcomes,
    recommendation: input.recommendation,
    option,
    graphPaths: input.graphPaths,
    memoryEvidence: input.memoryEvidence,
    twinSignals: input.twinSignals,
  };

  const dimensions = scoreOptionDimensions(context);
  const balanceScore = balanceFromDimensions(dimensions);
  const pack = buildPack(option, dimensions, input, balanceScore);

  return {
    option,
    dimensions,
    pack,
    balanceScore,
    leaningLabel:
      balanceScore >= 72 ? "stronger" : balanceScore <= 48 ? "weaker" : "balanced",
  };
}

function buildPack(
  option: DecisionOption,
  dimensions: OptionEvaluation["dimensions"],
  input: EvaluateInput,
  balanceScore: number,
): JudgementPack {
  const alternatives = (
    input.options ??
    optionsForDecision(input.decision.id)
  ).filter((item) => item.id !== option.id);

  const benefits = dimensions
    .filter((item) => item.polarity === "supports")
    .map((item) => item.reasoning)
    .slice(0, 4);
  if (benefits.length === 0) {
    benefits.push(option.summary);
  }

  const risks = dimensions
    .filter((item) => item.polarity === "cautions")
    .map((item) => item.reasoning)
    .slice(0, 4);
  if (risks.length === 0) {
    risks.push(
      "Residual uncertainty remains — see unknowns before treating this as settled.",
    );
  }

  const tradeoffs = explainTradeoffs([
    {
      option,
      dimensions,
      pack: placeholderPack(),
      balanceScore,
      leaningLabel: "balanced",
    },
  ]).tradeoffs;

  const dependencies = deriveDependencies(input);
  const unknowns = surfaceUnknowns({
    decision: input.decision,
    outcomes: input.outcomes,
    options: [
      {
        option,
        dimensions,
        pack: placeholderPack(),
        balanceScore,
        leaningLabel: "balanced",
      },
    ],
    graphPaths: input.graphPaths,
    memoryEvidence: input.memoryEvidence,
    twinSignals: input.twinSignals,
  });

  const evidence = unique([
    ...dimensions.flatMap((item) => item.evidence).slice(0, 6),
    ...(input.recommendation?.evidence ?? []),
    ...(input.graphPaths ?? []),
    ...(input.memoryEvidence ?? []),
    ...(input.twinSignals ?? []),
  ]).slice(0, 10);

  const confidence = synthesiseConfidence(
    dimensions,
    input.recommendation?.confidence ?? input.decision.confidence,
  );

  const reasoningPath: ReasoningPathStep[] = [
    {
      id: "step-intelligence",
      label: "Business intelligence",
      detail: input.decision.businessNarrative,
      system: "Executive Intelligence Engine",
    },
    {
      id: "step-intent",
      label: "Executive intent",
      detail: input.decision.strategicAlignment.reasoning,
      system: "Executive Intent Engine",
    },
    {
      id: "step-framework",
      label: "Judgement framework",
      detail: `Scored ${dimensions.length} dimensions; balance ${balanceScore}.`,
      system: "Executive Judgement Engine",
    },
  ];
  if (input.graphPaths?.[0]) {
    reasoningPath.push({
      id: "step-graph",
      label: "Organisational relationships",
      detail: input.graphPaths[0],
      system: "Executive Knowledge Graph",
    });
  }
  if (input.memoryEvidence?.[0]) {
    reasoningPath.push({
      id: "step-memory",
      label: "Historical memory",
      detail: input.memoryEvidence[0],
      system: "Executive Memory Engine",
    });
  }
  if (input.twinSignals?.[0]) {
    reasoningPath.push({
      id: "step-twin",
      label: "Digital Twin state",
      detail: input.twinSignals[0],
      system: "Enterprise Digital Twin",
    });
  }

  return {
    benefits,
    risks,
    tradeoffs:
      tradeoffs.length > 0
        ? tradeoffs
        : [
            {
              id: `tradeoff-${option.id}-generic`,
              gains: benefits[0] ?? option.summary,
              costs: risks[0] ?? "Accept residual uncertainty.",
              dimensions: dimensions
                .filter((item) => item.polarity !== "neutral")
                .map((item) => item.id)
                .slice(0, 3),
              severity: balanceScore < 55 ? "high" : "medium",
            },
          ],
    dependencies,
    alternatives:
      alternatives.length > 0
        ? alternatives
        : defaultOptionsForAct(option.act).filter((item) => item.id !== option.id),
    unknowns,
    evidence,
    confidence,
    reasoningPath,
  };
}

function deriveDependencies(input: EvaluateInput): JudgementDependency[] {
  const deps: JudgementDependency[] = input.decision.dependencies.map(
    (label, index) => ({
      id: `dep-${input.decision.id}-${index}`,
      label,
      kind: "other" as const,
      status: "unknown" as const,
    }),
  );

  for (const outcomeId of input.decision.outcomeIds) {
    const outcome = input.outcomes.find((item) => item.id === outcomeId);
    deps.push({
      id: `dep-outcome-${outcomeId}`,
      label: outcome?.shortName ?? outcomeId,
      kind: "outcome",
      status: outcome?.status === "off_track" ? "blocked" : "ready",
      relatedEntityId: outcomeId,
    });
  }

  return deps.slice(0, 8);
}

function buildComparisonSummary(
  ranked: OptionEvaluation[],
  decision: IntelligentDecision,
): string {
  if (ranked.length === 0) {
    return ensureSentence(
      `No viable options catalogued for ${decision.question}`,
    );
  }
  const top = ranked[0]!;
  const second = ranked[1];
  if (!second) {
    return ensureSentence(
      `"${top.option.label}" is the only catalogued option — treat unknowns explicitly before binding`,
    );
  }
  return ensureSentence(
    [
      `"${top.option.label}" leads on balance (${top.balanceScore}) versus "${second.option.label}" (${second.balanceScore}).`,
      "This is a structured leaning, not a decision.",
      "Trade-offs and unknowns remain visible.",
    ].join(" "),
  );
}

function placeholderPack(): JudgementPack {
  return {
    benefits: [],
    risks: [],
    tradeoffs: [],
    dependencies: [],
    alternatives: [],
    unknowns: [],
    evidence: [],
    confidence: {
      value: 50,
      ceiling: 70,
      drivers: [],
      reasoning: "placeholder",
    },
    reasoningPath: [],
  };
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

/**
 * Generate full judgement for a Decision (+ optional recommendation).
 */
export function generateJudgement(input: EvaluateInput): JudgementResult {
  const evaluation = evaluateDecision(input);
  const primary =
    evaluation.options.find(
      (item) => item.option.id === evaluation.primaryOptionId,
    ) ?? evaluation.options[0];

  const pack =
    primary?.pack ??
    buildPack(
      {
        id: "opt-none",
        label: "No option",
        act: "investigate",
        summary: "Insufficient options",
      },
      evaluation.dimensions,
      input,
      0,
    );

  const stance = stanceFrom(primary?.option.act, primary?.balanceScore ?? 0);

  return {
    decisionId: input.decision.id,
    recommendationId: input.recommendation?.id,
    evaluation,
    pack,
    stance,
    stanceReason: evaluation.comparisonSummary,
  };
}

function stanceFrom(
  act: OptionEvaluation["option"]["act"] | undefined,
  balance: number,
): JudgementResult["stance"] {
  if (!act || balance < 50) return "balanced";
  if (act === "approve") return "lean_approve";
  if (act === "investigate" || act === "schedule") return "lean_investigate";
  if (act === "wait" || act === "defer") return "lean_wait";
  if (act === "delegate") return "lean_delegate";
  return "balanced";
}
