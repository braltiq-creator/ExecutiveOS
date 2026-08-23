/**
 * Define and validate Executive Domain Advisors.
 */

import type {
  DomainAdvisorCatalogueEntry,
  DomainAdvisorSemVer,
  ExecutiveDomainAdvisor,
  ExecutiveRelationshipMap,
  PermanentCouncilRoleId,
} from "@/domain-advisors/types";

export const PERMANENT_COUNCIL_ROLE_IDS: PermanentCouncilRoleId[] = [
  "ceo",
  "cfo",
  "coo",
  "cro",
  "cso",
];

export type DefineDomainAdvisorInput = Omit<
  ExecutiveDomainAdvisor,
  "version" | "versionLabel"
> & {
  version?: DomainAdvisorSemVer;
};

function versionLabel(version: DomainAdvisorSemVer): string {
  return `${version.major}.${version.minor}.${version.patch}`;
}

export function defineDomainAdvisor(
  input: DefineDomainAdvisorInput,
): ExecutiveDomainAdvisor {
  const version = input.version ?? { major: 1, minor: 0, patch: 0 };
  return {
    ...input,
    version,
    versionLabel: versionLabel(version),
  };
}

export function defineCatalogueEntry(
  entry: DomainAdvisorCatalogueEntry,
): DomainAdvisorCatalogueEntry {
  return entry;
}

export function relationships(
  map: ExecutiveRelationshipMap,
): ExecutiveRelationshipMap {
  for (const role of PERMANENT_COUNCIL_ROLE_IDS) {
    if (!map[role]?.trim()) {
      throw new Error(`executiveRelationships.${role} required`);
    }
  }
  return map;
}

export function validateDomainAdvisor(advisor: ExecutiveDomainAdvisor): {
  ok: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!advisor.identity.id) errors.push("identity.id required");
  if (!advisor.identity.purpose) errors.push("identity.purpose required");
  if (!advisor.identity.behaviouralThesis) {
    errors.push("identity.behaviouralThesis required");
  }
  if (advisor.identity.expertise.length === 0) {
    errors.push("identity.expertise must not be empty");
  }
  if (!advisor.mission) errors.push("mission required");
  if (advisor.primaryDecisions.length === 0) {
    errors.push("primaryDecisions must not be empty");
  }
  if (advisor.challenge.challengeQuestions.length === 0) {
    errors.push("challenge.challengeQuestions required");
  }
  if (advisor.observation.monitors.length === 0) {
    errors.push("observation.monitors required");
  }
  if (!advisor.explainability.humanAuthorityStatement) {
    errors.push("explainability.humanAuthorityStatement required");
  }

  for (const role of PERMANENT_COUNCIL_ROLE_IDS) {
    if (!advisor.executiveRelationships[role]?.trim()) {
      errors.push(`executiveRelationships.${role} required`);
    }
  }

  if (
    advisor.explainability.humanAuthorityStatement
      .toLowerCase()
      .includes("decides for")
  ) {
    warnings.push(
      "humanAuthorityStatement should not imply the advisor decides for the executive",
    );
  }

  return { ok: errors.length === 0, errors, warnings };
}

export function validateCatalogueEntry(entry: DomainAdvisorCatalogueEntry): {
  ok: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  if (!entry.id) errors.push("id required");
  if (!entry.mission) errors.push("mission required");
  if (entry.primaryDecisions.length === 0) {
    errors.push("primaryDecisions required");
  }
  for (const role of PERMANENT_COUNCIL_ROLE_IDS) {
    if (!entry.executiveRelationships[role]?.trim()) {
      errors.push(`executiveRelationships.${role} required`);
    }
  }
  return { ok: errors.length === 0, errors };
}
