import type {
  JudgementDimensionId,
  JudgementTradeoff,
  JudgementUnknown,
  OptionComparison,
  OptionEvaluation,
} from "@/intelligence/executive-judgement/types";
import type {
  IntelligentDecision,
  IntelligentOutcome,
} from "@/intelligence/executive-intelligence/types";
import { JUDGEMENT_DIMENSIONS } from "@/intelligence/executive-judgement/types";
import { ensureSentence } from "@/intelligence/executive-intelligence/lib/helpers";

/**
 * Compare evaluated options dimension-by-dimension.
 * Exposes winners without declaring a binding decision.
 */
export function compareOptions(input: {
  decisionId: string;
  options: OptionEvaluation[];
}): OptionComparison {
  const winnersByDimension: Partial<Record<JudgementDimensionId, string>> = {};

  for (const dimension of JUDGEMENT_DIMENSIONS) {
    let bestId: string | null = null;
    let bestScore = -1;
    for (const option of input.options) {
      const score =
        option.dimensions.find((item) => item.id === dimension)?.score ?? 0;
      if (score > bestScore) {
        bestScore = score;
        bestId = option.option.id;
      }
    }
    if (bestId) winnersByDimension[dimension] = bestId;
  }

  const tradeoffs = explainTradeoffs(input.options).tradeoffs;
  const ranked = [...input.options].sort(
    (left, right) => right.balanceScore - left.balanceScore,
  );
  const top = ranked[0];
  const second = ranked[1];

  const summary = ensureSentence(
    top && second
      ? [
          `Across the framework, "${top.option.label}" leads on balance (${top.balanceScore}).`,
          `"${second.option.label}" remains a viable alternative (${second.balanceScore}).`,
          "No option is hidden; trade-offs stay explicit.",
        ].join(" ")
      : top
        ? `"${top.option.label}" is the sole evaluated option — widen alternatives before binding.`
        : "No options available to compare.",
  );

  return {
    decisionId: input.decisionId,
    options: ranked,
    winnersByDimension,
    summary,
    tradeoffs,
  };
}

/**
 * Explain trade-offs across options — always expose costs alongside gains.
 */
export function explainTradeoffs(options: OptionEvaluation[]): {
  tradeoffs: JudgementTradeoff[];
  summary: string;
} {
  const tradeoffs: JudgementTradeoff[] = [];

  for (const option of options) {
    const supports = option.dimensions.filter((d) => d.polarity === "supports");
    const cautions = option.dimensions.filter((d) => d.polarity === "cautions");
    if (supports.length === 0 && cautions.length === 0) continue;

    tradeoffs.push({
      id: `tradeoff-${option.option.id}`,
      gains:
        supports.map((item) => item.label).join(", ") ||
        option.option.summary,
      costs:
        cautions.map((item) => item.label).join(", ") ||
        "Accept residual uncertainty and opportunity cost.",
      dimensions: [
        ...supports.map((item) => item.id),
        ...cautions.map((item) => item.id),
      ].slice(0, 6),
      severity:
        cautions.some((item) => item.score <= 30) || option.balanceScore < 50
          ? "high"
          : cautions.length >= 2
            ? "medium"
            : "low",
    });
  }

  // Pairwise trade-off when two options compete
  if (options.length >= 2) {
    const [a, b] = [...options].sort(
      (left, right) => right.balanceScore - left.balanceScore,
    );
    tradeoffs.push({
      id: `tradeoff-pair-${a.option.id}-${b.option.id}`,
      gains: `Choosing "${a.option.label}" captures its stronger dimensions.`,
      costs: `Forgoes strengths of "${b.option.label}" (${b.balanceScore} balance).`,
      dimensions: JUDGEMENT_DIMENSIONS.slice(0, 3),
      severity: Math.abs(a.balanceScore - b.balanceScore) < 8 ? "high" : "medium",
    });
  }

  return {
    tradeoffs,
    summary: ensureSentence(
      tradeoffs.length > 0
        ? `${tradeoffs.length} trade-off(s) made explicit — gains never presented without costs.`
        : "Insufficient contrast to articulate trade-offs yet.",
    ),
  };
}

/**
 * Surface unknowns — never hide uncertainty.
 */
export function surfaceUnknowns(input: {
  decision: IntelligentDecision;
  outcomes: IntelligentOutcome[];
  options: OptionEvaluation[];
  graphPaths?: string[];
  memoryEvidence?: string[];
  twinSignals?: string[];
}): JudgementUnknown[] {
  const unknowns: JudgementUnknown[] = [];

  if (input.decision.confidence.value < 75) {
    unknowns.push({
      id: `unk-confidence-${input.decision.id}`,
      question: "How complete is the evidence behind this Decision?",
      whyItMatters:
        "Confidence below the executive ceiling means residual information risk.",
      howToResolve: "Pull missing evidence from Twin systems or schedule investigation.",
      severity: input.decision.confidence.value < 55 ? "material" : "moderate",
      relatedEntityIds: [input.decision.id],
    });
  }

  const weakCompliance = input.options.some((option) =>
    option.dimensions.some(
      (dimension) =>
        dimension.id === "compliance" && dimension.score < 55,
    ),
  );
  if (
    weakCompliance ||
    /residency|board|security|compliance/i.test(input.decision.question)
  ) {
    unknowns.push({
      id: `unk-compliance-${input.decision.id}`,
      question: "What residual compliance / regulatory exposure remains?",
      whyItMatters:
        "Regulatory and customer-trust exposure can reverse an otherwise strong commercial path.",
      howToResolve: "Confirm counsel posture and compensating controls in writing.",
      severity: "material",
      relatedEntityIds: [input.decision.id, ...input.decision.outcomeIds],
    });
  }

  for (const outcome of input.outcomes.filter((item) =>
    input.decision.outcomeIds.includes(item.id),
  )) {
    if (outcome.status === "at_risk" || outcome.status === "off_track") {
      unknowns.push({
        id: `unk-outcome-${outcome.id}`,
        question: `What would reverse ${outcome.shortName} drift after the bind?`,
        whyItMatters: outcome.lastSignificantChange,
        howToResolve: "Define the first execution checkpoint before binding.",
        severity: outcome.status === "off_track" ? "material" : "moderate",
        relatedEntityIds: [outcome.id, input.decision.id],
      });
    }
  }

  if (!input.graphPaths?.length) {
    unknowns.push({
      id: `unk-graph-${input.decision.id}`,
      question: "Are organisational dependencies fully mapped?",
      whyItMatters:
        "Missing graph paths hide second-order Outcome and Risk effects.",
      howToResolve: "Refresh the Knowledge Graph from the Digital Twin.",
      severity: "moderate",
      relatedEntityIds: [input.decision.id],
    });
  }

  if (!input.memoryEvidence?.length) {
    unknowns.push({
      id: `unk-memory-${input.decision.id}`,
      question: "Has a similar judgement succeeded or failed before?",
      whyItMatters: "Without memory, the organisation repeats avoidable patterns.",
      howToResolve: "Recall recommendation outcomes from Executive Memory.",
      severity: "minor",
      relatedEntityIds: [input.decision.id],
    });
  }

  // Always include at least one unknown — never hide uncertainty
  if (unknowns.length === 0) {
    unknowns.push({
      id: `unk-residual-${input.decision.id}`,
      question: "What assumption, if wrong, would change the leaning?",
      whyItMatters: "Every structured judgement rests on assumptions.",
      howToResolve: "Name the load-bearing assumption and assign an owner to validate it.",
      severity: "moderate",
      relatedEntityIds: [input.decision.id],
    });
  }

  return unknowns.slice(0, 6);
}
