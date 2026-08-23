/**
 * Root cause (Phase 57C):
 * UploadDropzone used File.text() (UTF-8) on OLE Compound Document .xls bytes
 * (magic D0 CF 11 E0). parseTabularText then split binary garbage into thousands
 * of fake rows (e.g. ~9,166) including workbook-internal strings like font names.
 *
 * Fix: detect file type from extension + magic bytes; parse .xls/.xlsx with
 * SheetJS on the server; keep CSV on the text path. Never UTF-8-decode XLS.
 */

export const XLS_OLE_MAGIC = [0xd0, 0xcf, 0x11, 0xe0] as const;
export const XLSX_ZIP_MAGIC = [0x50, 0x4b] as const; // PK

export type DetectedTabularFormat =
  | "csv"
  | "xls"
  | "xlsx"
  | "unknown";

export type FileTypeDetection = {
  format: DetectedTabularFormat;
  sourceKind: "csv" | "excel" | null;
  confidence: "extension" | "magic" | "both" | "none";
  reason: string;
};

function bytesMatch(bytes: Uint8Array, magic: readonly number[]): boolean {
  if (bytes.length < magic.length) return false;
  return magic.every((b, i) => bytes[i] === b);
}

function extensionFormat(filename?: string): DetectedTabularFormat | null {
  if (!filename) return null;
  const lower = filename.toLowerCase();
  if (lower.endsWith(".csv") || lower.endsWith(".tsv") || lower.endsWith(".txt")) {
    return "csv";
  }
  if (lower.endsWith(".xlsx")) return "xlsx";
  if (lower.endsWith(".xls")) return "xls";
  return null;
}

/**
 * Detect tabular format from filename and/or binary magic.
 * Prefer magic when bytes are present; reject unsafe mismatches.
 */
export function detectTabularFileType(input: {
  filename?: string;
  bytes?: Uint8Array | ArrayBuffer | null;
}): FileTypeDetection {
  const bytes =
    input.bytes == null
      ? null
      : input.bytes instanceof Uint8Array
        ? input.bytes
        : new Uint8Array(input.bytes);

  const fromExt = extensionFormat(input.filename);
  let fromMagic: DetectedTabularFormat | null = null;

  if (bytes && bytes.length >= 4) {
    if (bytesMatch(bytes, XLS_OLE_MAGIC)) fromMagic = "xls";
    else if (bytesMatch(bytes, XLSX_ZIP_MAGIC)) fromMagic = "xlsx";
  }

  if (fromMagic && fromExt) {
    if (fromMagic === fromExt) {
      return {
        format: fromMagic,
        sourceKind: "excel",
        confidence: "both",
        reason: `Detected ${fromMagic.toUpperCase()} from extension and file signature.`,
      };
    }
    // .xls extension sometimes used for .xlsx — trust magic for Excel family
    if (
      (fromExt === "xls" || fromExt === "xlsx") &&
      (fromMagic === "xls" || fromMagic === "xlsx")
    ) {
      return {
        format: fromMagic,
        sourceKind: "excel",
        confidence: "magic",
        reason: `File signature indicates ${fromMagic.toUpperCase()} (extension was .${fromExt}).`,
      };
    }
    return {
      format: "unknown",
      sourceKind: null,
      confidence: "none",
      reason: "File extension and binary signature disagree.",
    };
  }

  if (fromMagic) {
    return {
      format: fromMagic,
      sourceKind: "excel",
      confidence: "magic",
      reason: `Detected ${fromMagic.toUpperCase()} from file signature.`,
    };
  }

  if (fromExt === "csv") {
    return {
      format: "csv",
      sourceKind: "csv",
      confidence: "extension",
      reason: "Detected CSV/TSV from extension.",
    };
  }

  if (fromExt === "xls" || fromExt === "xlsx") {
    return {
      format: fromExt,
      sourceKind: "excel",
      confidence: "extension",
      reason: `Detected ${fromExt.toUpperCase()} from extension (signature unavailable).`,
    };
  }

  return {
    format: "unknown",
    sourceKind: null,
    confidence: "none",
    reason: "ExecutiveOS could not identify this file format.",
  };
}

/**
 * True when a string looks like binary workbook bytes mis-decoded as UTF-8.
 * Used to refuse the corrupt text path that produced ~9k fake rows.
 */
export function looksLikeBinaryMisdecodedAsText(text: string): boolean {
  if (!text) return false;
  const sample = text.slice(0, 4000);
  if (sample.includes("\u0000")) return true;
  if (/[\x00-\x08\x0E-\x1F]/.test(sample)) return true;
  // OLE / Excel internal streams frequently surface these when UTF-8-decoded
  if (
    /Aptos Narrow|Calibri|Worksheet|Workbook|Microsoft Macintosh Excel|Root Entry/i.test(
      sample,
    ) &&
    !/^[\s\S]{0,200}(Opportunity|Dealer|Forecast|Stage|Owner)/i.test(sample)
  ) {
    return true;
  }
  // High ratio of replacement / non-printable characters
  let weird = 0;
  const n = Math.min(sample.length, 2000);
  for (let i = 0; i < n; i += 1) {
    const code = sample.charCodeAt(i);
    if (code === 0xfffd || (code < 32 && code !== 9 && code !== 10 && code !== 13)) {
      weird += 1;
    }
  }
  return weird / n > 0.08;
}

export function base64ToUint8Array(base64: string): Uint8Array {
  const cleaned = base64.includes(",")
    ? base64.slice(base64.indexOf(",") + 1)
    : base64;
  if (typeof Buffer !== "undefined") {
    const binary = Buffer.from(cleaned, "base64");
    return new Uint8Array(binary.buffer, binary.byteOffset, binary.byteLength);
  }
  const binary = atob(cleaned);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Client/upload helper — returns a simple kind for routing parsers.
 */
export function detectUploadFileType(input: {
  fileName?: string;
  mimeType?: string;
  bytes?: Uint8Array | ArrayBuffer | null;
}): DetectedTabularFormat {
  return detectTabularFileType({
    filename: input.fileName,
    bytes: input.bytes,
  }).format;
}

/** Headers/values that indicate binary workbook residue leaked into tabular data. */
export function containsBinaryWorkbookResidue(
  values: Iterable<string>,
): boolean {
  for (const value of values) {
    if (
      /Aptos Narrow|Calibri|Root Entry|Microsoft Macintosh Excel|Worksheet|Workbook/i.test(
        value,
      )
    ) {
      return true;
    }
    if (/[\u0000-\u0008\u000E-\u001F]/.test(value)) return true;
  }
  return false;
}
