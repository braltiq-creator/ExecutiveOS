import {
  ingest,
  getMapping,
  type UdgIngestionResult,
  type UdgMappingDefinition,
  type UdgRawRecord,
  type UdgSourceKind,
} from "@/data-gateway";
import { buildMappingPreview } from "../mapping";
import { scoreExecutiveReadiness } from "../readiness";
import type { StudioReadiness, StudioMappingPreview } from "../types";

const CONNECTOR_IDS: Record<string, string> = {
  excel: "udg-excel",
  csv: "udg-csv",
  manual: "udg-manual",
};

export type StudioIngestInput = {
  organisationId: string;
  profileId: string;
  productId: string;
  actorId?: string;
  sourceKind: UdgSourceKind;
  /** CSV / clean tabular text only — never binary XLS decoded as UTF-8. */
  tabularText?: string;
  /** Base64 workbook bytes for .xls / .xlsx */
  binaryBase64?: string;
  /** Pre-parsed records (preferred when workbook already parsed server-side). */
  records?: UdgRawRecord[];
  filename?: string;
  mapping?: UdgMappingDefinition;
};

export type StudioIngestBundle = {
  ingestion: UdgIngestionResult;
  readiness?: StudioReadiness;
  mappingPreview?: StudioMappingPreview;
};

export function createStudioSnapshot(
  input: StudioIngestInput,
): StudioIngestBundle {
  const connectorId = CONNECTOR_IDS[input.sourceKind] ?? "udg-csv";

  if (
    !input.tabularText?.trim() &&
    !input.binaryBase64?.trim() &&
    !input.records?.length
  ) {
    return {
      ingestion: {
        ok: false,
        validation: {
          status: "failed",
          issues: [],
          errorCount: 1,
          warningCount: 0,
          checkedAt: new Date().toISOString(),
        },
        errors: ["No file content received. Upload a CSV or Excel export."],
        warnings: [],
      },
    };
  }

  const ingestion = ingest({
    organisationId: input.organisationId,
    profileId: input.profileId,
    productId: input.productId,
    actorId: input.actorId,
    sourceKind: input.sourceKind,
    connectorId,
    mode: "upload",
    tabularText: input.tabularText,
    binaryBase64: input.binaryBase64,
    records: input.records,
    mapping: input.mapping,
    filename: input.filename,
  });

  if (!ingestion.ok || !ingestion.snapshot || !ingestion.confidence) {
    return { ingestion };
  }

  const readiness = scoreExecutiveReadiness({
    confidence: ingestion.confidence,
    validation: ingestion.validation,
    asOf: ingestion.snapshot.meta.createdAt,
    datasetShape: detectDatasetShape(input.mapping),
  });

  const mapping =
    input.mapping ??
    (ingestion.snapshot.meta.mappingId
      ? getMapping(ingestion.snapshot.meta.mappingId)
      : undefined);

  const mappingPreview = mapping
    ? buildMappingPreview(mapping, true)
    : undefined;

  return {
    ingestion,
    readiness,
    mappingPreview,
  };
}

function detectDatasetShape(
  mapping?: UdgMappingDefinition,
): "flat_commercial" | "hierarchical" | "unknown" {
  if (!mapping) return "unknown";
  const fields = new Set(mapping.fields.map((f) => f.canonicalField));
  const hasCommercial = fields.has("opportunity") || fields.has("stage");
  const hasOrgHierarchy =
    fields.has("dealer") || fields.has("branch") || fields.has("region");
  if (hasCommercial && !hasOrgHierarchy) return "flat_commercial";
  if (hasOrgHierarchy) return "hierarchical";
  return "unknown";
}
