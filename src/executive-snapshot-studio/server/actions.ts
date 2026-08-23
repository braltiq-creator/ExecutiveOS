/**
 * Executive Snapshot Studio — Server Actions
 *
 * Client → Server Boundary for acquisition / validation / intelligence.
 * Browser never imports node:fs or fixture paths.
 */

"use server";

import { describeMapping } from "@/data-gateway";
import {
  base64ToUint8Array,
  detectTabularFileType,
  EXECUTIVE_WORKBOOK_PARSE_ERROR,
  isSnapshotValidForIntelligence,
  parseExcelWorkbook,
} from "@/data-gateway";
import {
  activateStudioIntelligence,
  buildStudioBriefPreview,
} from "../brief";
import { interpretCommercialSnapshot } from "../intelligence/run-commercial-validation";
import { interpretManufacturingSnapshot } from "../intelligence/run-manufacturing-validation";
import {
  detectBusinessProfile,
  getStudioIndustryLabel,
  getStudioProfileLabel,
} from "../profile-detection";
import { buildMappingPreview } from "../mapping";
import { createStudioSnapshot } from "../snapshot";
import type {
  CreateStudioSnapshotInput,
  ParseWorkbookInput,
  ParseWorkbookResultDto,
  RunStudioIntelligenceInput,
  StudioCommandCentreHandoff,
  StudioCouncilPositionSummary,
  StudioInsightSummary,
  StudioIntelligenceActionResult,
  StudioSnapshotActionResult,
} from "./dto";
import { requireStudioActor, requireStudioSession } from "./auth";

function userSafeError(error: unknown): string {
  if (error instanceof Error && error.message) {
    // Never leak filesystem paths or Node internals to the browser.
    if (/[/\\].+\.(csv|xls|xlsx|ts|js)/i.test(error.message)) {
      return "Snapshot processing failed. Please retry the upload.";
    }
    if (/node:|ENOENT|EACCES|filesystem|fixture/i.test(error.message)) {
      return "Snapshot processing failed on the server. Please retry.";
    }
    return error.message.slice(0, 240);
  }
  return "Snapshot processing failed. Please retry.";
}

function toPlainJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function cellPreview(
  value: unknown,
): string | number | boolean | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }
  return String(value);
}

/**
 * Structural parse of .xls / .xlsx on the server.
 * Never UTF-8-decodes workbook bytes as text.
 */
export async function parseUploadedWorkbookAction(
  input: ParseWorkbookInput,
): Promise<ParseWorkbookResultDto> {
  const actor = await requireStudioSession();
  if (!actor.ok) {
    return {
      ok: false,
      error: actor.error,
    };
  }

  try {
    if (!input.binaryBase64?.trim()) {
      return {
        ok: false,
        error: "ExecutiveOS could not identify this file format.",
      };
    }

    const bytes = base64ToUint8Array(input.binaryBase64);
    const detection = detectTabularFileType({
      filename: input.filename,
      bytes,
    });

    if (detection.format !== "xls" && detection.format !== "xlsx") {
      return {
        ok: false,
        error: "ExecutiveOS could not identify this file format.",
      };
    }

    const parsed = parseExcelWorkbook({
      bytes,
      filename: input.filename,
    });

    if (!parsed.ok) {
      return {
        ok: false,
        error: parsed.errors[0] ?? EXECUTIVE_WORKBOOK_PARSE_ERROR,
      };
    }

    const previewRows = parsed.records.slice(0, 8).map((record) => {
      const row: Record<string, string | number | boolean | null> = {};
      for (const header of parsed.headers) {
        row[header] = cellPreview(record.fields[header]);
      }
      return row;
    });

    return toPlainJson({
      ok: true as const,
      format: parsed.format as "xls" | "xlsx",
      sheetName: parsed.sheetName,
      headers: parsed.headers,
      recordCount: parsed.records.length,
      previewRows,
    });
  } catch {
    return {
      ok: false,
      error: EXECUTIVE_WORKBOOK_PARSE_ERROR,
    };
  }
}

/**
 * Parse → validate → map → create Executive Snapshot (server-side).
 */
