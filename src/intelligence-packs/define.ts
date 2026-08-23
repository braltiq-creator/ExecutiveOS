/**
 * Helper to define an Executive Intelligence Pack with safe defaults.
 * Pack authors fill industry-specific surfaces; Core stays untouched.
 */

import type {
  ExecutiveIntelligencePack,
  PackBenchmark,
  PackBusinessEvent,
  PackCouncilKnowledge,
  PackDecisionFramework,
  PackKpiDefinition,
  PackLearningRule,
  PackManifest,
  PackMeetingPackTemplate,
  PackOntologyTerm,
  PackOutcomeModel,
  PackReasoningRule,
  PackRealityLabDefinition,
  PackRecommendationTemplate,
  PackReportTemplate,
  PackSemVer,
  PackValidationRule,
} from "@/intelligence-packs/contract";

export type DefineIntelligencePackInput = {
  id: string;
  name: string;
  industry: string;
  description: string;
  version?: PackSemVer;
  provides?: string[];
  author?: string;
  outcomes?: PackOutcomeModel[];
  ontology?: PackOntologyTerm[];
  kpis?: PackKpiDefinition[];
  councilKnowledge?: PackCouncilKnowledge[];
  decisionFrameworks?: PackDecisionFramework[];
  reasoningRules?: PackReasoningRule[];
  benchmarks?: PackBenchmark[];
  businessEvents?: PackBusinessEvent[];
  realityLab?: Partial<PackRealityLabDefinition>;
  meetingPacks?: PackMeetingPackTemplate[];
  reports?: PackReportTemplate[];
  recommendations?: PackRecommendationTemplate[];
  validationRules?: PackValidationRule[];
  learningRules?: PackLearningRule[];
  supportedConnectors?: string[];
};

function versionLabel(version: PackSemVer): string {
  return `${version.major}.${version.minor}.${version.patch}`;
}

const EMPTY_REALITY_LAB: PackRealityLabDefinition = {
  scenarios: [],
  validationDatasets: [],
  successMeasures: [],
  failureConditions: [],
  executiveQuestions: [],
  expectedOutcomes: [],
};

/**
 * Create a contract-compliant Intelligence Pack.
 * Missing surfaces default to empty arrays — packs remain switchable.
 */
export function defineIntelligencePack(
  input: DefineIntelligencePackInput,
): ExecutiveIntelligencePack {
  const version = input.version ?? { major: 1, minor: 0, patch: 0 };
  const manifest: PackManifest = {
    id: input.id,
    name: input.name,
    version,
    versionLabel: versionLabel(version),
    industry: input.industry,
    description: input.description,
    provides: input.provides ?? [
      "outcomes",
      "ontology",
      "kpis",
      "council",
      "reality-lab",
    ],
    author: input.author ?? "ExecutiveOS",
  };

  const realityLab: PackRealityLabDefinition = {
    ...EMPTY_REALITY_LAB,
    ...input.realityLab,
    scenarios: input.realityLab?.scenarios ?? [],
    validationDatasets: input.realityLab?.validationDatasets ?? [],
    successMeasures: input.realityLab?.successMeasures ?? [],
    failureConditions: input.realityLab?.failureConditions ?? [],
    executiveQuestions: input.realityLab?.executiveQuestions ?? [],
    expectedOutcomes: input.realityLab?.expectedOutcomes ?? [],
  };

  return {
    manifest,
    industry: () => manifest.industry,
    outcomes: () => input.outcomes ?? [],
    ontology: () => input.ontology ?? [],
    kpis: () => input.kpis ?? [],
    councilKnowledge: () => input.councilKnowledge ?? [],
    decisionFrameworks: () => input.decisionFrameworks ?? [],
    reasoningRules: () => input.reasoningRules ?? [],
    benchmarks: () => input.benchmarks ?? [],
    businessEvents: () => input.businessEvents ?? [],
    realityLab: () => realityLab,
    meetingPacks: () => input.meetingPacks ?? [],
    reports: () => input.reports ?? [],
    recommendations: () => input.recommendations ?? [],
    validationRules: () => input.validationRules ?? [],
    learningRules: () => input.learningRules ?? [],
    supportedConnectors: () => input.supportedConnectors ?? [],
  };
}

/**
 * Validate that a pack exposes the full contract surface.
 * Does not execute industry logic — structural only.
 */
export function validatePackContract(pack: ExecutiveIntelligencePack): {
  ok: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!pack.manifest.id) errors.push("manifest.id required");
  if (!pack.manifest.industry) errors.push("manifest.industry required");
  if (!pack.manifest.name) errors.push("manifest.name required");

  if (pack.outcomes().length === 0) {
    warnings.push("No executive outcomes defined");
  }
  if (pack.ontology().length === 0) {
    warnings.push("No ontology terms defined");
  }
  if (pack.councilKnowledge().length === 0) {
    warnings.push("No council knowledge defined");
  }
  if (pack.realityLab().scenarios.length === 0) {
    warnings.push("No Reality Lab scenarios defined");
  }

  const roles = new Set(pack.councilKnowledge().map((item) => item.roleId));
  for (const role of ["ceo", "cfo", "coo", "cro", "cso"] as const) {
    if (!roles.has(role)) {
      warnings.push(`Council knowledge missing for ${role.toUpperCase()}`);
    }
  }

  const outcomeIds = new Set(pack.outcomes().map((item) => item.id));
  for (const kpi of pack.kpis()) {
    for (const outcomeId of kpi.linkedOutcomeIds) {
      if (!outcomeIds.has(outcomeId)) {
        warnings.push(
          `KPI ${kpi.id} links unknown outcome ${outcomeId}`,
        );
      }
    }
  }

  return { ok: errors.length === 0, errors, warnings };
}
