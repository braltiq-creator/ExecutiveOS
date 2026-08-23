/**
 * Executive Knowledge Pack contract.
 * Packs teach the platform how an industry thinks — they never modify Core.
 */

import type { ExtensionManifest } from "@/platform/contracts/identity";
import type { BusinessEventMapper } from "@/platform/contracts/business-event";
import type { ExecutiveScenario } from "@/simulation/types";
import type { BenchmarkProfile } from "@/industry/field-services/simpro/benchmarks";
import type { FieldServiceKpiDefinition } from "@/industry/field-services/simpro/kpis";
import type { JudgementRule } from "@/industry/field-services/simpro/rules";

export type IndustryVocabularyEntry = {
  term: string;
  executiveMeaning: string;
  aliases?: string[];
};

export type NarrativeTemplate = {
  id: string;
  situation: string;
  template: string;
  /** Placeholders e.g. {{kpi}} {{trend}} */
  placeholders: string[];
};

export type HealthModelDefinition = {
  id: string;
  label: string;
  dimensions: string[];
  description: string;
};

export type KnowledgePackKpiDefinition = {
  id: string;
  label: string;
  unit: string;
  polarity: "higher_better" | "lower_better";
  executiveMeaning: string;
  healthLinks: string[];
};

/** Generic judgement rule surface for packs (Core EJE stays untouched). */
export type PackJudgementRule = {
  id: string;
  title: string;
  description: string;
  /** Opaque evaluator key — pack owns implementation */
  evaluateKey: string;
};

export type ExecutiveKnowledgePack = {
  readonly manifest: ExtensionManifest & { kind: "knowledge_pack" };

  /** Identity helpers */
  identity(): ExtensionManifest;

  supportedDomains(): string[];
  vocabulary(): IndustryVocabularyEntry[];
  executiveKpis(): KnowledgePackKpiDefinition[];
  healthModels(): HealthModelDefinition[];
  judgementRules(): PackJudgementRule[];
  benchmarks(): BenchmarkProfile[];
  realityLabScenarios(): ExecutiveScenario[];
  narrativeTemplates(): NarrativeTemplate[];
  /** Connector ids this pack is designed to work with (not exclusive) */
  supportedConnectors(): string[];

  /** Optional mapper for pack-specific domain events → BusinessEvents */
  businessEventMapper?(): BusinessEventMapper | null;
};

/**
 * Adapter helpers — field-services KPIs satisfy the generic contract shape.
 */
export function toPackKpis(
  kpis: FieldServiceKpiDefinition[],
): KnowledgePackKpiDefinition[] {
  return kpis.map((kpi) => ({
    id: kpi.id,
    label: kpi.label,
    unit: kpi.unit,
    polarity: kpi.polarity,
    executiveMeaning: kpi.executiveMeaning,
    healthLinks: [...kpi.healthLinks],
  }));
}

export function toPackRules(rules: JudgementRule[]): PackJudgementRule[] {
  return rules.map((rule) => ({
    id: rule.id,
    title: rule.title,
    description: rule.title,
    evaluateKey: rule.id,
  }));
}
