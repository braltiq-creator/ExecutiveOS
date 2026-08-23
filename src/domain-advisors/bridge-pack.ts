/**
 * Bridge: Industry Intelligence Pack → Domain Advisors
 *
 * Activation is by pack.industry() label.
 * Does not modify Core, Council members, or providers.
 */

import { activateDomainAdvisorsForIndustry } from "@/domain-advisors/resolve";
import type { ExecutiveIntelligencePack } from "@/intelligence-packs/contract";

export function domainAdvisorsActivatedByPack(pack: ExecutiveIntelligencePack) {
  return activateDomainAdvisorsForIndustry(pack.industry());
}

export function packProvidesDomainAdvisors(
  pack: ExecutiveIntelligencePack,
): boolean {
  return (
    pack.manifest.provides.includes("domain-advisors") ||
    activateDomainAdvisorsForIndustry(pack.industry()).activated
  );
}
