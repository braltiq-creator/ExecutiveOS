/**
 * Resolve executive behaviour = EIM + optional industry overlay.
 */

import { applyIndustryOverlay } from "@/intelligence-models/apply-overlay";
import { getExecutiveIntelligenceModel } from "@/intelligence-models/roles";
import { getIndustryOverlay } from "@/intelligence-models/overlays";
import type {
  ExecutiveIntelligenceRoleId,
  IndustryOverlayId,
  ResolvedExecutiveIntelligenceModel,
} from "@/intelligence-models/types";

/**
 * Primary API for future Council / pack wiring.
 * Operates without industry context when industry is null.
 */
export function resolveExecutiveIntelligence(
  roleId: ExecutiveIntelligenceRoleId,
  industry?: IndustryOverlayId | null,
): ResolvedExecutiveIntelligenceModel {
  const model = getExecutiveIntelligenceModel(roleId);
  if (!model) {
    throw new Error(`Unknown executive intelligence role: ${roleId}`);
  }

  if (!industry || industry === "generic") {
    return applyIndustryOverlay(model, null, industry ?? null);
  }

  const overlay = getIndustryOverlay(industry, roleId) ?? null;
  return applyIndustryOverlay(model, overlay, industry);
}
