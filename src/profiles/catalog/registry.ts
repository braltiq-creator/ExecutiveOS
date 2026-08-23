import { OPERATIONS_EXECUTIVE_PROFILE } from "@/profiles/operations";
import { COMMERCIAL_EXECUTIVE_PROFILE } from "@/profiles/commercial";
import type {
  IntelligenceProfile,
  IntelligenceProfileId,
} from "@/profiles/framework/types";

const CATALOG: IntelligenceProfile[] = [
  OPERATIONS_EXECUTIVE_PROFILE,
  COMMERCIAL_EXECUTIVE_PROFILE,
];

export function listIntelligenceProfiles(): IntelligenceProfile[] {
  return [...CATALOG];
}

export function getIntelligenceProfile(
  id: IntelligenceProfileId,
): IntelligenceProfile {
  const hit = CATALOG.find((p) => p.id === id);
  if (!hit) throw new Error(`Unknown intelligence profile: ${id}`);
  return hit;
}

export function isIntelligenceProfileId(
  value: string,
): value is IntelligenceProfileId {
  return CATALOG.some((p) => p.id === value);
}
