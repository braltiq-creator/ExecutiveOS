/**
 * Optional bridge: project EIM behaviour into EIPF PackCouncilKnowledge shape.
 * Does not register packs or modify Core — helper for future pack authors.
 */

import type { PackCouncilKnowledge } from "@/intelligence-packs/contract";
import type { CouncilRoleId } from "@/experience/executive-council/members";
import { resolveExecutiveIntelligence } from "@/intelligence-models/resolve";
import type {
  ExecutiveIntelligenceRoleId,
  IndustryOverlayId,
} from "@/intelligence-models/types";

const PACK_COUNCIL_ROLES: CouncilRoleId[] = [
  "ceo",
  "cfo",
  "coo",
  "cro",
  "cso",
];

function isPackCouncilRole(
  roleId: ExecutiveIntelligenceRoleId,
): roleId is CouncilRoleId {
  return (PACK_COUNCIL_ROLES as string[]).includes(roleId);
}

/**
 * Map a resolved EIM into PackCouncilKnowledge for EIPF authors.
 */
export function toPackCouncilKnowledge(
  roleId: ExecutiveIntelligenceRoleId,
  industry?: IndustryOverlayId | null,
): PackCouncilKnowledge | null {
  if (!isPackCouncilRole(roleId)) return null;

  const resolved = resolveExecutiveIntelligence(roleId, industry);
  return {
    roleId,
    monitoringDomains: [
      ...resolved.observation.monitors.slice(0, 6),
      ...resolved.priorityEmphasis.slice(0, 3),
    ],
    typicalConcerns: resolved.challenge.challengeQuestions.slice(0, 4),
    questionsBeforeRecommend: resolved.challenge.challengeQuestions.slice(0, 5),
    decisionFramework: resolved.identity.behaviouralThesis,
    reasoningHints: [
      ...resolved.identity.durableMentalModels.slice(0, 3),
      ...resolved.diagnosis.interpretationPrinciples.slice(0, 2),
      ...resolved.thresholdOverrides.slice(0, 2),
    ],
  };
}

export function packCouncilKnowledgeFromModels(
  industry?: IndustryOverlayId | null,
): PackCouncilKnowledge[] {
  return PACK_COUNCIL_ROLES.map((roleId) =>
    toPackCouncilKnowledge(roleId, industry),
  ).filter((item): item is PackCouncilKnowledge => Boolean(item));
}
