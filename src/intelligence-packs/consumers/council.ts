/**
 * Council knowledge consumer — role-consistent, industry-aware.
 * Does not alter permanent Council roles; overlays pack knowledge.
 */

import type { CouncilRoleId } from "@/experience/executive-council/members";
import { EXECUTIVE_COUNCIL } from "@/experience/executive-council/members";
import type {
  ExecutiveIntelligencePack,
  PackCouncilKnowledge,
  PackCouncilOverlay,
} from "@/intelligence-packs/contract";
import type { IntelligencePackRegistry } from "@/intelligence-packs/registry";

const ROLE_IDS: CouncilRoleId[] = ["ceo", "cfo", "coo", "cro", "cso"];

export function buildCouncilOverlay(
  pack: ExecutiveIntelligencePack,
): PackCouncilOverlay {
  const byRole = Object.fromEntries(
    ROLE_IDS.map((roleId) => [roleId, null]),
  ) as PackCouncilOverlay["byRole"];

  for (const knowledge of pack.councilKnowledge()) {
    byRole[knowledge.roleId] = knowledge;
  }

  return {
    packId: pack.manifest.id,
    industry: pack.industry(),
    byRole,
  };
}

/**
 * Merge council knowledge across active packs for a role.
 * Later packs extend (not replace) concerns / questions when multi-pack.
 */
export function resolveCouncilKnowledgeForRole(
  packs: ExecutiveIntelligencePack[],
  roleId: CouncilRoleId,
): PackCouncilKnowledge | null {
  const member = EXECUTIVE_COUNCIL.find((item) => item.id === roleId);
  const pieces = packs
    .map((pack) =>
      pack.councilKnowledge().find((item) => item.roleId === roleId),
    )
    .filter((item): item is PackCouncilKnowledge => Boolean(item));

  if (pieces.length === 0) return null;

  const base = pieces[0]!;
  if (pieces.length === 1) return base;

  return {
    roleId,
    monitoringDomains: unique([
      ...pieces.flatMap((item) => item.monitoringDomains),
    ]),
    typicalConcerns: unique([
      ...(member?.typicalConcerns ?? []),
      ...pieces.flatMap((item) => item.typicalConcerns),
    ]),
    questionsBeforeRecommend: unique(
      pieces.flatMap((item) => item.questionsBeforeRecommend),
    ),
    decisionFramework: pieces.map((item) => item.decisionFramework).join(" · "),
    reasoningHints: unique(pieces.flatMap((item) => item.reasoningHints)),
    focusOntologyTermIds: unique(
      pieces.flatMap((item) => item.focusOntologyTermIds ?? []),
    ),
  };
}

export function collectCouncilOverlays(
  registry: IntelligencePackRegistry,
  packIds?: string[],
): PackCouncilOverlay[] {
  const packs = packIds
    ? packIds
        .map((id) => registry.get(id))
        .filter((pack): pack is ExecutiveIntelligencePack => Boolean(pack))
    : registry.activePacks().length > 0
      ? registry.activePacks()
      : registry.list();

  return packs.map(buildCouncilOverlay);
}

/**
 * Presentation helper — pack-aware reasoning preface for a Council role.
 * Experience layer may call this; Core is never involved.
 */
export function councilIndustryPreface(
  pack: ExecutiveIntelligencePack,
  roleId: CouncilRoleId,
): string {
  const knowledge = pack
    .councilKnowledge()
    .find((item) => item.roleId === roleId);
  if (!knowledge) {
    return `${roleId.toUpperCase()} operates with role-default judgement.`;
  }
  const hint = knowledge.reasoningHints[0] ?? knowledge.decisionFramework;
  return `${roleId.toUpperCase()} in ${pack.industry()}: ${hint}`;
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}
