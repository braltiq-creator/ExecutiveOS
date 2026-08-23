/**
 * Executive Judgement Framework (EJF) — Phase 51
 *
 * Layer stack:
 *   EIRL (research) → EIM (reasoning) → EJF (judgement) → EIPF / Council
 *
 * Distinct from `src/intelligence/executive-judgement` (EJE option scoring).
 */

export type * from "@/judgement-framework/types";
export {
  JUDGEMENT_FACTORS,
  JUDGEMENT_FACTOR_LABELS,
  JUDGEMENT_STATE_ORDER,
} from "@/judgement-framework/types";

export {
  JUDGEMENT_STATES,
  getJudgementState,
  judgementStateIntensity,
} from "@/judgement-framework/states";

export {
  FACTOR_DEFINITIONS,
  factorIntensityContribution,
} from "@/judgement-framework/factors";

export {
  defineExecutiveJudgement,
  defineJudgementOverlay,
} from "@/judgement-framework/define";

export {
  getExecutiveJudgementModel,
  listExecutiveJudgementModels,
} from "@/judgement-framework/roles";

export {
  getJudgementOverlay,
  listJudgementOverlays,
} from "@/judgement-framework/overlays";

export { applyJudgementOverlay } from "@/judgement-framework/apply-overlay";

export {
  scoreJudgementIntensity,
  selectJudgementState,
  evaluateRoleJudgement,
  roleForcePeak,
  missingFactors,
} from "@/judgement-framework/evaluate";

export {
  deriveCouncilConsensus,
  formCouncilJudgement,
} from "@/judgement-framework/council";

export {
  resolveExecutiveJudgement,
  judgeAsExecutive,
  judgeAsCouncil,
} from "@/judgement-framework/resolve";

export {
  JUDGEMENT_LEARNING_METRICS,
  refineJudgementThresholds,
  recordLearningSignal,
} from "@/judgement-framework/learning";

export { reviewExecutiveJudgementFramework } from "@/judgement-framework/self-review";
