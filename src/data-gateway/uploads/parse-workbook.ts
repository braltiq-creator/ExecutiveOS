/**
 * Server-side Excel workbook parsing (.xls / .xlsx) via SheetJS.
 * Never UTF-8-decode workbook bytes. Never route CSV through this path.
 */

import * as XLSX from "xlsx";
import type { UdgFieldValue, UdgRawRecord } from "../contracts";
import {
  detectTabularFileType,
  type DetectedTabularFormat,
} from "./detect-file-type";

export const EXECUTIVE_WORKBOOK_PARSE_ERROR =
  "ExecutiveOS could not read this Excel workbook. The file appears to be a legacy XLS workbook. Please verify the workbook or upload an XLSX/CSV version.";

export type WorkbookParseResult = {
  ok: boolean;
  format: DetectedTabularFormat;
  sheetName: string;
  sheetNames: string[];
  headers: string[];
  records: UdgRawRecord[];
  errors: string[];
  warnings: string[];
};

function coerceCell(value: unknown): UdgFieldValue {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "boolean") return value;
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "") return null;
    return trimmed;
  }
  // SheetJS may return rich objects; stringify only as last resort for display fields
  if (typeof value === "object" && value !== null && "w" in value) {
    const w = (value as { w?: string }).w;
    return w == null || w.trim() === "" ? null : w.trim();
  }
  return String(value);
}

function isBlankHeader(h: string): boolean {
  return !h || /^(__EMPTY|Column\d+)$/i.test(h);
}

function normalizeHeaders(raw: unknown[]): string[] {
  const headers: string[] = [];
  const seen = new Map<string, number>();
  for (let i = 0; i < raw.length; i += 1) {
    let label = String(raw[i] ?? "").trim();
    if (!label) label = `Column ${i + 1}`;
    const count = seen.get(label) ?? 0;
    seen.set(label, count + 1);
    headers.push(count === 0 ? label : `${label} (${count + 1})`);
  }
  return headers;
}

function sheetToRecords(
  sheet: XLSX.WorkSheet,
): { headers: string[]; records: UdgRawRecord[]; warnings: string[] } {
  const warnings: string[] = [];
  const rows = XLSX.utils.sheet_to_json<(string | number | boolean | Date | null)[]>(
    sheet,
    {
      header: 1,
      raw: true,
      defval: null,
      blankrows: false,
    },
  );

  if (rows.length === 0) {
    return { headers: [], records: [], warnings: ["Worksheet has no rows."] };
  }

  const headerRow = rows[0] ?? [];
  const headers = normalizeHeaders(headerRow);
  if (headers.every(isBlankHeader)) {
    warnings.push("Header row appears blank.");
  }

  const records: UdgRawRecord[] = [];
  for (let r = 1; r < rows.length; r += 1) {
    const row = rows[r] ?? [];
    const fields: Record<string, UdgFieldValue> = {};
    let anyValue = false;
    headers.forEach((header, i) => {
      const value = coerceCell(row[i]);
      fields[header] = value;
      if (value !== null && value !== "") anyValue = true;
    });
    if (!anyValue) continue;
    records.push({
      rowIndex: r + 1,
      fields,
    });
  }

  return { headers, records, warnings };
}

function pickSheetWithBestTabularSignal(
  workbook: XLSX.WorkBook,
  sheetNames: string[],
): string | null {
  let best: { name: string; score: number } | null = null;
  for (const name of sheetNames) {
    const sheet = workbook.Sheets[name];
    if (!sheet) continue;
    const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
      header: 1,
      defval: null,
      blankrows: false,
    });
    if (rows.length < 2) continue;
    const header = (rows[0] ?? []).map((h) => String(h ?? "").toLowerCase()).join(" ");
    let score = rows.length;
    if (/opportunit|stage|owner|deal|pipeline|forecast/.test(header)) score += 1000;
    if (!best || score > best.score) best = { name, score };
  }
  return best?.name ?? null;
}

