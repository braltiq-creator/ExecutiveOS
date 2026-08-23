import type {
  ExecutiveJudgementModel,
  JudgementIndustryOverlay,
} from "@/judgement-framework/types";

export function defineExecutiveJudgement(
  model: ExecutiveJudgementModel,
): ExecutiveJudgementModel {
  if (!model.mayWithholdRecommendation) {
    throw new Error(
      `EJF: ${model.roleId} must be allowed to withhold recommendation (Observe/Monitor).`,
    );
  }
  if (model.primaryFactors.length === 0) {
    throw new Error(`EJF: ${model.roleId} requires primaryFactors.`);
  }
  if (model.factorWeights.length === 0) {
    throw new Error(`EJF: ${model.roleId} requires factorWeights.`);
  }
  return model;
}

export function defineJudgementOverlay(
  overlay: JudgementIndustryOverlay,
): JudgementIndustryOverlay {
  return overlay;
}
