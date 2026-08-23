/**
 * Browser-safe serializable DTOs crossing the Snapshot Studio server boundary.
 * Plain JSON only — no Buffers, streams, class instances, or functions.
 */

import type {
  UdgConfidenceScore,
  UdgExecutiveSnapshot,
  UdgMappingDefinition,
  UdgSourceKind,
  UdgValidationResult,
} from "@/data-gateway";
import type {
  StudioBriefPreview,
  StudioBusinessProfileId,
  StudioIntelligenceActivation,
  StudioMappingPreview,
  StudioProfileDetection,
  StudioReadiness,
} from "../types";

export type StudioMappedFieldLine = string;

export type StudioInsightSummary = {
  id: string;
  title: string;
  detail: string;
  implication?: string;
  category: string;
  posture: string;
  confidence: number;
  evidence: string[];
};

export type StudioCouncilPositionSummary = {
  framing: string;
  seats: string[];
  perspectives: Array<{
    agentId: string;
    title: string;
    shortTitle: string;
    summary: string;
  }>;
  disagreements: string[];
};

export type StudioSnapshotActionResult = {
  success: boolean;
  profile?: StudioProfileDetection;
  confidence?: UdgConfidenceScore;
  readiness?: StudioReadiness;
  validation?: UdgValidationResult;
  mappedFields?: StudioMappedFieldLine[];
  mappingPreview?: StudioMappingPreview;
  snapshot?: UdgExecutiveSnapshot;
  snapshotMeta?: UdgExecutiveSnapshot["meta"];
  errors: string[];
};

export type StudioIntelligenceActionResult = {
  success: boolean;
  readiness?: StudioReadiness;
  intelligence?: StudioIntelligenceActivation;
  brief?: StudioBriefPreview;
  insights?: StudioInsightSummary[];
  recommendations?: string[];
  council?: StudioCouncilPositionSummary;
  commercialBriefSummary?: string;
  manufacturingBriefSummary?: string;
  executiveValue?: string;
  dataConfidence?: string;
  /** Command Centre handoff — client persists as active Executive Snapshot. */
  handoff?: StudioCommandCentreHandoff;
  errors: string[];
};

export type StudioCommandCentreHandoff = {
  studioId?: string;
  snapshotId: string;
  organisationId: string;
  organisationName?: string;
  profileId: StudioBusinessProfileId;
  profileLabel: string;
  sourceKind: UdgSourceKind;
  filename?: string;
  recordCount: number;
  confidenceOverall: number;
  readiness: StudioReadiness;
  portfolio: import("@/lib/outcomes/types").OutcomePortfolio;
  analysis?: import("../intelligence/commercial-analysis").CommercialAnalysis;
  commercialBrief?: import("../intelligence/commercial-brief").CommercialExecutiveBrief;
  manufacturingAnalysis?: import("../intelligence/manufacturing-analysis").ManufacturingAnalysis;
  manufacturingBrief?: import("../intelligence/manufacturing-brief").ManufacturingExecutiveBrief;
  councilSeats: string[];
  advisorNames: string[];
};

export type CreateStudioSnapshotInput = {
  organisationId: string;
  organisationName?: string;
  profileId: string;
  productId?: string;
  actorId?: string;
  sourceKind: UdgSourceKind;
  filename?: string;
  /** CSV / clean tabular text only — never binary XLS decoded as UTF-8. */
  tabularText?: string;
  /** Base64-encoded .xls / .xlsx workbook bytes. */
  binaryBase64?: string;
  selectedProfileId: StudioBusinessProfileId;
  mapping: UdgMappingDefinition;
};

export type ParseWorkbookInput = {
  filename: string;
  mimeType?: string;
  binaryBase64: string;
};

export type ParseWorkbookResultDto =
  | {
      ok: true;
      format: "xls" | "xlsx";
      sheetName: string;
      headers: string[];
      recordCount: number;
      previewRows: Array<Record<string, string | number | boolean | null>>;
    }
  | {
      ok: false;
      error: string;
    };

export type RunStudioIntelligenceInput = {
  organisationName?: string;
  selectedProfileId: StudioBusinessProfileId;
  snapshot: UdgExecutiveSnapshot;
  readiness: StudioReadiness;
  /** Studio session id for Command Centre restore / library switching. */
  studioId?: string;
  filename?: string;
};
