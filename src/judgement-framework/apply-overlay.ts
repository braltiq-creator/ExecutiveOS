import type {
  ExecutiveJudgementModel,
  JudgementIndustryOverlay,
  ResolvedExecutiveJudgementModel,
} from "@/judgement-framework/types";
import type { IndustryOverlayId } from "@/intelligence-models/types";

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

/**
 * Overlays adjust thresholds only — identity, primary factors, and weights stay frozen.
 */
export function applyJudgementOverlay(
  model: ExecutiveJudgementModel,
  overlay: JudgementIndustryOverlay | null,
  industry: IndustryOverlayId | null,
): ResolvedExecutiveJudgementModel {
  if (!overlay) {
    return {
      ...model,
      industry,
      overlayApplied: false,
      overlayNotes: [],
    };
  }

  if (overlay.roleId !== model.roleId) {
    throw new Error(
      `EJF overlay role mismatch: overlay ${overlay.roleId} vs model ${model.roleId}`,
    );
  }

  return {
    ...model,
    actionBias: clamp(model.actionBias + overlay.actionBiasDelta, -20, 20),
    recommendConfidenceFloor: clamp(
      model.recommendConfidenceFloor + overlay.recommendConfidenceFloorDelta,
      40,
      95,
    ),
    escalateForceThreshold: clamp(
      model.escalateForceThreshold + overlay.escalateForceThresholdDelta,
      50,
      95,
    ),
    crisisForceThreshold: clamp(
      model.crisisForceThreshold + overlay.crisisForceThresholdDelta,
      70,
      99,
    ),
    industry,
    overlayApplied: true,
    overlayNotes: [...overlay.thresholdNotes],
    // Freeze identity fields explicitly (same references / copies)
    judgementIdentity: model.judgementIdentity,
    primaryFactors: [...model.primaryFactors],
    factorWeights: model.factorWeights.map((w) => ({ ...w })),
    decisionPriorities: [...model.decisionPriorities],
    escalationPhilosophy: model.escalationPhilosophy,
    mayWithholdRecommendation: true,
  };
}
