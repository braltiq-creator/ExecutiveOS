import { ensureSentence } from "@/intelligence/executive-intelligence/lib/helpers";
import type { EvaluateInput } from "@/intelligence/executive-judgement/evaluate";
import { generateJudgement } from "@/intelligence/executive-judgement/evaluate";
import { compareOptions } from "@/intelligence/executive-judgement/tradeoffs";
import type { DecisionBrief } from "@/intelligence/executive-judgement/types";

/**
 * Derive an executive Decision Brief — structured thinking aid, not a verdict.
 */
export function deriveDecisionBrief(input: EvaluateInput): DecisionBrief {
  const judgement = generateJudgement(input);
  const evaluation = judgement.evaluation;
  const comparison = compareOptions({
    decisionId: evaluation.decisionId,
    options: evaluation.options,
  });

  const whatIsAtStake = [
    ...input.outcomes
      .filter((outcome) => input.decision.outcomeIds.includes(outcome.id))
      .map(
        (outcome) =>
          `${outcome.shortName} is ${outcome.status.replaceAll("_", " ")} (health ${outcome.healthScore}).`,
      ),
    input.decision.businessNarrative,
  ].slice(0, 5);

  const optionsInPlay = evaluation.options.map((option) => ({
    id: option.option.id,
    label: option.option.label,
    act: option.option.act,
    balanceScore: option.balanceScore,
    oneLiner: ensureSentence(option.option.summary),
  }));

  const executiveSummary = ensureSentence(
    [
      `Judgement brief for: ${input.decision.question}`,
      comparison.summary,
      evaluation.unknowns[0]
        ? `Open unknown: ${evaluation.unknowns[0].question}`
        : "Unknowns remain listed below.",
    ].join(" "),
  );

  const memoryContext = input.memoryEvidence?.length
    ? input.memoryEvidence.slice(0, 3)
    : ["No Executive Memory evidence attached to this brief."];

  const graphPaths = input.graphPaths?.length
    ? input.graphPaths.slice(0, 3)
    : ["No Knowledge Graph paths attached to this brief."];

  return {
    decisionId: input.decision.id,
    question: input.decision.question,
    asOf: input.asOf,
    executiveSummary,
    whatIsAtStake,
    optionsInPlay,
    tradeoffs: evaluation.tradeoffs,
    unknowns: evaluation.unknowns,
    evidence: judgement.pack.evidence,
    confidence: judgement.pack.confidence,
    intentAlignment: input.decision.strategicAlignment.label,
    memoryContext,
    graphPaths,
    closingNote: ensureSentence(
      [
        "ExecutiveOS structures this judgement; it does not make the Decision.",
        "Bind only after trade-offs and unknowns have been weighed.",
        judgement.stanceReason,
      ].join(" "),
    ),
  };
}