export async function createExecutiveSnapshotAction(
  input: CreateStudioSnapshotInput,
): Promise<StudioSnapshotActionResult> {
  const actor = await requireStudioActor(input.organisationId);
  if (!actor.ok) {
    return {
      success: false,
      errors: [actor.error],
    };
  }

  try {
    const hasText = Boolean(input.tabularText?.trim());
    const hasBinary = Boolean(input.binaryBase64?.trim());

    if (!hasText && !hasBinary) {
      return {
        success: false,
        errors: ["No file content received. Upload a CSV or Excel export."],
      };
    }

    if (hasBinary && input.sourceKind !== "excel") {
      // Binary workbook bytes must use the Excel connector path.
      input = { ...input, sourceKind: "excel" };
    }

    const profile = detectBusinessProfile({
      headers: input.mapping.fields.map((f) => f.sourceColumn),
    });
    profile.profileId = input.selectedProfileId;
    profile.label =
      input.selectedProfileId === "commercial"
        ? "Commercial Executive Intelligence"
        : profile.label;

    const bundle = createStudioSnapshot({
      organisationId: actor.organisationId,
      profileId: input.profileId,
      productId: input.productId ?? "executiveos",
      actorId: actor.userId,
      sourceKind: input.sourceKind,
      tabularText: input.tabularText,
      binaryBase64: input.binaryBase64,
      filename: input.filename,
      mapping: input.mapping,
    });

    if (!bundle.ingestion.ok || !bundle.ingestion.snapshot) {
      return toPlainJson({
        success: false,
        profile,
        confidence: bundle.ingestion.confidence,
        readiness: bundle.readiness,
        validation: bundle.ingestion.validation,
        mappedFields: describeMapping(input.mapping),
        mappingPreview:
          bundle.mappingPreview ?? buildMappingPreview(input.mapping, false),
        errors: bundle.ingestion.errors.length
          ? bundle.ingestion.errors.map((e) => userSafeError(e))
          : [
              "Validation prevented the Executive Snapshot. Improve readiness and retry.",
            ],
      });
    }

    if (!isSnapshotValidForIntelligence(bundle.ingestion.snapshot)) {
      return {
        success: false,
        profile,
        errors: [
          "ExecutiveOS could not create a valid Executive Snapshot from this workbook. The parse result was marked obsolete.",
        ],
      };
    }

    return toPlainJson({
      success: true,
      profile,
      confidence: bundle.ingestion.confidence,
      readiness: bundle.readiness,
      validation: bundle.ingestion.validation,
      mappedFields: describeMapping(input.mapping),
      mappingPreview:
        bundle.mappingPreview ?? buildMappingPreview(input.mapping, true),
      snapshot: bundle.ingestion.snapshot,
      snapshotMeta: bundle.ingestion.snapshot.meta,
      errors: [],
    });
  } catch (error) {
    return {
      success: false,
      errors: [userSafeError(error)],
    };
  }
}

/**
 * Run intelligence (+ commercial interpretation when applicable) on the server.
 */
