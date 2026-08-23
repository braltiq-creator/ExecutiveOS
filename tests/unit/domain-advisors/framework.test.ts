import { describe, expect, it } from "vitest";
import {
  activateDomainAdvisorsForIndustry,
  ALL_DOMAIN_ADVISOR_CATALOGUES,
  DEMAND_PLANNING_ADVISOR,
  domainAdvisorsActivatedByPack,
  MANUFACTURING_DOMAIN_ADVISORS,
  PERMANENT_COUNCIL_ROLE_IDS,
  reviewDomainAdvisorFramework,
  validateDomainAdvisor,
} from "@/domain-advisors";
import { createManufacturingExecutivePack } from "@/intelligence-packs/packs/manufacturing";

describe("Executive Domain Advisor Framework (Phase 52A)", () => {
  it("keeps the permanent Executive Council stable", () => {
    expect(PERMANENT_COUNCIL_ROLE_IDS).toEqual([
      "ceo",
      "cfo",
      "coo",
      "cro",
      "cso",
    ]);
  });

  it("ships catalogues for twelve industries", () => {
    expect(ALL_DOMAIN_ADVISOR_CATALOGUES).toHaveLength(12);
    const industries = ALL_DOMAIN_ADVISOR_CATALOGUES.map((c) => c.industry);
    expect(industries).toContain("manufacturing");
    expect(industries).toContain("mining");
    expect(industries).toContain("logistics");
  });

  it("implements ten full Manufacturing Domain Advisors", () => {
    expect(MANUFACTURING_DOMAIN_ADVISORS).toHaveLength(10);
    for (const advisor of MANUFACTURING_DOMAIN_ADVISORS) {
      const result = validateDomainAdvisor(advisor);
      expect(result.ok, result.errors.join("; ")).toBe(true);
      expect(advisor.identity.industry).toBe("manufacturing");
    }
  });

  it("Demand Planning Advisor covers hierarchical demand", () => {
    expect(DEMAND_PLANNING_ADVISOR.continuousObservations.join(" ")).toMatch(
      /national|regional|branch|variant/i,
    );
    expect(DEMAND_PLANNING_ADVISOR.executiveRelationships.cro).toBeTruthy();
  });

  it("activates advisors from Manufacturing pack industry label", () => {
    const pack = createManufacturingExecutivePack();
    expect(pack.manifest.provides).toContain("domain-advisors");
    const activated = domainAdvisorsActivatedByPack(pack);
    expect(activated.activated).toBe(true);
    expect(activated.fullAdvisors.length).toBe(10);
  });

  it("does not activate unknown industries", () => {
    const result = activateDomainAdvisorsForIndustry("unknown_vertical");
    expect(result.activated).toBe(false);
  });

  it("passes framework self-review", () => {
    const review = reviewDomainAdvisorFramework();
    expect(review.councilStable).toBe(true);
    expect(review.ok, review.errors.join("; ")).toBe(true);
  });
});
