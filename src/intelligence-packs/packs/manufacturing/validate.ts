/**
 * Manufacturing pack validation — contract, Reality Lab, completeness, simulation smoke.
 */

import type { ExecutiveIntelligencePack } from "@/intelligence-packs/contract";
import { validatePackContract } from "@/intelligence-packs/define";
import { validatePackRealityLab } from "@/intelligence-packs/consumers/reality-lab";
import { MANUFACTURING_FORBIDDEN_CORE_TYPES } from "@/intelligence-packs/packs/manufacturing/catalog/ontology";
import { MANUFACTURING_PACK_ID } from "@/intelligence-packs/packs/manufacturing/constants";
import { ORG_INDUSTRIAL_MANUFACTURER } from "@/simulation/organisations";
import { buildExperienceSurface } from "@/simulation/enterprise/experience-bridge";
import { validateOperatingLoop } from "@/simulation/enterprise/operating-loop";
import { validateCouncil } from "@/simulation/enterprise/council-validation";

export type ManufacturingPackValidation = {
  ok: boolean;
  packId: string;
  contractOk: boolean;
  realityLabOk: boolean;
  completenessOk: boolean;
  ontologyOpaque: boolean;
  simulationSmokeOk: boolean;
  errors: string[];
  warnings: string[];
  checklist: Record<string, boolean>;
};

export function validateManufacturingPackCompleteness(
  pack: ExecutiveIntelligencePack,
): { ok: boolean; checklist: Record<string, boolean>; errors: string[] } {
  const errors: string[] = [];
  const checklist = {
    tenOutcomes: pack.outcomes().length >= 10,
    ontologyPresent: pack.ontology().length >= 20,
    fiveCouncilRoles: ["ceo", "cfo", "coo", "cro", "cso"].every((role) =>
      pack.councilKnowledge().some((k) => k.roleId === role),
    ),
    twelvePlusEvents: pack.businessEvents().length >= 12,
    tenPlusScenarios: pack.realityLab().scenarios.length >= 10,
    twelveReasoningRules: pack.reasoningRules().length >= 12,
    validationRules: pack.validationRules().length >= 8,
    learningRules: pack.learningRules().length >= 6,
    meetingPacksAF: pack.meetingPacks().length >= 6,
    benchmarks: pack.benchmarks().length >= 10,
    recommendations: pack.recommendations().length >= 8,
    dynamicsAffinity: pack
      .supportedConnectors()
      .some((c) => c.includes("dynamics")),
  };

  for (const [key, passed] of Object.entries(checklist)) {
    if (!passed) errors.push(`Completeness failed: ${key}`);
  }

  return {
    ok: errors.length === 0,
    checklist,
    errors,
  };
}

export function assertOntologyOpaque(
  pack: ExecutiveIntelligencePack,
): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  const provides = pack.manifest.provides.join(" ").toLowerCase();
  for (const forbidden of MANUFACTURING_FORBIDDEN_CORE_TYPES) {
    if (provides.includes(`core:${forbidden.toLowerCase()}`)) {
      errors.push(`Pack requires Core type ${forbidden}`);
    }
  }
  if (pack.manifest.industry !== "manufacturing") {
    errors.push("Pack industry must be manufacturing");
  }
  if (pack.manifest.id !== MANUFACTURING_PACK_ID) {
    errors.push(`Unexpected pack id ${pack.manifest.id}`);
  }
  return { ok: errors.length === 0, errors };
}

/**
 * Smoke: apply a critical manufacturing scenario on Forgeworks context,
 * then exercise Enterprise Simulation operating loop + Council validators.
 */
export function smokeManufacturingSimulation(
  pack: ExecutiveIntelligencePack,
): { ok: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  try {
    const critical =
      pack.realityLab().scenarios.find((s) => s.severity === "critical") ??
      pack.realityLab().scenarios[0];
    if (!critical) {
      errors.push("No Reality Lab scenarios to smoke-test");
      return { ok: false, errors, warnings };
    }

    const base = ORG_INDUSTRIAL_MANUFACTURER.createContext();
    const applied = critical.apply(base);
    const signals = applied.provider.getSignals();
    if (signals.decisions.length === 0) {
      errors.push("Scenario apply produced no decisions");
    }
    if (applied.seedEvents.length <= base.seedEvents.length) {
      errors.push("Scenario apply did not append seed events");
    }

    // Enterprise Simulation path (experience surface + loop/council validators)
    const surface = buildExperienceSurface({
      organisation: ORG_INDUSTRIAL_MANUFACTURER,
      scenario: critical,
    });
    const loop = validateOperatingLoop(surface);
    if (!loop.pass) {
      const failed = loop.stages
        .filter((stage) => !stage.pass)
        .map((stage) => stage.stage);
      warnings.push(
        `Operating loop incomplete under ${critical.id}: ${failed.join(", ") || "stages failed"}`,
      );
    }

    const council = validateCouncil(surface, "crisis");
    if (!council.pass) {
      warnings.push(`Council validation soft-fail under ${critical.id}`);
    }
  } catch (err) {
    errors.push(
      `Simulation smoke failed: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
  return { ok: errors.length === 0, errors, warnings };
}

export function validateManufacturingPack(
  pack: ExecutiveIntelligencePack,
): ManufacturingPackValidation {
  const contract = validatePackContract(pack);
  const realityLab = validatePackRealityLab(pack);
  const completeness = validateManufacturingPackCompleteness(pack);
  const opaque = assertOntologyOpaque(pack);
  const sim = smokeManufacturingSimulation(pack);

  const errors = [
    ...contract.errors,
    ...realityLab.errors,
    ...completeness.errors,
    ...opaque.errors,
    ...sim.errors,
  ];
  const warnings = [
    ...contract.warnings,
    ...realityLab.warnings,
    ...sim.warnings,
  ];

  return {
    ok: errors.length === 0,
    packId: pack.manifest.id,
    contractOk: contract.ok,
    realityLabOk: realityLab.ok,
    completenessOk: completeness.ok,
    ontologyOpaque: opaque.ok,
    simulationSmokeOk: sim.ok,
    errors,
    warnings,
    checklist: completeness.checklist,
  };
}
