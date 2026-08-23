/**
 * Phase 50 self-review — behavioural model readiness.
 */

import { EXECUTIVE_INTELLIGENCE_MODELS } from "@/intelligence-models/roles";
import { validateExecutiveIntelligenceModel } from "@/intelligence-models/define";
import {
  applyIndustryOverlay,
  identityUnchanged,
} from "@/intelligence-models/apply-overlay";
import { getIndustryOverlay } from "@/intelligence-models/overlays";
import { resolveExecutiveIntelligence } from "@/intelligence-models/resolve";
import type { IndustryOverlayId } from "@/intelligence-models/types";

export type EimSelfReview = {
  canOperateWithoutIndustryContext: boolean;
  canOverlaysModifyWithoutRewrite: boolean;
  cfosStillFeelLikeCfosAcrossIndustries: boolean;
  describesBehaviourNotResponsibilities: boolean;
  allPassed: boolean;
  evidence: string[];
};

const SAMPLE_INDUSTRIES: IndustryOverlayId[] = [
  "manufacturing",
  "mining",
  "utilities",
  "healthcare",
  "technology",
];

export function reviewExecutiveIntelligenceModels(): EimSelfReview {
  const evidence: string[] = [];
  const cfoModel = EXECUTIVE_INTELLIGENCE_MODELS.find(
    (model) => model.identity.roleId === "cfo",
  )!;

  const validations = EXECUTIVE_INTELLIGENCE_MODELS.map((model) =>
    validateExecutiveIntelligenceModel(model),
  );
  const canOperateWithoutIndustryContext = validations.every((item) => item.ok);
  if (canOperateWithoutIndustryContext) {
    evidence.push(
      `${EXECUTIVE_INTELLIGENCE_MODELS.length} role models validate without any industry overlay.`,
    );
  }

  const baseCfo = resolveExecutiveIntelligence("cfo");
  let overlaysOk = true;
  for (const industry of SAMPLE_INDUSTRIES) {
    const overlay = getIndustryOverlay(industry, "cfo");
    if (!overlay) continue;
    const resolved = applyIndustryOverlay(cfoModel, overlay, industry);
    if (!identityUnchanged(cfoModel, resolved)) {
      overlaysOk = false;
    }
    if (resolved.observation.monitors.length < baseCfo.observation.monitors.length) {
      overlaysOk = false;
    }
  }
  const canOverlaysModifyWithoutRewrite = overlaysOk;
  if (canOverlaysModifyWithoutRewrite) {
    evidence.push(
      "Industry overlays add monitors/thresholds while freezing CFO identity thesis and mental models.",
    );
  }

  const theses = SAMPLE_INDUSTRIES.map((industry) => {
    const overlay = getIndustryOverlay(industry, "cfo");
    return applyIndustryOverlay(cfoModel, overlay ?? null, industry).identity
      .behaviouralThesis;
  });
  const cfosStillFeelLikeCfosAcrossIndustries = new Set(theses).size === 1;
  if (cfosStillFeelLikeCfosAcrossIndustries) {
    evidence.push(
      "CFO behaviouralThesis is identical across manufacturing, mining, utilities, healthcare, technology.",
    );
  }

  const responsibilitySmell = EXECUTIVE_INTELLIGENCE_MODELS.filter((model) => {
    const thesis = model.identity.behaviouralThesis.toLowerCase();
    return thesis.startsWith("responsible for") || thesis.startsWith("owns the");
  });
  const hasReasoningVerbs = EXECUTIVE_INTELLIGENCE_MODELS.every((model) => {
    const thesis = model.identity.behaviouralThesis.toLowerCase();
    return (
      /judge|arbitrate|protect|reason|make demand|treat|enable|connect|keep/.test(
        thesis,
      )
    );
  });
  const describesBehaviourNotResponsibilities =
    responsibilitySmell.length === 0 &&
    hasReasoningVerbs &&
    EXECUTIVE_INTELLIGENCE_MODELS.every(
      (model) =>
        model.observation.monitors.length > 0 &&
        model.challenge.challengeQuestions.length > 0 &&
        model.learning.confidenceAdjustmentRules.length > 0,
    );
  if (describesBehaviourNotResponsibilities) {
    evidence.push(
      "Every model thesis uses reasoning verbs; models define observation→learning behaviour, not job descriptions.",
    );
  }

  const allPassed =
    canOperateWithoutIndustryContext &&
    canOverlaysModifyWithoutRewrite &&
    cfosStillFeelLikeCfosAcrossIndustries &&
    describesBehaviourNotResponsibilities;

  return {
    canOperateWithoutIndustryContext,
    canOverlaysModifyWithoutRewrite,
    cfosStillFeelLikeCfosAcrossIndustries,
    describesBehaviourNotResponsibilities,
    allPassed,
    evidence,
  };
}
