/**
 * Ingestion pipeline contracts — modes extend without redesign.
 */

import type { UdgConfidenceScore } from "./confidence";
import type { UdgMappingDefinition } from "./mapping";
import type { UdgRawRecord } from "./record";
import type { UdgExecutiveSnapshot } from "./snapshot";
import type { UdgIngestionMode, UdgSourceKind } from "./source";
import type { UdgValidationResult } from "./validation";

export type UdgIngestionRequest = {
  organisationId: string;
  profileId: string;
  productId: string;
  sourceKind: UdgSourceKind;
  connectorId: string;
  mode: UdgIngestionMode;
  actorId?: string;
  /** Tabular payload (CSV text or delimiter-separated). Never binary XLS-as-text. */
  tabularText?: string;
  /**
   * Base64-encoded Excel workbook bytes (.xls / .xlsx).
   * Parsed structurally on the server — never treated as UTF-8 text.
   */
  binaryBase64?: string;
  /** Pre-parsed rows (manual entry / API / workbook parser). */
  records?: UdgRawRecord[];
  mapping?: UdgMappingDefinition;
  mappingId?: string;
  /** ISO timestamp — defaults to now. */
  asOf?: string;
  /** Optional filename for audit. */
  filename?: string;
};

export type UdgIngestionResult = {
  ok: boolean;
  snapshot?: UdgExecutiveSnapshot;
  validation: UdgValidationResult;
  confidence?: UdgConfidenceScore;
  errors: string[];
  warnings: string[];
};
