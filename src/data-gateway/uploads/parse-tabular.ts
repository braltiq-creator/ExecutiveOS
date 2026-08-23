import type { UdgFieldValue, UdgRawRecord } from "../contracts";

export type TabularParseOptions = {
  delimiter?: string;
  /** Treat first row as headers (default true). */
  header?: boolean;
};

function splitCsvLine(line: string, delimiter: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === delimiter && !inQuotes) {
      cells.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  cells.push(current);
  return cells.map((c) => c.trim());
}

function coerceValue(raw: string): UdgFieldValue {
  if (raw === "") return null;
  const lower = raw.toLowerCase();
  if (lower === "true") return true;
  if (lower === "false") return false;
  if (/^-?\d+(\.\d+)?$/.test(raw)) return Number(raw);
  return raw;
}

/**
 * Parse delimiter-separated tabular text into raw records.
 * Used by CSV and Excel (v1 text payload) connectors.
 */
export function parseTabularText(
  text: string,
  options: TabularParseOptions = {},
): { records: UdgRawRecord[]; headers: string[]; errors: string[] } {
  const delimiter = options.delimiter ?? detectDelimiter(text);
  const useHeader = options.header !== false;
  const errors: string[] = [];

  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((l) => l.trimEnd())
    .filter((l) => l.length > 0);

  if (lines.length === 0) {
    return { records: [], headers: [], errors: ["Empty tabular payload."] };
  }

  const headerCells = useHeader
    ? splitCsvLine(lines[0], delimiter)
    : splitCsvLine(lines[0], delimiter).map((_, i) => `column_${i + 1}`);

  if (headerCells.some((h) => !h)) {
    errors.push("One or more header columns are blank.");
  }

  const dataLines = useHeader ? lines.slice(1) : lines;
  const records: UdgRawRecord[] = dataLines.map((line, index) => {
    const cells = splitCsvLine(line, delimiter);
    const fields: Record<string, UdgFieldValue> = {};
    headerCells.forEach((header, i) => {
      fields[header] = coerceValue(cells[i] ?? "");
    });
    return {
      rowIndex: useHeader ? index + 2 : index + 1,
      fields,
    };
  });

  return { records, headers: headerCells, errors };
}

function detectDelimiter(text: string): string {
  const first = text.split(/\r?\n/).find((l) => l.trim().length > 0) ?? "";
  const counts = {
    ",": (first.match(/,/g) ?? []).length,
    "\t": (first.match(/\t/g) ?? []).length,
    ";": (first.match(/;/g) ?? []).length,
    "|": (first.match(/\|/g) ?? []).length,
  };
  const best = (Object.entries(counts) as Array<[string, number]>).sort(
    (a, b) => b[1] - a[1],
  )[0];
  return best && best[1] > 0 ? best[0] : ",";
}

export function recordsFromManualRows(
  rows: Array<Record<string, UdgFieldValue>>,
): UdgRawRecord[] {
  return rows.map((fields, index) => ({
    rowIndex: index + 1,
    fields: { ...fields },
  }));
}
