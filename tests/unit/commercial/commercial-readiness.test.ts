import { describe, expect, it, beforeEach } from "vitest";
import {
  resetCommercialPlatform,
  ensureDefaultEditions,
  registerEdition,
  listEditions,
  getEdition,
  issueLicense,
  updateLicenseUsage,
  listLicenses,
  quoteEdition,
  listPricingBands,
  IMPLEMENTATION_STAGES,
  createImplementationPlan,
  completeImplementationStage,
  createSuccessPlan,
  updateSuccessPlan,
  assessSuccessPlanHealth,
  generateCustomerRoiReport,
  buildSecurityPack,
  buildSalesEnablementAssets,
  recommendExpansionOpportunities,
  createContract,
  syncRenewalsFromLicenses,
  buildCommercialDashboard,
} from "@/commercial";
import {
  provisionDesignPartner,
  resetPilotRegistry,
  resetReadinessHistory,
} from "@/pilot";
import { resetOperationsCentre, syncPartnersFromPilots } from "@/operations";
import { resetExperimentationPlatform } from "@/experiments";
import { clearTenantRegistry } from "@/runtime/tenant";
import { resetTenantProfileSelections } from "@/profiles";
import { resetDiscoverySessions } from "@/onboarding";
import {
  resetFeedbackStore,
  resetRecommendationStore,
  resetValidationHistory,
} from "@/validation";
import { resetM365ConnectionRegistry } from "@/providers/microsoft365";
import { resetSimproConnectionRegistry } from "@/providers/simpro";
import { resetSalesforceConnectionRegistry } from "@/providers/salesforce";