export async function runStudioIntelligenceAction(
  input: RunStudioIntelligenceInput,
): Promise<StudioIntelligenceActionResult> {
  const actor = await requireStudioActor(input.snapshot?.meta?.organisationId);
  if (!actor.ok) {
    return {
      success: false,
      errors: [actor.error],
    };
  }

  try {
    if (!input.snapshot?.meta?.snapshotId) {
      return {
        success: false,
        errors: ["Snapshot is missing. Create the Executive Snapshot first."],
      };
    }

    if (input.snapshot.meta.organisationId !== actor.organisationId) {
      return {
        success: false,
        errors: ["Not authorised for this organisation."],
      };
    }

    if (!isSnapshotValidForIntelligence(input.snapshot)) {
      return {
        success: false,
        errors: [
          "This Executive Snapshot is invalid or obsolete and cannot be used as business context. Re-upload the workbook.",
        ],
      };
    }

    if (input.selectedProfileId === "commercial") {
      const interpreted = interpretCommercialSnapshot({
        snapshot: input.snapshot,
        readiness: input.readiness,
        organisationName: input.organisationName,
      });

      const intelligence = activateStudioIntelligence({
        profileId: "commercial",
        industryLabel: getStudioIndustryLabel("commercial"),
        readiness: interpreted.readiness,
        recordCount: input.snapshot.meta.recordCount,
        organisationName: input.organisationName,
      });
      intelligence.narrative = interpreted.brief.executiveJudgement;
      intelligence.councilStatus = interpreted.council.framing;

      const brief = buildStudioBriefPreview({
        profileId: "commercial",
        readiness: interpreted.readiness,
        confidenceOverall: interpreted.brief.confidence,
        recordCount: input.snapshot.meta.recordCount,
        intelligence,
      });
      brief.whatChanged = interpreted.brief.materialChanges;
      brief.whatRequiresJudgement = interpreted.brief.priorityJudgements;
      brief.summary = interpreted.brief.executiveJudgement;

      const insights: StudioInsightSummary[] = interpreted.analysis.insights
        .filter((i) => i.category !== "executive_judgement")
        .map((i) => ({
          id: i.id,
          title: i.title,
          detail: i.detail,
          implication: i.implication,
          category: i.category,
          posture: i.posture,
          confidence: i.confidence,
          evidence: i.evidence,
        }));

      const council: StudioCouncilPositionSummary = {
        framing: interpreted.council.framing,
        seats: interpreted.council.perspectives.map((p) => p.shortTitle),
        perspectives: interpreted.council.perspectives.map((p) => ({
          agentId: p.agentId,
          title: p.title,
          shortTitle: p.shortTitle,
          summary: p.review.summary,
        })),
        disagreements: interpreted.brief.councilDisagreement,
      };

      const handoff: StudioCommandCentreHandoff = {
        studioId: input.studioId,
        snapshotId: input.snapshot.meta.snapshotId,
        organisationId: input.snapshot.meta.organisationId,
        organisationName: input.organisationName,
        profileId: "commercial",
        profileLabel: getStudioProfileLabel("commercial"),
        sourceKind: input.snapshot.meta.sourceKind,
        filename: input.filename,
        recordCount: input.snapshot.meta.recordCount,
        confidenceOverall: input.snapshot.meta.confidence.overall,
        readiness: interpreted.readiness,
        portfolio: interpreted.portfolio,
        analysis: interpreted.analysis,
        commercialBrief: interpreted.brief,
        councilSeats: council.seats,
        advisorNames: intelligence.advisorNames,
      };

      return toPlainJson({
        success: true,
        readiness: interpreted.readiness,
        intelligence,
        brief,
        insights,
        recommendations: interpreted.brief.recommendedJudgement,
        council,
        commercialBriefSummary: interpreted.brief.executiveJudgement,
        executiveValue: interpreted.brief.executiveValue,
        dataConfidence: interpreted.brief.dataConfidence,
        handoff,
        errors: [],
      });
    }

    if (input.selectedProfileId === "manufacturing") {
      const interpreted = interpretManufacturingSnapshot({
        snapshot: input.snapshot,
        readiness: input.readiness,
        organisationName: input.organisationName,
      });

      const intelligence = activateStudioIntelligence({
        profileId: "manufacturing",
        industryLabel: getStudioIndustryLabel("manufacturing"),
        readiness: interpreted.readiness,
        recordCount: input.snapshot.meta.recordCount,
        organisationName: input.organisationName,
      });
      intelligence.narrative = interpreted.brief.executiveJudgement;
      intelligence.councilStatus = interpreted.council.framing;

      const brief = buildStudioBriefPreview({
        profileId: "manufacturing",
        readiness: interpreted.readiness,
        confidenceOverall: interpreted.brief.confidence,
        recordCount: input.snapshot.meta.recordCount,
        intelligence,
      });
      brief.whatChanged = interpreted.brief.whatChanged;
      brief.whatRequiresJudgement = interpreted.brief.whatRequiresJudgement;
      brief.summary = interpreted.brief.executiveJudgement;

      const insights: StudioInsightSummary[] = interpreted.analysis.insights
        .filter((i) => i.category !== "executive_judgement")
        .map((i) => ({
          id: i.id,
          title: i.title,
          detail: i.detail,
          implication: i.implication,
          category: i.category,
          posture: i.posture,
          confidence: i.confidence,
          evidence: i.evidence,
        }));

      const council: StudioCouncilPositionSummary = {
        framing: interpreted.council.framing,
        seats: interpreted.council.perspectives.map((p) => p.shortTitle),
        perspectives: interpreted.council.perspectives.map((p) => ({
          agentId: p.agentId,
          title: p.title,
          shortTitle: p.shortTitle,
          summary: p.review.summary,
        })),
        disagreements: interpreted.brief.councilDisagreement,
      };

      const handoff: StudioCommandCentreHandoff = {
        studioId: input.studioId,
        snapshotId: input.snapshot.meta.snapshotId,
        organisationId: input.snapshot.meta.organisationId,
        organisationName: input.organisationName,
        profileId: "manufacturing",
        profileLabel: getStudioProfileLabel("manufacturing"),
        sourceKind: input.snapshot.meta.sourceKind,
        filename: input.filename,
        recordCount: input.snapshot.meta.recordCount,
        confidenceOverall: input.snapshot.meta.confidence.overall,
        readiness: interpreted.readiness,
        portfolio: interpreted.portfolio,
        manufacturingAnalysis: interpreted.analysis,
        manufacturingBrief: interpreted.brief,
        councilSeats: council.seats,
        advisorNames: intelligence.advisorNames,
      };

      return toPlainJson({
        success: true,
        readiness: interpreted.readiness,
        intelligence,
        brief,
        insights,
        recommendations: interpreted.brief.recommendedJudgement,
        council,
        manufacturingBriefSummary: interpreted.brief.executiveJudgement,
        executiveValue: interpreted.brief.executiveValue,
        dataConfidence: interpreted.brief.dataConfidence,
        handoff,
        errors: [],
      });
    }

    const industryLabel = getStudioIndustryLabel(input.selectedProfileId);
    const intelligence = activateStudioIntelligence({
      profileId: input.selectedProfileId,
      industryLabel,
      readiness: input.readiness,
      recordCount: input.snapshot.meta.recordCount,
      organisationName: input.organisationName,
    });
    const brief = buildStudioBriefPreview({
      profileId: input.selectedProfileId,
      readiness: input.readiness,
      confidenceOverall: input.snapshot.meta.confidence.overall,
      recordCount: input.snapshot.meta.recordCount,
      intelligence,
    });

    const emptyPortfolio: import("@/lib/outcomes/types").OutcomePortfolio = {
      overallScore: input.readiness.executiveReadiness,
      statusLabel:
        "Strategic priorities have not yet been established. Judgement is ranked by materiality from this snapshot.",
      refreshedAt: input.snapshot.meta.createdAt,
      executiveName: input.organisationName?.trim() || "Executive",
      outcomes: [],
      decisions: [],
      intent: {
        id: "intent-snapshot-pending",
        title: "Establish strategic priorities",
        narrative:
          "Strategic priorities have not yet been established. Judgement is ranked by materiality, evidence, confidence and potential business impact.",
        priority: "high",
        horizon: "This quarter",
        reviewDate: new Date().toISOString().slice(0, 10),
        reviewCadence: "Weekly",
        focusOutcomeIds: [],
        watchingOutcomeIds: [],
        nonFocusOutcomeIds: [],
        constraints: [],
        successSignals: [],
        status: "active",
        history: [],
      },
      intentHistory: [],
    };

    const handoff: StudioCommandCentreHandoff = {
      studioId: input.studioId,
      snapshotId: input.snapshot.meta.snapshotId,
      organisationId: input.snapshot.meta.organisationId,
      organisationName: input.organisationName,
      profileId: input.selectedProfileId,
      profileLabel: getStudioProfileLabel(input.selectedProfileId),
      sourceKind: input.snapshot.meta.sourceKind,
      filename: input.filename,
      recordCount: input.snapshot.meta.recordCount,
      confidenceOverall: input.snapshot.meta.confidence.overall,
      readiness: input.readiness,
      portfolio: emptyPortfolio,
      councilSeats: ["CEO", "CFO", "COO", "CRO", "CSO"],
      advisorNames: intelligence.advisorNames,
    };

    return toPlainJson({
      success: true,
      readiness: input.readiness,
      intelligence,
      brief,
      insights: [],
      recommendations: brief.whatRequiresJudgement,
      council: {
        framing: intelligence.councilStatus,
        seats: ["CEO", "CFO", "COO", "CRO", "CSO"],
        perspectives: [],
        disagreements: [],
      },
      handoff,
      errors: [],
    });
  } catch (error) {
    return {
      success: false,
      errors: [userSafeError(error)],
    };
  }
}
