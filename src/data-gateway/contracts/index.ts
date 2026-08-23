export type {
  UdgSourceKind,
  UdgIngestionMode,
  UdgSourceDescriptor,
  UdgConnectorStatus,
  UdgConnectorCapability,
} from "./source";
export { UDG_SOURCE_KINDS, UDG_INGESTION_MODES } from "./source";

export type {
  UdgFieldValue,
  UdgRawRecord,
  UdgCanonicalRecord,
  UdgCanonicalFieldKey,
} from "./record";
export {
  UDG_CANONICAL_FIELDS,
  UDG_CANONICAL_FIELD_LABELS,
} from "./record";

export {
  MANUFACTURING_FORECASTING_MODULE_ID,
  MANUFACTURING_FORECASTING_CONCEPTS,
  MANUFACTURING_FORECASTING_FIELDS,
  MANUFACTURING_FORECASTING_REQUIRED_HINTS,
  manufacturingForecastingFieldLabel,
  isManufacturingForecastingField,
} from "./manufacturing-forecasting";
export type { ManufacturingForecastingField } from "./manufacturing-forecasting";

export type {
  UdgFieldTransform,
  UdgFieldMapping,
  UdgMappingDefinition,
} from "./mapping";

export type {
  UdgValidationSeverity,
  UdgValidationIssueCode,
  UdgValidationIssue,
  UdgValidationStatus,
  UdgValidationResult,
} from "./validation";

export type {
  UdgConfidenceDimensions,
  UdgConfidenceScore,
} from "./confidence";

export type {
  UdgSnapshotMeta,
  UdgExecutiveSnapshot,
  UdgSnapshotSummary,
} from "./snapshot";

export type { UdgLineagePointer, UdgLineageQuery } from "./lineage";

export type { UdgAuditAction, UdgAuditEntry } from "./audit";

export type { UdgIngestionRequest, UdgIngestionResult } from "./ingestion";

export type {
  UdgConnector,
  UdgConnectorParseInput,
  UdgConnectorParseResult,
} from "./connector";