/**
 * Parse a binary Excel workbook into canonical tabular records.
 */
export function parseExcelWorkbook(input: {
  bytes: Uint8Array | ArrayBuffer;
  filename?: string;
  /** Prefer this sheet name when present. */
  sheetName?: string;
}): WorkbookParseResult {
  const bytes =
    input.bytes instanceof Uint8Array
      ? input.bytes
      : new Uint8Array(input.bytes);

  const detection = detectTabularFileType({
    filename: input.filename,
    bytes,
  });

  if (detection.format !== "xls" && detection.format !== "xlsx") {
    return {
      ok: false,
      format: detection.format,
      sheetName: "",
      sheetNames: [],
      headers: [],
      records: [],
      errors: [
        detection.reason ||
          "ExecutiveOS could not identify this file format.",
      ],
      warnings: [],
    };
  }

  try {
    // Use array type so parsing works in Node and the browser (no Buffer required).
    const workbook = XLSX.read(bytes, {
      type: "array",
      cellDates: true,
      cellNF: false,
      cellText: true,
      dense: false,
    });

    const sheetNames = workbook.SheetNames ?? [];
    if (sheetNames.length === 0) {
      return {
        ok: false,
        format: detection.format,
        sheetName: "",
        sheetNames: [],
        headers: [],
        records: [],
        errors: [
          "ExecutiveOS could not read this Excel workbook. No worksheets were found.",
        ],
        warnings: [],
      };
    }

    const preferred =
      (input.sheetName && sheetNames.includes(input.sheetName)
        ? input.sheetName
        : null) ??
      sheetNames.find((n) =>
        /opportunit|report|data|sheet\s*1/i.test(n),
      ) ??
      pickSheetWithBestTabularSignal(workbook, sheetNames) ??
      sheetNames[0]!;

    const sheet = workbook.Sheets[preferred];
    if (!sheet) {
      return {
        ok: false,
        format: detection.format,
        sheetName: preferred,
        sheetNames,
        headers: [],
        records: [],
        errors: [
          "ExecutiveOS could not read this Excel workbook. The selected worksheet is missing.",
        ],
        warnings: [],
      };
    }

    const { headers, records, warnings } = sheetToRecords(sheet);
    const multiSheetWarning =
      sheetNames.length > 1
        ? `Workbook has ${sheetNames.length} worksheets; using "${preferred}".`
        : null;

    if (records.length === 0) {
      return {
        ok: false,
        format: detection.format,
        sheetName: preferred,
        sheetNames,
        headers,
        records: [],
        errors: [
          "ExecutiveOS could not read this Excel workbook. No data rows were found.",
        ],
        warnings: [
          ...warnings,
          ...(multiSheetWarning ? [multiSheetWarning] : []),
        ],
      };
    }

    // Guard: headers must look like business fields, not binary residue
    const joined = headers.join(" ");
    if (/Aptos Narrow|Root Entry|Microsoft Macintosh Excel/i.test(joined)) {
      return {
        ok: false,
        format: detection.format,
        sheetName: preferred,
        sheetNames,
        headers: [],
        records: [],
        errors: [EXECUTIVE_WORKBOOK_PARSE_ERROR],
        warnings: [],
      };
    }

    return {
      ok: true,
      format: detection.format,
      sheetName: preferred,
      sheetNames,
      headers,
      records,
      errors: [],
      warnings: [
        ...warnings,
        ...(multiSheetWarning ? [multiSheetWarning] : []),
      ],
    };
  } catch {
    return {
      ok: false,
      format: detection.format,
      sheetName: "",
      sheetNames: [],
      headers: [],
      records: [],
      errors: [
        detection.format === "xls"
          ? EXECUTIVE_WORKBOOK_PARSE_ERROR
          : "ExecutiveOS could not read this Excel workbook. Please verify the file or upload a CSV version.",
      ],
      warnings: [],
    };
  }
}
