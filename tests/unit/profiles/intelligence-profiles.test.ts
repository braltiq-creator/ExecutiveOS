import { describe, expect, it, beforeEach } from "vitest";
import {
  listIntelligenceProfiles,
  getIntelligenceProfile,
  recommendIntelligenceProfile,
  selectTenantIntelligenceProfile,
  applyRecommendedProfile,
  resetTenantProfileSelections,
  listTenantProfileSelections,
  projectProfileExperience,
  runProfileValidationScenarios,
  OPERATIONS_EXECUTIVE_PROFILE,
  COMMERCIAL_EXECUTIVE_PROFILE,
} from "@/profiles";
import {
  createDiscoverySession,
  submitMinimumQuestions,
  runDiscovery,
  completeDiscovery,
  selectDiscoveryIntelligenceProfile,
  resetDiscoverySessions,
  saveDiscoverySession,
} from "@/onboarding";
import { runExecutiveIntelligence } from "@/intelligence/executive-intelligence";
import { MOCK_OUTCOME_PORTFOLIO } from "@/lib/outcomes/mock-portfolio";
import {
  bootstrapNorthlineRuntime,
  projectExperienceForTenant,
} from "@/runtime";
import { buildExecutiveSnapshotForUi } from "@/intelligence/executive-intelligence";
import { buildValidationSuite } from "@/validation";

