import type {
  UdgConnector,
  UdgIngestionRequest,
  UdgIngestionResult,
  UdgMappingDefinition,
} from "../contracts";
import { recordAudit } from "../audit";
import { scoreConfidence } from "../confidence";
import {
  createDefaultConnectorRegistry,
} from "../connectors";
import { buildLineageForSnapshot } from "../lineage";
import {
  applyMapping,
  getMapping,
  inferMappingFromHeaders,
  saveMapping,
} from "../mapping";
import { createExecutiveSnapshot, storeSnapshot } from "../snapshots";
import { parseTabularText } from "../uploads";
import {
  looksLikeBinaryMisdecodedAsText,
} from "../uploads/detect-file-type";
import {
  suggestRequiredFromMapping,
  validateRecords,
} from "../validation";
import { assertSupportedMode } from "./modes";

export type IngestOptions = {
  connectors?: Map<string, UdgConnector>;
  /** Persist mapping when provided inline. */
  persistMapping?: boolean;
  ageHours?: number;
};

/**
 * Universal ingestion pipeline.
 * Source → parse → map → validate → confidence → snapshot → lineage → audit
 *
 * Downstream consumers receive only UdgExecutiveSnapshot.
 */
export function ingest(request: UdgIngestionRequest, options: IngestOptions = {}): UdgIngestionResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const asOf = request.asOf ?? new Date().toISOString();

  try {
    assertSupportedMode(request.mode);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      validation: {
        status: "failed",
        issues: [],
        errorCount: 1,
        warningCount: 0,
        checkedAt: asOf,
      },
      errors: [message],
      warnings: [],
    };
  }

  recordAudit({
    action: "upload_received",
    organisationId: request.organisationId,
    actorId: request.actorId,
    connectorId: request.connectorId,
    at: asOf,
    detail: request.filename,
    metadata: { sourceKind: request.sourceKind, mode: request.mode },
  });

  const registry = options.connectors ?? createDefaultConnectorRegistry();
  const connector = registry.get(request.connectorId);

  if (!connector) {
    return fail(request, asOf, [`Unknown connector: ${request.connectorId}`]);
  }

  if (connector.kind !== request.sourceKind) {
    warnings.push(
      `Connector kind ${connector.kind} differs from request sourceKind ${request.sourceKind}; using connector kind.`,
    );
  }

  recordAudit({
    action: "connector_invoked",
    organisationId: request.organisationId,
    connectorId: connector.id,
    at: asOf,
  });

  const parsed = connector.parse({
    tabularText: request.tabularText,
    records: request.records,
    filename: request.filename,
    binaryBase64: request.binaryBase64,
  });

  // Refuse corrupted XLS-as-text payloads before any snapshot can be stored.
  if (
    request.tabularText &&
    !request.binaryBase64 &&
    !request.records?.length &&
    looksLikeBinaryMisdecodedAsText(request.tabularText)
  ) {
    return fail(request, asOf, [
      "ExecutiveOS could not read this Excel workbook. The file appears to be a legacy XLS workbook. Please verify the workbook or upload an XLSX/CSV version.",
    ]);
  }

  errors.push(...parsed.errors);
  warnings.push(...parsed.warnings);

  recordAudit({
    action: "parsed",
    organisationId: request.organisationId,
    connectorId: connector.id,
    at: asOf,
    metadata: { recordCount: parsed.records.length },
  });

  if (!parsed.ok || parsed.records.length === 0) {
    const validation = validateRecords([]);
    return {
      ok: false,
      validation,
      errors: errors.length ? errors : ["No records parsed."],
      warnings,
    };
  }

  let mapping: UdgMappingDefinition | undefined =
    request.mapping ??
    (request.mappingId ? getMapping(request.mappingId) : undefined);

  if (!mapping) {
    const headers =
      request.records?.length
        ? Object.keys(request.records[0]?.fields ?? {})
        : request.tabularText != null &&
            !looksLikeBinaryMisdecodedAsText(request.tabularText)
          ? parseTabularText(request.tabularText).headers
          : Object.keys(parsed.records[0]?.fields ?? {});
    mapping = inferMappingFromHeaders(headers, {
      organisationId: request.organisationId,
      profileId: request.profileId,
      productId: request.productId,
      asOf,
    });
  }

  if (options.persistMapping !== false) {
    mapping = saveMapping(mapping);
    recordAudit({
      action: "mapping_saved",
      organisationId: request.organisationId,
      mappingId: mapping.id,
      at: asOf,
    });
  }

  recordAudit({
    action: "mapped",
    organisationId: request.organisationId,
    mappingId: mapping.id,
    at: asOf,
  });

  const canonical = applyMapping(parsed.records, mapping, "rec");
  const required = suggestRequiredFromMapping(mapping.fields);
  const validation = validateRecords(canonical, {
    requiredFields: required,
    numericFields: mapping.fields
      .filter((f) =>
        [
          "forecastQuantity",
          "quantity",
          "amount",
          "saasValue",
          "maintenanceValue",
          "licenseValue",
          "oneTimeServicesValue",
          "recurringValue",
          "pipelineValue",
          "stageDuration",
        ].includes(f.canonicalField),
      )
      .map((f) => f.canonicalField),
    dateFields: mapping.fields
      .filter(
        (f) =>
          ["asOfDate", "closeDate", "lastStageChangeDate", "stageMovement"].includes(
            f.canonicalField,
          ) || f.transform === "iso_date",
      )
      .map((f) => f.canonicalField),
    hierarchy: [
      { parent: "model", child: "variant" },
      { parent: "opportunity", child: "stage" },
    ],
    asOf,
  });

  recordAudit({
    action: "validated",
    organisationId: request.organisationId,
    at: asOf,
    metadata: {
      status: validation.status,
      errors: validation.errorCount,
      warnings: validation.warningCount,
    },
  });

  if (validation.status === "failed") {
    recordAudit({
      action: "ingestion_failed",
      organisationId: request.organisationId,
      connectorId: connector.id,
      at: asOf,
      detail: "Validation failed",
    });
    return {
      ok: false,
      validation,
      errors: [
        ...errors,
        ...validation.issues
          .filter((i) => i.severity === "error")
          .map((i) => i.message),
      ],
      warnings,
    };
  }

  const confidence = scoreConfidence({
    records: canonical,
    validation,
    expectedFields: mapping.fields.map((f) => f.canonicalField),
    ageHours: options.ageHours ?? 0,
    asOf,
  });

  recordAudit({
    action: "confidence_scored",
    organisationId: request.organisationId,
    at: asOf,
    metadata: { overall: confidence.overall },
  });

  const snapshot = createExecutiveSnapshot({
    organisationId: request.organisationId,
    profileId: request.profileId,
    productId: request.productId,
    sourceKind: connector.kind,
    connectorId: connector.id,
    mappingId: mapping.id,
    records: canonical,
    validationStatus: validation.status,
    confidence,
    createdAt: asOf,
  });

  storeSnapshot(snapshot);
  buildLineageForSnapshot({
    snapshotId: snapshot.meta.snapshotId,
    organisationId: request.organisationId,
    sourceKind: connector.kind,
    connectorId: connector.id,
    mapping,
    records: canonical,
    timestamp: asOf,
  });

  recordAudit({
    action: "snapshot_created",
    organisationId: request.organisationId,
    snapshotId: snapshot.meta.snapshotId,
    connectorId: connector.id,
    mappingId: mapping.id,
    at: asOf,
    metadata: {
      recordCount: snapshot.meta.recordCount,
      confidence: confidence.overall,
    },
  });

  return {
    ok: true,
    snapshot,
    validation,
    confidence,
    errors,
    warnings: [
      ...warnings,
      ...validation.issues
        .filter((i) => i.severity === "warning")
        .map((i) => i.message),
    ],
  };
}

function fail(
  request: UdgIngestionRequest,
  asOf: string,
  errors: string[],
): UdgIngestionResult {
  recordAudit({
    action: "ingestion_failed",
    organisationId: request.organisationId,
    connectorId: request.connectorId,
    at: asOf,
    detail: errors[0],
  });
  return {
    ok: false,
    validation: {
      status: "failed",
      issues: [],
      errorCount: errors.length,
      warningCount: 0,
      checkedAt: asOf,
    },
    errors,
    warnings: [],
  };
}
