/**
 * Resolve Domain Advisors activated by an industry / Intelligence Pack.
 */

import { MANUFACTURING_DOMAIN_ADVISORS } from "@/domain-advisors/advisors/manufacturing/advisors";
import { getDomainAdvisorCatalogue } from "@/domain-advisors/catalogues";
import type {
  DomainAdvisorCatalogue,
  DomainAdvisorCatalogueEntry,
  DomainAdvisorIndustryId,
  ExecutiveDomainAdvisor,
} from "@/domain-advisors/types";

const FULL_ADVISORS_BY_INDUSTRY: Partial<
  Record<DomainAdvisorIndustryId, readonly ExecutiveDomainAdvisor[]>
> = {
  manufacturing: MANUFACTURING_DOMAIN_ADVISORS,
};

export function listFullDomainAdvisors(
  industry: DomainAdvisorIndustryId,
): readonly ExecutiveDomainAdvisor[] {
  return FULL_ADVISORS_BY_INDUSTRY[industry] ?? [];
}

export function getDomainAdvisor(
  industry: DomainAdvisorIndustryId,
  advisorId: string,
): ExecutiveDomainAdvisor | undefined {
  return listFullDomainAdvisors(industry).find(
    (a) => a.identity.id === advisorId,
  );
}

export function listCatalogueEntries(
  industry: DomainAdvisorIndustryId,
): DomainAdvisorCatalogueEntry[] {
  return getDomainAdvisorCatalogue(industry)?.entries ?? [];
}

/**
 * Pack activation — industry label from Intelligence Pack activates the catalogue.
 * No Core wiring. No Council seat changes.
 */
export function activateDomainAdvisorsForIndustry(
  industry: string,
): {
  industry: DomainAdvisorIndustryId | null;
  catalogue: DomainAdvisorCatalogue | null;
  fullAdvisors: readonly ExecutiveDomainAdvisor[];
  activated: boolean;
} {
  const normalised = industry.trim().toLowerCase().replace(/[\s-]+/g, "_");
  const catalogue = getDomainAdvisorCatalogue(
    normalised as DomainAdvisorIndustryId,
  );
  if (!catalogue) {
    return {
      industry: null,
      catalogue: null,
      fullAdvisors: [],
      activated: false,
    };
  }
  return {
    industry: catalogue.industry,
    catalogue,
    fullAdvisors: listFullDomainAdvisors(catalogue.industry),
    activated: true,
  };
}
