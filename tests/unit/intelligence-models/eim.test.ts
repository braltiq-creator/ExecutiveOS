import { describe, expect, it } from "vitest";
import {
  EXECUTIVE_INTELLIGENCE_MODELS,
  PERMANENT_COUNCIL_ROLE_IDS,
  applyIndustryOverlay,
  getExecutiveIntelligenceModel,
  getIndustryOverlay,
  identityUnchanged,
  packCouncilKnowledgeFromModels,
  resolveExecutiveIntelligence,
  reviewExecutiveIntelligenceModels,
  validateExecutiveIntelligenceModel,
} from "@/intelligence-models";

describe("Executive Intelligence Models (EIM)", () => {
  it("defines ten complete behavioural models", () => {
    expect(EXECUTIVE_INTELLIGENCE_MODELS).toHaveLength(10);
    for (const model of EXECUTIVE_INTELLIGENCE_MODELS) {
      const validation = validateExecutiveIntelligenceModel(model);
      expect(validation.ok).toBe(true);
      expect(model.observation.monitors.length).toBeGreaterThan(0);
      expect(model.diagnosis.rootCauseLenses.length).toBeGreaterThan(0);
      expect(model.challenge.challengeQuestions.length).toBeGreaterThan(0);
      expect(model.recommendation.responseOptions.length).toBeGreaterThan(0);
      expect(model.communication.structure.length).toBeGreaterThan(0);
      expect(model.learning.confidenceAdjustmentRules.length).toBeGreaterThan(0);
      expect(model.councilInteraction.consensusBehaviours.length).toBeGreaterThan(
        0,
      );
      expect(model.identity.durableMentalModels.length).toBeGreaterThan(0);
    }
  });

  it("operates without industry context", () => {
    const cfo = resolveExecutiveIntelligence("cfo");
    expect(cfo.overlayApplied).toBe(false);
    expect(cfo.industry).toBeNull();
    expect(cfo.identity.shortTitle).toBe("CFO");
    expect(cfo.challenge.challengeQuestions[0]).toMatch(/cash/i);
  });

  it("applies industry overlays without rewriting identity", () => {
    const base = getExecutiveIntelligenceModel("cfo")!;
    const overlay = getIndustryOverlay("manufacturing", "cfo")!;
    const resolved = applyIndustryOverlay(base, overlay, "manufacturing");

    expect(identityUnchanged(base, resolved)).toBe(true);
    expect(resolved.overlayApplied).toBe(true);
    expect(resolved.identity.behaviouralThesis).toBe(base.identity.behaviouralThesis);
    expect(resolved.observation.monitors).toEqual(
      expect.arrayContaining(["DIO by class", "E&O %"]),
    );
    expect(resolved.thresholdOverrides.length).toBeGreaterThan(0);
    expect(resolved.priorityEmphasis[0]).toMatch(/CCC|inventory/i);
  });

  it("keeps CFO identity identical across industries", () => {
    const industries = [
      "manufacturing",
      "mining",
      "utilities",
      "healthcare",
      "technology",
    ] as const;
    const theses = industries.map(
      (industry) =>
        resolveExecutiveIntelligence("cfo", industry).identity.behaviouralThesis,
    );
    expect(new Set(theses).size).toBe(1);

    const monitors = industries.map(
      (industry) =>
        resolveExecutiveIntelligence("cfo", industry).observation.monitors.join("|"),
    );
    // Overlays should differentiate observation context
    expect(new Set(monitors).size).toBeGreaterThan(1);
  });

  it("covers permanent Council roles and future roles", () => {
    for (const roleId of PERMANENT_COUNCIL_ROLE_IDS) {
      expect(getExecutiveIntelligenceModel(roleId)).toBeTruthy();
    }
    expect(getExecutiveIntelligenceModel("cco")).toBeTruthy();
    expect(getExecutiveIntelligenceModel("crisk")).toBeTruthy();
  });

  it("bridges to EIPF PackCouncilKnowledge without Core changes", () => {
    const knowledge = packCouncilKnowledgeFromModels("manufacturing");
    expect(knowledge).toHaveLength(5);
    expect(knowledge.map((item) => item.roleId)).toEqual(
      expect.arrayContaining(["ceo", "cfo", "coo", "cro", "cso"]),
    );
    const cfo = knowledge.find((item) => item.roleId === "cfo")!;
    expect(cfo.decisionFramework).toMatch(/cash|economic/i);
    expect(cfo.questionsBeforeRecommend.length).toBeGreaterThan(0);
  });

  it("passes Phase 50 self-review", () => {
    const review = reviewExecutiveIntelligenceModels();
    expect(review.canOperateWithoutIndustryContext).toBe(true);
    expect(review.canOverlaysModifyWithoutRewrite).toBe(true);
    expect(review.cfosStillFeelLikeCfosAcrossIndustries).toBe(true);
    expect(review.describesBehaviourNotResponsibilities).toBe(true);
    expect(review.allPassed).toBe(true);
    expect(review.evidence.length).toBeGreaterThanOrEqual(4);
  });
});
