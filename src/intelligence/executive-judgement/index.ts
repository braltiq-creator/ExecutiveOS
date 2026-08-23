/**
 * Executive Judgement Engine (EJE)
 *
 * Sits above the Executive Intelligence Engine.
 * Transforms intelligence into balanced decision support.
 * Structures judgement — never replaces human decision-making.
 */

export type * from "@/intelligence/executive-judgement/types";
export {
  JUDGEMENT_DIMENSIONS,
  JUDGEMENT_DIMENSION_LABELS,
} from "@/intelligence/executive-judgement/types";

export {
  scoreOptionDimensions,
  balanceFromDimensions,
  synthesiseConfidence,
} from "@/intelligence/executive-judgement/framework";
export type { JudgementContext } from "@/intelligence/executive-judgement/framework";

export {
  optionsForDecision,
  defaultOptionsForAct,
} from "@/intelligence/executive-judgement/options";

export {
  evaluateDecision,
  generateJudgement,
} from "@/intelligence/executive-judgement/evaluate";
export type { EvaluateInput } from "@/intelligence/executive-judgement/evaluate";

export {
  compareOptions,
  explainTradeoffs,
  surfaceUnknowns,
} from "@/intelligence/executive-judgement/tradeoffs";

export { deriveDecisionBrief } from "@/intelligence/executive-judgement/brief";

export { applyExecutiveJudgement } from "@/intelligence/executive-judgement/apply-judgement";
