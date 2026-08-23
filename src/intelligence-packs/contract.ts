/**
 * Executive Intelligence Pack Framework (EIPF) — Pack Contract
 *
 * Every Intelligence Pack exposes the same interfaces.
 * ExecutiveOS treats every pack identically.
 * Switching packs never requires Core changes.
 *
 * Industry capability lives entirely in packs.
 * Core never references industry objects directly.
 */

import type { CouncilRoleId } from "@/experience/executive-council/members";
import type { ExecutiveScenario } from "@/simulation/types";

export type PackSemVer = {
  major: number;
  minor: number;
  patch: number;
};

export type PackManifest = {
  id: string;
  name: string;
  version: PackSemVer;
  versionLabel: string;
  /** Industry / domain label — opaque to Core */
  industry: string;
  description: string;
  /** Capability tags for discovery */
  provides: string[];
  author?: string;
};

/** Pack-defined executive outcome model — consumed via Outcome Engine contract. */
export type PackOutcomeModel = {
  id: string;
  name: string;
  description: string;
  ownerRole: CouncilRoleId | string;
  successMeasures: string[];
  supportingKpiIds: string[];
  strategicImportance: "critical" | "high" | "moderate" | "supporting";
  /** Opaque industry tags — Core must not interpret these */
  ontologyTerms?: string[];
};

/** Industry ontology entry — pack vocabulary; Core never imports these types as domain objects. */
export type PackOntologyTerm = {
  id: string;
  term: string;
  definition: string;
  executiveMeaning: string;
  aliases?: string[];
  relatedOutcomeIds?: string[];
};

export type PackKpiDefinition = {
  id: string;
  label: string;
  unit: string;
  polarity: "higher_better" | "lower_better";
  executiveMeaning: string;
  linkedOutcomeIds: string[];
};

/** Role-consistent, industry-aware Council knowledge. */
export type PackCouncilKnowledge = {
  roleId: CouncilRoleId;
  /** Industry-specific monitoring domains for this role */
  monitoringDomains: string[];
  typicalConcerns: string[];
  questionsBeforeRecommend: string[];
  decisionFramework: string;
  reasoningHints: string[];
  /** Ontology terms this role should preferentially reason about */
  focusOntologyTermIds?: string[];
};

export type PackDecisionFramework = {
  id: string;
  name: string;
  description: string;
  applicableOutcomeIds: string[];
  steps: string[];
  escalationTriggers: string[];
};

export type PackReasoningRule = {
  id: string;
  title: string;
  description: string;
  /** Opaque evaluator key — pack owns evaluation */
  evaluateKey: string;
  relatedOutcomeIds?: string[];
  relatedOntologyTermIds?: string[];
};

export type PackBenchmark = {
  id: string;
  label: string;
  metricId: string;
  peerMedian: number;
  peerTopQuartile: number;
  unit: string;
  notes?: string;
};

export type PackBusinessEvent = {
  id: string;
  label: string;
  description: string;
  severity: "critical" | "high" | "moderate";
  /** Opaque event class — not a Core entity type */
  eventClass: string;
  relatedOutcomeIds: string[];
  relatedOntologyTermIds?: string[];
  executiveQuestion: string;
};

export type PackMeetingPackTemplate = {
  id: string;
  name: string;
  cadence: "daily" | "weekly" | "monthly" | "quarterly" | "annual" | "event";
  purpose: string;
  discussionSequence: string[];
  requiredOutcomeIds: string[];
  prepMinutes: number;
};

export type PackReportTemplate = {
  id: string;
  name: string;
  audience: string;
  sections: string[];
  linkedOutcomeIds: string[];
};

export type PackRecommendationTemplate = {
  id: string;
  situation: string;
  title: string;
  rationale: string;
  linkedOutcomeIds: string[];
  placeholders: string[];
};

export type PackValidationRule = {
  id: string;
  description: string;
  /** Opaque rule key */
  evaluateKey: string;
  severity: "blocker" | "warning" | "info";
};

export type PackLearningRule = {
  id: string;
  description: string;
  trigger: string;
  retentionHint: string;
};

/** Reality Lab surfaces owned by the pack. */
export type PackRealityLabDefinition = {
  scenarios: ExecutiveScenario[];
  validationDatasets: Array<{
    id: string;
    label: string;
    description: string;
    scenarioIds: string[];
  }>;
  successMeasures: string[];
  failureConditions: string[];
  executiveQuestions: string[];
  expectedOutcomes: Array<{
    scenarioId: string;
    expectation: string;
  }>;
};

/**
 * Canonical Intelligence Pack contract.
 * Every future pack (Manufacturing, Mining, Utilities, …) implements this.
 */
export type ExecutiveIntelligencePack = {
  readonly manifest: PackManifest;

  industry(): string;
  outcomes(): PackOutcomeModel[];
  ontology(): PackOntologyTerm[];
  kpis(): PackKpiDefinition[];
  councilKnowledge(): PackCouncilKnowledge[];
  decisionFrameworks(): PackDecisionFramework[];
  reasoningRules(): PackReasoningRule[];
  benchmarks(): PackBenchmark[];
  businessEvents(): PackBusinessEvent[];
  realityLab(): PackRealityLabDefinition;
  meetingPacks(): PackMeetingPackTemplate[];
  reports(): PackReportTemplate[];
  recommendations(): PackRecommendationTemplate[];
  validationRules(): PackValidationRule[];
  learningRules(): PackLearningRule[];

  /** Advisory connector affinities — never exclusive */
  supportedConnectors(): string[];
};

/** Uniform Outcome Engine seed shape — identical for every pack. */
export type PackOutcomeEngineSeed = {
  packId: string;
  industry: string;
  outcomes: Array<{
    id: string;
    name: string;
    description: string;
    owner: string;
    successMeasures: string[];
    supportingKpis: string[];
    strategicImportance: PackOutcomeModel["strategicImportance"];
  }>;
};

/** Uniform Council overlay — role-consistent, industry-aware. */
export type PackCouncilOverlay = {
  packId: string;
  industry: string;
  byRole: Record<
    CouncilRoleId,
    PackCouncilKnowledge | null
  >;
};
