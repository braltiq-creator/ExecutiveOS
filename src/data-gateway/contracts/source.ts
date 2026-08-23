/**
 * Universal Data Gateway — source & connector contracts.
 * Downstream ExecutiveOS never sees the original source system.
 */

export const UDG_SOURCE_KINDS = [
  "excel",
  "csv",
  "manual",
  "dynamics",
  "sap",
  "oracle",
  "rest_api",
  "azure_data_lake",
  "snowflake",
] as const;

export type UdgSourceKind = (typeof UDG_SOURCE_KINDS)[number];

export const UDG_INGESTION_MODES = [
  "upload",
  "scheduled",
  "webhook",
  "api",
  "streaming",
] as const;

export type UdgIngestionMode = (typeof UDG_INGESTION_MODES)[number];

export type UdgSourceDescriptor = {
  kind: UdgSourceKind;
  /** Opaque connector id — never leaked into intelligence payloads. */
  connectorId: string;
  label: string;
  mode: UdgIngestionMode;
  /** Optional vendor label for audit only — stripped from canonical snapshot body. */
  vendorLabel?: string;
};

export type UdgConnectorStatus =
  | "ready"
  | "placeholder"
  | "disabled"
  | "error";

export type UdgConnectorCapability = {
  modes: UdgIngestionMode[];
  /** Accepts tabular text / file payloads in v1. */
  acceptsTabular: boolean;
  /** Production binary/API integration — false for all v1 connectors. */
  productionIntegration: boolean;
};
