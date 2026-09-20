/**
 * Executive Snapshot Studio — Phase 56
 * Orchestration only. No new reasoning engines.
 */

import type {
  UdgConfidenceScore,
  UdgExecutiveSnapshot,
  UdgMappingDefinition,
  UdgSourceKind,
  UdgValidationResult,
} from "@/data-gateway";
import type {
  EvidenceCompareResult,
  SchemaChangeReport,
} from "@/verified-evidence/data-sources/types";

export type StudioBusinessProfileId =
  | "manufacturing"
  | "commercial"
  | "mining"
  | "utilities"
  | "field_services"
  | "technology";

export type StudioWizardStepId =
  | "welcome"
  | "upload"
  | "profile"
  | "validation"
  | "mapping"
  | "snapshot"
  | "intelligence"
  | "brief";

export const STUDIO_WIZARD_STEPS: StudioWizardStepId[] = [
  "welcome",
  "upload",
  "profile",
  "mapping",
  "validation",
  "snapshot",
  "intelligence",
  "brief",
];

export type StudioProfileDetection = {
  profileId: StudioBusinessProfileId;
  label: string;
  confidence: number;
  rationale: string[];
  /** Pack / industry label for Domain Advisor activation. */
  industryLabel: string;
  overrideAllowed: true;
};

export type StudioReadinessRecommendation = {
  id: string;
  title: string;
  detail: string;
  priority: "now" | "soon" | "later";
};

export type StudioReadiness = {
  dataQuality: number;
  coverage: number;
  freshness: number;
  confidence: number;
  relationshipIntegrity: number;
  /** Field-level evidence coverage for judgement-critical fields (0–100). */
  evidenceCoverage: number;
  /** Dataset usable for commercial interpretation (not decision confidence). */
  commercialDatasetReadiness: number;
  /** Overall Executive Readiness Score 0–100 — not equated to data quality alone. */
  executiveReadiness: number;
  /** Judgement-specific readiness constraints. */
  judgementReadiness: {
    forecastOpportunityEvidence: "sufficient" | "constrained" | "insufficient";
    activityBasedJudgement: "sufficient" | "constrained" | "insufficient";
    concentrationJudgement: "sufficient" | "constrained" | "insufficient";
    narrative: string[];
  };
  recommendations: StudioReadinessRecommendation[];
  scoredAt: string;
};

export type StudioMappingPreview = {
  entities: string[];
  relationships: string[];
  measures: string[];
  hierarchy: string[];
  mapping: UdgMappingDefinition;
  confirmed: boolean;
};

export type StudioIntelligenceActivation = {
  activatedAt: string;
  profileId: StudioBusinessProfileId;
  industryLabel: string;
  councilStatus: string;
  advisorNames: string[];
  outcomeEngine: "ready";
  judgementFramework: "ready";
  briefGenerated: true;
  commandCentreHref: "/today";
  /** Executive sentence — judgement first. */
  narrative: string;
};

export type StudioBriefPreview = {
  title: string;
  summary: string;
  readiness: number;
  confidence: number;
  judgementCount: number;
  profileLabel: string;
  whatChanged: string[];
  whatRequiresJudgement: string[];
  commandCentreHref: "/today";
};

export type StudioLibraryEntry = {
  studioId: string;
  snapshotId: string;
  organisationId: string;
  profileId: StudioBusinessProfileId;
  profileLabel: string;
  createdAt: string;
  confidence: number;
  executiveReadiness: number;
  briefGenerated: boolean;
  commandCentreReady: boolean;
  sourceKind: UdgSourceKind;
  recordCount: number;
};

export type StudioSession = {
  studioId: string;
  organisationId: string;
  profileId: string;
  productId: string;
  actorId?: string;
  step: StudioWizardStepId;
  filename?: string;
  tabularText?: string;
  /** Base64 workbook bytes for .xls / .xlsx — never UTF-8-decoded text. */
  binaryBase64?: string;
  /** Column headers from the current upload (for weekly schema/mapping). */
  uploadHeaders?: string[];
  sourceKind: UdgSourceKind;
  detection?: StudioProfileDetection;
  selectedProfileId?: StudioBusinessProfileId;
  mapping?: UdgMappingDefinition;
  mappingConfirmed: boolean;
  /** Phase 37B — durable weekly Data Source linkage */
  dataSourceId?: string;
  logicalSourceName?: string;
  mappingReused?: boolean;
  schemaReport?: SchemaChangeReport;
  requiresSchemaConfirmation?: boolean;
  schemaChangeConfirmed?: boolean;
  freshnessCopy?: string;
  weeklyCompare?: EvidenceCompareResult;
  weeklyLineageAttached?: boolean;
  validation?: UdgValidationResult;
  udgConfidence?: UdgConfidenceScore;
  udgSnapshot?: UdgExecutiveSnapshot;
  readiness?: StudioReadiness;
  mappingPreview?: StudioMappingPreview;
  intelligence?: StudioIntelligenceActivation;
  brief?: StudioBriefPreview;
  createdAt: string;
  updatedAt: string;
};