describe("Commercial Readiness Platform", () => {
  beforeEach(() => {
    resetCommercialPlatform();
    resetExperimentationPlatform();
    resetOperationsCentre();
    resetPilotRegistry();
    resetReadinessHistory();
    clearTenantRegistry();
    resetTenantProfileSelections();
    resetDiscoverySessions();
    resetFeedbackStore();
    resetRecommendationStore();
    resetValidationHistory();
    resetM365ConnectionRegistry();
    resetSimproConnectionRegistry();
    resetSalesforceConnectionRegistry();
  });

  function provisionOps() {
    const result = provisionDesignPartner({
      partnerName: "Ops Commercial Co",
      industry: "Field Services",
      intelligenceProfileId: "operations_executive",
      administratorEmail: "admin@ops-commercial.test",
      region: "au",
    });
    syncPartnersFromPilots();
    return result;
  }

  it("registers Operations and Commercial editions without Core changes", () => {
    ensureDefaultEditions();
    const editions = listEditions();
    expect(editions.map((e) => e.id).sort()).toEqual([
      "commercial_executive",
      "operations_executive",
    ]);
    const ops = getEdition("operations_executive");
    expect(ops?.includedProviders).toContain("simpro");
    expect(ops?.includedScenarioPacks.length).toBeGreaterThan(0);
    expect(ops?.expansionOpportunities[0]).toMatch(/Commercial/i);

    registerEdition({
      id: "operations_executive",
      name: "Operations Executive",
      targetCustomer: "Updated ICP",
      targetExecutive: "COO",
      intelligenceProfileId: "operations_executive",
      includedProviders: ["microsoft365", "simpro"],
      includedScenarioPacks: ["ops-focus-today"],
      includedStrategicOutcomes: ["Improve operational reliability"],
      includedReporting: ["Executive Brief"],
      implementationScope: ["Provision"],
      expansionOpportunities: ["Commercial Executive"],
    });
    expect(getEdition("operations_executive")?.targetCustomer).toBe(
      "Updated ICP",
    );
  });

  it("issues licenses across tiers with entitlements and renewals", () => {
    const { tenantId } = provisionOps();
    const license = issueLicense({
      tenantId,
      editionId: "operations_executive",
      tier: "pilot",
    });
    expect(license.entitlements.providerEntitlements).toContain("simpro");
    expect(license.entitlements.seats).toBeGreaterThan(0);
    expect(license.expansionEligible).toBe(true);

    updateLicenseUsage({
      licenseId: license.id,
      seatsUsed: 4,
      executivesActive: 2,
      providersConnected: 2,
    });
    expect(listLicenses(tenantId)[0]?.usage.seatsUsed).toBe(4);

    syncRenewalsFromLicenses();
    const quote = quoteEdition({
      editionId: "operations_executive",
      tier: "production",
      seats: 10,
    });
    expect(quote.monthly).toBeGreaterThan(0);
    expect(listPricingBands().length).toBeGreaterThan(3);
  });

  it("runs implementation methodology with exit criteria on every stage", () => {
    expect(IMPLEMENTATION_STAGES).toHaveLength(9);
    for (const stage of IMPLEMENTATION_STAGES) {
      expect(stage.exitCriteria.length).toBeGreaterThan(0);
    }

    const { tenantId } = provisionOps();
    const plan = createImplementationPlan({
      tenantId,
      editionId: "operations_executive",
    });
    expect(plan.currentStageId).toBe("discovery");
    const next = completeImplementationStage({
      planId: plan.id,
      stageId: "discovery",
      evidence: ["Sponsor confirmed"],
    });
    expect(next?.currentStageId).toBe("provisioning");
    expect(
      next?.stages.find((s) => s.stageId === "discovery")?.status,
    ).toBe("complete");
  });

  it("tracks success plans and generates ROI ranges with confidence", () => {
    const { tenantId } = provisionOps();
    const plan = createSuccessPlan({
      tenantId,
      editionId: "operations_executive",
      executiveSponsors: ["CEO", "COO"],
    });
    const updated = updateSuccessPlan(plan.id, {
      successMilestones: plan.successMilestones.map((m) => ({
        ...m,
        complete: true,
      })),
      risks: [],
    });
    expect(assessSuccessPlanHealth(updated!)).toBe("green");

    const roi = generateCustomerRoiReport({
      tenantId,
      editionId: "operations_executive",
    });
    expect(roi.executiveHoursSaved.low).toBeLessThanOrEqual(
      roi.executiveHoursSaved.mid,
    );
    expect(roi.executiveHoursSaved.confidence).toBeGreaterThan(0);
    expect(roi.narrative.length).toBeGreaterThan(40);
  });

  it("provides security pack, sales assets, expansion, and dashboard", () => {
    const ops = provisionOps();
    const com = provisionDesignPartner({
      partnerName: "Com Commercial Co",
      industry: "B2B Services",
      intelligenceProfileId: "commercial_executive",
      administratorEmail: "admin@com-commercial.test",
    });
    syncPartnersFromPilots();

    const lic = issueLicense({
      tenantId: ops.tenantId,
      editionId: "operations_executive",
      tier: "pilot",
    });
    updateLicenseUsage({
      licenseId: lic.id,
      executivesActive: 3,
      seatsUsed: 8,
      providersConnected: 2,
    });
    issueLicense({
      tenantId: com.tenantId,
      editionId: "commercial_executive",
      tier: "production",
    });
    createImplementationPlan({
      tenantId: ops.tenantId,
      editionId: "operations_executive",
    });
    createSuccessPlan({
      tenantId: ops.tenantId,
      editionId: "operations_executive",
    });
    generateCustomerRoiReport({
      tenantId: ops.tenantId,
      editionId: "operations_executive",
    });
    createContract({
      tenantId: ops.tenantId,
      licenseId: lic.id,
      kind: "pilot_msa",
      status: "signed",
    });

    const security = buildSecurityPack();
    expect(security.sections.map((s) => s.id)).toEqual(
      expect.arrayContaining([
        "architecture",
        "tenant_isolation",
        "identity",
        "encryption",
        "audit",
        "backups",
        "recovery",
        "compliance",
        "governance",
      ]),
    );

    const sales = buildSalesEnablementAssets();
    expect(sales.map((a) => a.id)).toContain("edition_comparison");
    expect(sales.map((a) => a.id)).toContain("faq");

    const expansion = recommendExpansionOpportunities();
    expect(expansion.some((e) => e.toLabel.includes("Commercial"))).toBe(true);
    expect(expansion.some((e) => e.toLabel.includes("executives"))).toBe(true);

    const dashboard = buildCommercialDashboard();
    expect(dashboard.editions).toHaveLength(2);
    expect(dashboard.summary.activeLicenses).toBe(2);
    expect(dashboard.salesAssets.length).toBeGreaterThan(0);
    expect(dashboard.securityPack.sections.length).toBe(9);
  });
});
