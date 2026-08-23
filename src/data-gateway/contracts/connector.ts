/**
 * Connector interface — all sources implement the same contract.
 */

import type { UdgRawRecord } from "./record";
import type {
  UdgConnectorCapability,
  UdgConnectorStatus,
  UdgSourceKind,
} from "./source";

export type UdgConnectorParseInput = {
  tabularText?: string;
  records?: UdgRawRecord[];
  filename?: string;
  /**
   * Base64-encoded workbook bytes for .xls / .xlsx.
   * Must never be UTF-8-decoded text of a binary workbook.
   */
  binaryBase64?: string;
};

export type UdgConnectorParseResult = {
  ok: boolean;
  records: UdgRawRecord[];
  errors: string[];
  warnings: string[];
};

export type UdgConnector = {
  id: string;
  kind: UdgSourceKind;
  label: string;
  status: UdgConnectorStatus;
  capability: UdgConnectorCapability;
  parse(input: UdgConnectorParseInput): UdgConnectorParseResult;
};