describe("Executive Intelligence Profiles", () => {
  beforeEach(() => {
    resetTenantProfileSelections();
    resetDiscoverySessions();
  });

  it("catalogues Operations and Commercial profiles as independently deployable", () => {
    const catalog = listIntelligenceProfiles();
    expect(catalog.map((p) => p.id).sort()).toEqual([
      "commercial_executive",
      "operations_executive",
    ]);
    expect(OPERATIONS_EXECUTIVE_PROFILE.recommendedProviders).toEqual([
      "microsoft365",
      "simpro",
    ]);
    expect(COMMERCIAL_EXECUTIVE_PROFILE.recommendedProviders).toEqual([
      "microsoft365",
      "salesforce",
    ]);
    expect(OPERATIONS_EXECUTIVE_PROFILE.tagline.length).toBeGreaterThan(10);
    expect(COMMERCIAL_EXECUTIVE_PROFILE.summary).not.toMatch(/connector|api/i);
  });

  it("recommends Operations when Simpro is the primary operating system", () => {
    const rec = recommendIntelligenceProfile({
      role: "COO",
      primaryObjective: "Operational Excellence",
      connectedProviders: ["microsoft365", "simpro"],
    });
    expect(rec.profileId).toBe("operations_executive");
    expect(rec.explanation).toMatch(/Operations Executive|Simpro/i);
    expect(rec.alternatives[0]?.profileId).toBe("commercial_executive");
  });

  it("recommends Commercial when Salesforce is the primary commercial platform", () => {
    const rec = recommendIntelligenceProfile({
      role: "CEO",
      primaryObjective: "Growth",
      connectedProviders: ["microsoft365", "salesforce"],
    });
    expect(rec.profileId).toBe("commercial_executive");
    expect(rec.explanation).toMatch(/Commercial Executive|Salesforce/i);
  });

  it("allows manual override during discovery and persists tenant selection", () => {
    let session = createDiscoverySession({
      tenantId: "tenant-partner-a",
      userId: "exec-a",
    });
    session = submitMinimumQuestions(session, {
      role: "COO",
      primaryObjective: "Operational Excellence",
      briefingTime: "Morning",
    });
    session = runDiscovery(session, {
      connectedSystems: ["microsoft365", "simpro"],
      asOf: "2026-07-26T08:00:00.000Z",
    });
    expect(session.profileRecommendation?.profileId).toBe(
      "operations_executive",
    );

    session = selectDiscoveryIntelligenceProfile(
      session,
      "commercial_executive",
    );
    expect(session.intelligenceProfileId).toBe("commercial_executive");

    session = completeDiscovery(session, "2026-07-26T08:10:00.000Z");
    saveDiscoverySession(session);
    expect(session.intelligenceProfileId).toBe("commercial_executive");
    expect(listTenantProfileSelections()[0]?.source).toBe("manual");
  });

  it("adapts Today brief layout for Operations vs Commercial", () => {
    const snapshot = buildExecutiveSnapshotForUi(MOCK_OUTCOME_PORTFOLIO);

    const ops = projectProfileExperience({
      tenantId: "tenant-ops",
      snapshot,
      profileId: "operations_executive",
    });
    expect(ops.briefingMode).toMatch(/Operational-first/i);
    expect(ops.briefLayout.findIndex((s) => s.id === "operational_context")).toBeLessThan(
      ops.briefLayout.findIndex((s) => s.id === "commercial_context"),
    );

    const commercial = projectProfileExperience({
      tenantId: "tenant-commercial",
      snapshot,
      profileId: "commercial_executive",
    });
    expect(commercial.briefingMode).toMatch(/Commercial-first/i);
    expect(
      commercial.briefLayout.findIndex((s) => s.id === "commercial_context"),
    ).toBeLessThan(
      commercial.briefLayout.findIndex((s) => s.id === "operational_context"),
    );
  });

  it("projects profile through runtime experience without Core changes", () => {
    selectTenantIntelligenceProfile({
      tenantId: "tenant-northline",
      profileId: "operations_executive",
      source: "recommended",
      asOf: "2026-07-26T08:00:00.000Z",
    });
    const core = buildExecutiveSnapshotForUi(MOCK_OUTCOME_PORTFOLIO);
    const { context } = bootstrapNorthlineRuntime({ role: "ceo" });
    const experience = projectExperienceForTenant(context, core);
    expect(experience.intelligenceProfile.id).toBe("operations_executive");
    expect(experience.briefLayout[0]?.id).toBe("pulse");
    expect(experience.snapshot.operationalContext).toBeTruthy();
  });

  it("runs profile-specific validation scenarios", () => {
    const snapshot = runExecutiveIntelligence(MOCK_OUTCOME_PORTFOLIO);
    const ops = runProfileValidationScenarios({
      tenantId: "tenant-ops",
      profileId: "operations_executive",
      snapshot,
    });
    expect(ops.scenarios).toHaveLength(3);
    expect(ops.ready).toBe(true);
    expect(ops.scenarios.every((s) => s.passed)).toBe(true);

    const commercial = runProfileValidationScenarios({
      tenantId: "tenant-commercial",
      profileId: "commercial_executive",
      snapshot,
    });
    expect(commercial.scenarios).toHaveLength(3);
    expect(commercial.ready).toBe(true);
  });

  it("isolates four Design Partner profile selections", () => {
    const partners = [
      {
        id: "tenant-dp-1",
        profile: "operations_executive" as const,
      },
      {
        id: "tenant-dp-2",
        profile: "commercial_executive" as const,
      },
      {
        id: "tenant-dp-3",
        profile: "operations_executive" as const,
      },
      {
        id: "tenant-dp-4",
        profile: "commercial_executive" as const,
      },
    ];
    for (const partner of partners) {
      selectTenantIntelligenceProfile({
        tenantId: partner.id,
        profileId: partner.profile,
        source: "manual",
        asOf: "2026-07-26T08:00:00.000Z",
      });
    }
    const selections = listTenantProfileSelections();
    expect(selections).toHaveLength(4);
    expect(selections.map((s) => s.tenantId).sort()).toEqual(
      partners.map((p) => p.id).sort(),
    );
    expect(
      getIntelligenceProfile(
        selections.find((s) => s.tenantId === "tenant-dp-2")!.profileId,
      ).name,
    ).toBe("Commercial Executive");
  });

  it("includes Intelligence Profile validation in the Validation Suite", () => {
    applyRecommendedProfile({
      tenantId: "tenant-northline",
      connectedProviders: ["microsoft365", "simpro"],
      role: "Managing Director",
      primaryObjective: "Operational Excellence",
    });
    const dashboard = buildValidationSuite({
      tenantId: "tenant-northline",
      asOf: "2026-07-26T08:00:00.000Z",
    });
    expect(dashboard.intelligenceProfileValidation?.profileId).toBe(
      "operations_executive",
    );
    expect(
      dashboard.intelligenceProfileValidation?.scenarios.length,
    ).toBeGreaterThan(0);
  });

  it("keeps integrations invisible in executive-facing copy", () => {
    for (const profile of listIntelligenceProfiles()) {
      expect(profile.name).not.toMatch(/Microsoft|Salesforce|Simpro/i);
      expect(profile.tagline).not.toMatch(/API|OAuth|connector/i);
      expect(profile.executiveQuestions.join(" ")).not.toMatch(
        /Salesforce|Simpro|Microsoft 365/i,
      );
    }
  });
});
