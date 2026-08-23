import type {
  ExecutiveIntelligenceRoleId,
  IndustryBehaviourOverlay,
  IndustryOverlayId,
} from "@/intelligence-models/types";
import { MANUFACTURING_OVERLAYS } from "@/intelligence-models/overlays/manufacturing";
import { MINING_OVERLAYS } from "@/intelligence-models/overlays/mining";
import { UTILITIES_OVERLAYS } from "@/intelligence-models/overlays/utilities";
import { HEALTHCARE_OVERLAYS } from "@/intelligence-models/overlays/healthcare";
import { FIELD_SERVICES_OVERLAYS } from "@/intelligence-models/overlays/field-services";
import { TECHNOLOGY_OVERLAYS } from "@/intelligence-models/overlays/technology";

export {
  MANUFACTURING_OVERLAYS,
  MINING_OVERLAYS,
  UTILITIES_OVERLAYS,
  HEALTHCARE_OVERLAYS,
  FIELD_SERVICES_OVERLAYS,
  TECHNOLOGY_OVERLAYS,
};

export const ALL_INDUSTRY_OVERLAYS: IndustryBehaviourOverlay[] = [
  ...MANUFACTURING_OVERLAYS,
  ...MINING_OVERLAYS,
  ...UTILITIES_OVERLAYS,
  ...HEALTHCARE_OVERLAYS,
  ...FIELD_SERVICES_OVERLAYS,
  ...TECHNOLOGY_OVERLAYS,
];

export function getIndustryOverlay(
  industry: IndustryOverlayId,
  roleId: ExecutiveIntelligenceRoleId,
): IndustryBehaviourOverlay | undefined {
  return ALL_INDUSTRY_OVERLAYS.find(
    (overlay) => overlay.industry === industry && overlay.roleId === roleId,
  );
}

export function listOverlaysForIndustry(
  industry: IndustryOverlayId,
): IndustryBehaviourOverlay[] {
  return ALL_INDUSTRY_OVERLAYS.filter((overlay) => overlay.industry === industry);
}
