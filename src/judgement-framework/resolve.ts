/**
 * Resolve executive judgement = EJF role model + optional industry threshold overlay.
 */

import { applyJudgementOverlay } from "@/judgement-framework/apply-overlay";
import { evaluateRoleJudgement } from "@/judgement-framework/evaluate";
import { formCouncilJudgement } from "@/judgement-framework/council";
import { getJudgementOverlay } from "@/judgement-framework/overlays";
import { getExecutiveJudgementModel } from "@/judgement-framework/roles";
import type {
  CouncilJudgement,
  FactorBundle,
  ResolvedExecutiveJudgementModel,
  RoleJudgementAssessment,
} from "@/judgement-framework/types";
import type {
  ExecutiveIntelligenceRoleId,
  IndustryOverlayId,
} from "@/intelligence-models/types";

export function resolveExecutiveJudgement(
  roleId: ExecutiveIntelligenceRoleId,
  industry?: IndustryOverlayId | null,
): ResolvedExecutiveJudgementModel {
  const model = getExecutiveJudgementModel(roleId);
  if (!model) {
    throw new Error(`Unknown executive judgement role: ${roleId}`);
  }

  if (!industry || industry === "generic") {
    return applyJudgementOverlay(model, null, industry ?? null);
  }

  const overlay = getJudgementOverlay(industry, roleId) ?? null;
  return applyJudgementOverlay(model, overlay, industry);
}

export function judgeAsExecutive(
  roleId: ExecutiveIntelligenceRoleId,
  factors: FactorBundle,
  industry?: IndustryOverlayId | null,
): RoleJudgementAssessment {
  return evaluateRoleJudgement(resolveExecutiveJudgement(roleId, industry), factors);
}

export function judgeAsCouncil(
  roleIds: ExecutiveIntelligenceRoleId[],
  factors: FactorBundle,
  industry?: IndustryOverlayId | null,
  asOf?: string,
): CouncilJudgement {
  const assessments = roleIds.map((roleId) =>
    judgeAsExecutive(roleId, factors, industry),
  );
  return formCouncilJudgement(assessments, asOf);
}
