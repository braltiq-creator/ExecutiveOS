import type {
  UdgConnector,
  UdgConnectorParseInput,
  UdgConnectorParseResult,
} from "../contracts";
import {
  base64ToUint8Array,
  looksLikeBinaryMisdecodedAsText,
  parseExcelWorkbook,
  parseTabularText,
  recordsFromManualRows,
} from "../uploads";

function emptyPlaceholder(
  id: string,
  kind: UdgConnector["kind"],
  label: string,
): UdgConnector {
  return {
    id,
    kind,
    label,
    status: "placeholder",
    capability: {
      modes: ["api", "scheduled", "webhook"],
      acceptsTabular: false,
      productionIntegration: false,
    },
    parse(): UdgConnectorParseResult {
      return {
        ok: false,
        records: [],
        errors: [
          `${label} connector is a contract placeholder — production integration is not implemented.`,
        ],
        warnings: [],
      };
    },
  };
}

export function createCsvConnector(): UdgConnector {
  return {
    id: "udg-csv",
    kind: "csv",
    label: "CSV",
    status: "ready",
    capability: {
      modes: ["upload", "api"],
      acceptsTabular: true,
      productionIntegration: false,
    },
    parse(input: UdgConnectorParseInput): UdgConnectorParseResult {
      if (input.records?.length) {
        return { ok: true, records: input.records, errors: [], warnings: [] };
      }
      if (!input.tabularText?.trim()) {
        return {
          ok: false,
          records: [],
          errors: ["CSV connector requires tabularText or records."],
          warnings: [],
        };
      }
      if (looksLikeBinaryMisdecodedAsText(input.tabularText)) {
        return {
          ok: false,
          records: [],
          errors: [
            "ExecutiveOS could not identify this file format. A binary workbook was supplied on the CSV text path.",
          ],
          warnings: [],
        };
      }
      const parsed = parseTabularText(input.tabularText);
      return {
        ok: parsed.errors.length === 0 && parsed.records.length > 0,
        records: parsed.records,
        errors: parsed.errors,
        warnings:
          parsed.records.length === 0 && parsed.errors.length === 0
            ? ["No data rows found."]
            : [],
      };
    },
  };
}

/**
 * Excel connector — structural .xls / .xlsx parsing via workbook bytes.
 * CSV text is never assumed for binary workbooks.
 */
export function createExcelConnector(): UdgConnector {
  return {
    id: "udg-excel",
    kind: "excel",
    label: "Excel",
    status: "ready",
    capability: {
      modes: ["upload", "api"],
      acceptsTabular: true,
      productionIntegration: true,
    },
    parse(input: UdgConnectorParseInput): UdgConnectorParseResult {
      if (input.records?.length) {
        return { ok: true, records: input.records, errors: [], warnings: [] };
      }

      if (input.binaryBase64?.trim()) {
        try {
          const bytes = base64ToUint8Array(input.binaryBase64);
          const parsed = parseExcelWorkbook({
            bytes,
            filename: input.filename,
          });
          return {
            ok: parsed.ok,
            records: parsed.records,
            errors: parsed.errors,
            warnings: parsed.warnings,
          };
        } catch {
          return {
            ok: false,
            records: [],
            errors: [
              "ExecutiveOS could not read this Excel workbook. Please verify the workbook or upload an XLSX/CSV version.",
            ],
            warnings: [],
          };
        }
      }

      if (input.tabularText?.trim()) {
        if (looksLikeBinaryMisdecodedAsText(input.tabularText)) {
          return {
            ok: false,
            records: [],
            errors: [
              "ExecutiveOS could not read this Excel workbook. The file appears to be a legacy XLS workbook. Please verify the workbook or upload an XLSX/CSV version.",
            ],
            warnings: [],
          };
        }
        // Allow deliberate CSV-exported-as-excel-kind text only when it is clean tabular text
        const csv = createCsvConnector().parse({
          tabularText: input.tabularText,
          filename: input.filename,
        });
        return {
          ...csv,
          warnings: [
            ...csv.warnings,
            "Excel source received clean tabular text (not binary workbook bytes).",
          ],
        };
      }

      return {
        ok: false,
        records: [],
        errors: [
          "Excel connector requires binary workbook bytes (.xls / .xlsx) or pre-parsed records.",
        ],
        warnings: [],
      };
    },
  };
}

export function createManualUploadConnector(): UdgConnector {
  return {
    id: "udg-manual",
    kind: "manual",
    label: "Manual Upload",
    status: "ready",
    capability: {
      modes: ["upload", "api"],
      acceptsTabular: true,
      productionIntegration: false,
    },
    parse(input: UdgConnectorParseInput): UdgConnectorParseResult {
      if (input.records?.length) {
        return { ok: true, records: input.records, errors: [], warnings: [] };
      }
      if (input.tabularText?.trim()) {
        return createCsvConnector().parse(input);
      }
      return {
        ok: false,
        records: [],
        errors: ["Manual upload requires records or tabularText."],
        warnings: [],
      };
    },
  };
}

export function createDynamicsConnector(): UdgConnector {
  return emptyPlaceholder("udg-dynamics", "dynamics", "Microsoft Dynamics");
}

export function createSapConnector(): UdgConnector {
  return emptyPlaceholder("udg-sap", "sap", "SAP");
}

export function createOracleConnector(): UdgConnector {
  return emptyPlaceholder("udg-oracle", "oracle", "Oracle");
}

export function createRestApiConnector(): UdgConnector {
  return emptyPlaceholder("udg-rest-api", "rest_api", "REST API");
}

export function createAzureDataLakeConnector(): UdgConnector {
  return emptyPlaceholder(
    "udg-azure-data-lake",
    "azure_data_lake",
    "Azure Data Lake",
  );
}

export function createSnowflakeConnector(): UdgConnector {
  return emptyPlaceholder("udg-snowflake", "snowflake", "Snowflake");
}

export function createAllUdgConnectors(): UdgConnector[] {
  return [
    createExcelConnector(),
    createCsvConnector(),
    createManualUploadConnector(),
    createDynamicsConnector(),
    createSapConnector(),
    createOracleConnector(),
    createRestApiConnector(),
    createAzureDataLakeConnector(),
    createSnowflakeConnector(),
  ];
}

export function createDefaultConnectorRegistry(): Map<string, UdgConnector> {
  return new Map(createAllUdgConnectors().map((c) => [c.id, c]));
}

/** Helper for tests / manual entry builders. */
export { recordsFromManualRows };
