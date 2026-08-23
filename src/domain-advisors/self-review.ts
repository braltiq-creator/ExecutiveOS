import { ALL_DOMAIN_ADVISOR_CATALOGUES } from "@/domain-advisors/catalogues";
import { validateCatalogueEntry, validateDomainAdvisor } from "@/domain-advisors/define";
import { MANUFACTURING_DOMAIN_ADVISORS } from "@/domain-advisors/advisors/manufacturing/advisors";
import { PERMANENT_COUNCIL_ROLE_IDS } from "@/domain-advisors/define";

export type DomainAdvisorSelfReview = {
  ok: boolean;
  councilStable: boolean;
  industriesWithCatalogues: number;
  manufacturingFullAdvisors: number;
  errors: string[];
  warnings: string[];
};

/**
 * Self-review gates for Phase 52A.
 */
export function reviewDomainAdvisorFramework(): DomainAdvisorSelfReview {
  const errors: string[] = [];
  const warnings: string[] = [];

  const councilStable =
    PERMANENT_COUNCIL_ROLE_IDS.length === 5 &&
    PERMANENT_COUNCIL_ROLE_IDS.join(",") === "ceo,cfo,coo,cro,cso";

  if (!councilStable) {
    errors.push("Permanent Council role set must remain CEO·CFO·COO·CRO·CSO");
  }

  if (ALL_DOMAIN_ADVISOR_CATALOGUES.length < 12) {
    errors.push("Expected catalogues for 12 industries");
  }

  for (const cat of ALL_DOMAIN_ADVISOR_CATALOGUES) {
    if (cat.entries.length === 0) {
      errors.push(`${cat.industry}: empty catalogue`);
    }
    for (const entry of cat.entries) {
      const v = validateCatalogueEntry(entry);
      if (!v.ok) {
        errors.push(...v.errors.map((e) => `${entry.id}: ${e}`));
      }
    }
  }

  for (const advisor of MANUFACTURING_DOMAIN_ADVISORS) {
    const v = validateDomainAdvisor(advisor);
    if (!v.ok) errors.push(...v.errors.map((e) => `${advisor.identity.id}: ${e}`));
    warnings.push(...v.warnings.map((w) => `${advisor.identity.id}: ${w}`));
  }

  if (MANUFACTURING_DOMAIN_ADVISORS.length !== 10) {
    errors.push("Manufacturing must ship 10 full Domain Advisors");
  }

  // Advisors must not claim Council membership in purpose/mission
  for (const advisor of MANUFACTURING_DOMAIN_ADVISORS) {
    const blob = `${advisor.identity.purpose} ${advisor.mission}`.toLowerCase();
    if (blob.includes("council member") || blob.includes("joins the council")) {
      errors.push(`${advisor.identity.id}: must not claim Council membership`);
    }
  }

  return {
    ok: errors.length === 0,
    councilStable,
    industriesWithCatalogues: ALL_DOMAIN_ADVISOR_CATALOGUES.length,
    manufacturingFullAdvisors: MANUFACTURING_DOMAIN_ADVISORS.length,
    errors,
    warnings,
  };
}
