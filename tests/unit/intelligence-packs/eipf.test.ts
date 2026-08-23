import { describe, expect, it, beforeEach } from "vitest";
import {
  collectCouncilOverlays,
  collectOntology,
  collectOutcomeEngineSeeds,
  councilIndustryPreface,
  createIntelligencePackRegistry,
  createReferenceIntelligencePack,
  defineIntelligencePack,
  discoverPackScenarios,
  explainOntologyTerm,
  intelligencePackFromKnowledgePack,
  reviewIntelligencePackFramework,
  toOutcomeEngineSeed,
  validatePackContract,
  validatePackRealityLab,
} from "@/intelligence-packs";
import { createFieldServicesKnowledgePack } from "@/platform";

describe("Executive Intelligence Pack Framework (EIPF)", () => {
  const registry = createIntelligencePackRegistry();

  beforeEach(() => {
    registry.clear();
  });

  it("defines a reusable pack contract every industry can inherit", () => {
    const pack = createReferenceIntelligencePack();
    const validation = validatePackContract(pack);

    expect(validation.ok).toBe(true);
    expect(pack.manifest.id).toBe("pack-eipf-reference");
    expect(pack.industry()).toBe("reference");
    expect(pack.outcomes().length).toBeGreaterThan(0);
    expect(pack.ontology().length).toBeGreaterThan(0);
    expect(pack.kpis().length).toBeGreaterThan(0);
    expect(pack.councilKnowledge()).toHaveLength(5);
    expect(pack.decisionFrameworks().length).toBeGreaterThan(0);
    expect(pack.reasoningRules().length).toBeGreaterThan(0);
    expect(pack.benchmarks().length).toBeGreaterThan(0);
    expect(pack.businessEvents().length).toBeGreaterThan(0);
    expect(pack.realityLab().scenarios.length).toBeGreaterThan(0);
    expect(pack.meetingPacks().length).toBeGreaterThan(0);
    expect(pack.reports().length).toBeGreaterThan(0);
    expect(pack.recommendations().length).toBeGreaterThan(0);
    expect(pack.validationRules().length).toBeGreaterThan(0);
    expect(pack.learningRules().length).toBeGreaterThan(0);
  });

  it("registers and switches packs without Core changes", () => {
    const reference = createReferenceIntelligencePack();
    const alternate = defineIntelligencePack({
      id: "pack-eipf-alternate",
      name: "EIPF Alternate Reference",
      industry: "reference_alt",
      description: "Second pack proving multi-pack support.",
      outcomes: [
        {
          id: "alt-outcome",
          name: "Alternate clarity",
          description: "Second pack outcome",
          ownerRole: "ceo",
          successMeasures: ["Contract intact"],
          supportingKpiIds: [],
          strategicImportance: "high",
        },
      ],
      councilKnowledge: reference.councilKnowledge().map((item) => ({
        ...item,
        reasoningHints: [`Alternate: ${item.reasoningHints[0] ?? "adapt"}`],
      })),
      ontology: [
        {
          id: "alt-term",
          term: "Alternate Signal",
          definition: "Second-pack vocabulary",
          executiveMeaning: "Opaque to Core",
        },
      ],
      realityLab: {
        scenarios: reference.realityLab().scenarios,
        successMeasures: ["Switch packs without Core edits"],
        failureConditions: ["Core industry branching required"],
        executiveQuestions: ["Can packs switch cleanly?"],
        expectedOutcomes: [],
        validationDatasets: [],
      },
    });

    expect(registry.register(reference).ok).toBe(true);
    expect(registry.register(alternate).ok).toBe(true);

    const switched = registry.setActive(["pack-eipf-alternate"]);
    expect(switched.ok).toBe(true);
    expect(registry.activePackIds()).toEqual(["pack-eipf-alternate"]);

    const multi = registry.setActive([
      "pack-eipf-reference",
      "pack-eipf-alternate",
    ]);
    expect(multi.ok).toBe(true);
    expect(registry.activePackIds()).toHaveLength(2);
  });

  it("feeds the Outcome Engine through one uniform contract", () => {
    const a = createReferenceIntelligencePack();
    const b = defineIntelligencePack({
      id: "pack-eipf-ops",
      name: "Ops reference",
      industry: "reference_ops",
      description: "Uniform outcome seed proof",
      outcomes: [
        {
          id: "ops-util",
          name: "Technician utilisation",
          description: "Example operations outcome shape",
          ownerRole: "coo",
          successMeasures: ["Utilisation within band"],
          supportingKpiIds: [],
          strategicImportance: "critical",
        },
      ],
      councilKnowledge: a.councilKnowledge(),
    });

    registry.register(a);
    registry.register(b);
    registry.setActive(["pack-eipf-reference", "pack-eipf-ops"]);

    const seeds = collectOutcomeEngineSeeds(registry);
    expect(seeds).toHaveLength(2);
    for (const seed of seeds) {
      expect(seed.packId).toBeTruthy();
      expect(seed.industry).toBeTruthy();
      expect(seed.outcomes[0]).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        description: expect.any(String),
        owner: expect.any(String),
        successMeasures: expect.any(Array),
        supportingKpis: expect.any(Array),
        strategicImportance: expect.any(String),
      });
    }

    const single = toOutcomeEngineSeed(a);
    expect(single.outcomes.map((item) => item.name)).toContain(
      "Decision clarity",
    );
  });

  it("keeps industry ontology opaque to Core", () => {
    const pack = createReferenceIntelligencePack();
    registry.register(pack);
    registry.activate(pack.manifest.id);

    const [ontology] = collectOntology(registry);
    expect(ontology.terms.length).toBeGreaterThan(0);
    expect(explainOntologyTerm(ontology!, "Signal")).toMatch(/Council/i);
    expect(explainOntologyTerm(ontology!, "unknown-term")).toBeNull();
    // Core never receives a class — only strings / plain objects
    expect(typeof ontology!.terms[0]!.term).toBe("string");
  });

  it("adapts Executive Council knowledge per pack while keeping roles", () => {
    const pack = createReferenceIntelligencePack();
    registry.register(pack);

    const [overlay] = collectCouncilOverlays(registry);
    expect(overlay!.byRole.ceo).toBeTruthy();
    expect(overlay!.byRole.cfo).toBeTruthy();
    expect(overlay!.byRole.coo).toBeTruthy();
    expect(overlay!.byRole.cro).toBeTruthy();
    expect(overlay!.byRole.cso).toBeTruthy();

    const ceoPreface = councilIndustryPreface(pack, "ceo");
    const cfoPreface = councilIndustryPreface(pack, "cfo");
    expect(ceoPreface).toMatch(/CEO/);
    expect(cfoPreface).toMatch(/CFO/);
    expect(ceoPreface).not.toEqual(cfoPreface);
  });

  it("lets Reality Lab validate pack industries before deployment", () => {
    const pack = createReferenceIntelligencePack();
    registry.register(pack);
    registry.activate(pack.manifest.id);

    const lab = validatePackRealityLab(pack);
    expect(lab.ok).toBe(true);
    expect(discoverPackScenarios(registry).length).toBeGreaterThanOrEqual(2);
    expect(pack.realityLab().successMeasures.length).toBeGreaterThan(0);
    expect(pack.realityLab().failureConditions.length).toBeGreaterThan(0);
    expect(pack.realityLab().executiveQuestions.length).toBeGreaterThanOrEqual(
      4,
    );
  });

  it("bridges existing Field Services Knowledge Pack into EIPF without Core edits", () => {
    const bridged = intelligencePackFromKnowledgePack(
      createFieldServicesKnowledgePack(),
    );
    const result = registry.register(bridged);
    expect(result.ok).toBe(true);
    expect(bridged.manifest.id).toBe("eipf-pack-field-services-simpro");
    expect(bridged.outcomes().length).toBeGreaterThan(0);
    expect(bridged.ontology().length).toBeGreaterThan(0);
    expect(bridged.councilKnowledge()).toHaveLength(5);
    expect(bridged.realityLab().scenarios.length).toBe(20);
    expect(validatePackRealityLab(bridged).ok).toBe(true);
  });

  it("passes Phase 47 self-review", () => {
    const reference = createReferenceIntelligencePack();
    const bridged = intelligencePackFromKnowledgePack(
      createFieldServicesKnowledgePack(),
    );
    registry.register(reference);
    registry.register(bridged);

    const review = reviewIntelligencePackFramework(registry);
    expect(review.canAddIndustryWithoutCoreChanges).toBe(true);
    expect(review.canSupportMultiplePacks).toBe(true);
    expect(review.canCouncilAdaptToIndustry).toBe(true);
    expect(review.canRealityLabValidateIndustries).toBe(true);
    expect(review.allPassed).toBe(true);
    expect(review.evidence.length).toBeGreaterThanOrEqual(4);
  });
});
