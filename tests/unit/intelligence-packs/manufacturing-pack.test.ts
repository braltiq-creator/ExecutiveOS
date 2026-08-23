import { describe, expect, it } from "vitest";
import {
  buildCouncilOverlay,
  collectOutcomeEngineSeeds,
  createIntelligencePackRegistry,
  discoverPackScenarios,
  explainOntologyTerm,
  resolvePackOntology,
  toOutcomeEngineSeed,
  validatePackContract,
  validatePackRealityLab,
} from "@/intelligence-packs";
import {
  MANUFACTURING_DECISION_CATALOGUE,
  MANUFACTURING_FORBIDDEN_CORE_TYPES,
  MANUFACTURING_PACK_ID,
  createManufacturingExecutivePack,
  createMockDynamicsManufacturingProvider,
  registerManufacturingPack,
  validateManufacturingPack,
} from "@/intelligence-packs/packs/manufacturing";
import { ORG_INDUSTRIAL_MANUFACTURER } from "@/simulation/organisations";

describe("Manufacturing Executive Intelligence Pack (Phase 52)", () => {
  it("satisfies EIPF contract with manufacturing identity", () => {
    const pack = createManufacturingExecutivePack();
    const validation = validatePackContract(pack);
    expect(validation.ok).toBe(true);
    expect(pack.manifest.id).toBe(MANUFACTURING_PACK_ID);
    expect(pack.industry()).toBe("manufacturing");
    expect(pack.manifest.provides).toContain("reality-lab");
    expect(pack.manifest.provides).toContain("dynamics-ready");
  });

  it("implements Phase 48 completeness checklist", () => {
    const pack = createManufacturingExecutivePack();
    expect(pack.outcomes()).toHaveLength(10);
    expect(pack.ontology().length).toBeGreaterThanOrEqual(20);
    expect(pack.councilKnowledge()).toHaveLength(5);
    expect(pack.businessEvents().length).toBeGreaterThanOrEqual(18);
    expect(pack.realityLab().scenarios.length).toBeGreaterThanOrEqual(12);
    expect(pack.reasoningRules()).toHaveLength(12);
    expect(pack.meetingPacks()).toHaveLength(6);
    expect(pack.benchmarks().length).toBeGreaterThanOrEqual(10);
    expect(pack.decisionFrameworks()).toHaveLength(4);
    expect(pack.validationRules().length).toBeGreaterThanOrEqual(10);
    expect(pack.learningRules()).toHaveLength(8);
    expect(MANUFACTURING_DECISION_CATALOGUE).toHaveLength(12);
  });

  it("exposes uniform Outcome Engine seeds without Core branches", () => {
    const pack = createManufacturingExecutivePack();
    const seed = toOutcomeEngineSeed(pack);
    expect(seed.packId).toBe(MANUFACTURING_PACK_ID);
    expect(seed.industry).toBe("manufacturing");
    expect(seed.outcomes).toHaveLength(10);
    expect(seed.outcomes.map((o) => o.id)).toContain("mfg-outcome-inventory");
  });

  it("keeps ontology opaque and explainable", () => {
    const pack = createManufacturingExecutivePack();
    const ontology = resolvePackOntology(pack);
    expect(explainOntologyTerm(ontology, "Build Slot")).toMatch(/scarce/i);
    expect(explainOntologyTerm(ontology, "Factory")).toBeTruthy();
    for (const forbidden of MANUFACTURING_FORBIDDEN_CORE_TYPES) {
      expect(pack.manifest.provides.join(" ")).not.toContain(
        `core:${forbidden.toLowerCase()}`,
      );
    }
  });

  it("builds Council overlays for all five permanent roles", () => {
    const pack = createManufacturingExecutivePack();
    const overlay = buildCouncilOverlay(pack);
    expect(overlay.byRole.ceo?.monitoringDomains.length).toBeGreaterThan(0);
    expect(overlay.byRole.cfo?.reasoningHints.join(" ")).toMatch(/cash|capital/i);
    expect(overlay.byRole.coo?.decisionFramework).toMatch(/capacity|schedule/i);
    expect(overlay.byRole.cro?.typicalConcerns.join(" ")).toMatch(/dealer/i);
    expect(overlay.byRole.cso?.questionsBeforeRecommend.length).toBeGreaterThan(0);
  });

  it("registers Reality Lab scenarios discoverable via EIPF", () => {
    const pack = createManufacturingExecutivePack();
    const lab = validatePackRealityLab(pack);
    expect(lab.ok).toBe(true);

    const registry = createIntelligencePackRegistry();
    const registered = registerManufacturingPack(registry, { exclusive: true });
    expect(registered.ok).toBe(true);

    const scenarios = discoverPackScenarios(registry);
    expect(scenarios.map((s) => s.id)).toEqual(
      expect.arrayContaining([
        "RL-MFG-01",
        "RL-MFG-02",
        "RL-MFG-03",
        "RL-MFG-12",
      ]),
    );
    expect(scenarios.length).toBe(12);
  });

  it("applies Reality Lab scenarios on industrial manufacturing org", () => {
    const pack = createManufacturingExecutivePack();
    const scenario = pack.realityLab().scenarios.find((s) => s.id === "RL-MFG-01");
    expect(scenario).toBeDefined();
    const base = ORG_INDUSTRIAL_MANUFACTURER.createContext();
    const applied = scenario!.apply(base);
    expect(applied.seedEvents.length).toBeGreaterThan(base.seedEvents.length);
    expect(applied.provider.getSignals().decisions[0]?.question).toMatch(
      /reset the plan/i,
    );
  });

  it("provides mock Dynamics provider interface ready for live connector", () => {
    const provider = createMockDynamicsManufacturingProvider({
      datasetId: "mfg-sim-scarcity",
    });
    expect(provider.system).toBe("microsoft_dynamics");
    expect(provider.mode).toBe("mock");
    const snapshot = provider.getSnapshot();
    expect(snapshot.orderBank.weeksOfCover).toBeGreaterThan(
      snapshot.orderBank.capacityEnvelopeWeeks,
    );
    const events = provider.toBusinessEvents(snapshot);
    expect(events.length).toBeGreaterThan(0);
    expect(provider.health().status).toBe("connected");
  });

  it("passes pack validation including simulation smoke", () => {
    const pack = createManufacturingExecutivePack();
    const result = validateManufacturingPack(pack);
    expect(result.contractOk).toBe(true);
    expect(result.realityLabOk).toBe(true);
    expect(result.completenessOk).toBe(true);
    expect(result.ontologyOpaque).toBe(true);
    expect(result.simulationSmokeOk).toBe(true);
    expect(result.ok).toBe(true);
  });

  it("coexists with other packs in the registry", () => {
    const registry = createIntelligencePackRegistry();
    registerManufacturingPack(registry);
    const seeds = collectOutcomeEngineSeeds(registry, [MANUFACTURING_PACK_ID]);
    expect(seeds).toHaveLength(1);
    expect(seeds[0].outcomes.length).toBe(10);
  });
});
