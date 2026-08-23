/**
 * Phase 57C — Native Excel / XLS ingestion repair.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import * as XLSX from "xlsx";
import { beforeEach, describe, expect, it } from "vitest";
import { COUNCIL_AGENT_IDS } from "@/agents";
import {
  clearAuditStore,
  clearLineageStore,
  clearMappingStore,
  clearSnapshotStore,
  createExcelConnector,
  createCsvConnector,
  detectTabularFileType,
  ingest,
  inferMappingFromHeaders,
  invalidateSnapshot,
  isSnapshotValidForIntelligence,
  looksLikeBinaryMisdecodedAsText,
  parseExcelWorkbook,
  parseTabularText,
  storeSnapshot,
  snapshotLooksLikeCorruptBinaryParse,
  containsBinaryWorkbookResidue,
} from "@/data-gateway";
import {
  buildMappingPreview,
  clearStudioStores,
  createStudioSnapshot,
  detectBusinessProfile,
  scoreExecutiveReadiness,
} from "@/executive-snapshot-studio";
import {
  createExecutiveSnapshotAction,
  parseUploadedWorkbookAction,
  runStudioIntelligenceAction,
} from "@/executive-snapshot-studio/server/actions";

const XLS_FIXTURE = resolve(
  process.cwd(),
  "fixtures/validation/report1786533305012.xls",
);
const CSV_FIXTURE = resolve(
  process.cwd(),
  "fixtures/validation/salesforce-opportunity-export.csv",
);

const EXPECTED_HEADERS = [
  "Opportunity Name",
  "Opportunity Owner",
  "Product Family",
  "Stage",
  "Transaction Type",
  "Last Stage Change Date",
  "Stage Duration",
  "Next Step",
  "Industry",
  "Close Date",
];

function buildXlsxBytes(rows: unknown[][]): Uint8Array {
  const sheet = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, sheet, "Sheet1");
  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
  return new Uint8Array(buf);
}

function buildMultiSheetXlsx(): Uint8Array {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet([
      ["Ignore", "Me"],
      ["x", "y"],
    ]),
    "Meta",
  );
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet([
      ["Opportunity Name", "Stage", "Close Date"],
      ["Deal A", "Prospecting", "2026-03-01"],
      ["Deal B", "Closed Won", "2026-01-15"],
    ]),
    "Opportunities",
  );
  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
  return new Uint8Array(buf);
}

describe("Phase 57C native Excel / XLS ingestion", () => {
  beforeEach(() => {
    clearStudioStores();
    clearSnapshotStore();
    clearMappingStore();
    clearLineageStore();
    clearAuditStore();
  });

  it("parses a valid .xls workbook structurally", () => {
    const bytes = new Uint8Array(readFileSync(XLS_FIXTURE));
    const detection = detectTabularFileType({
      filename: "report1786533305012.xls",
      bytes,
    });
    expect(detection.format).toBe("xls");
    expect(detection.sourceKind).toBe("excel");

    const parsed = parseExcelWorkbook({
      bytes,
      filename: "report1786533305012.xls",
    });
    expect(parsed.ok).toBe(true);
    expect(parsed.format).toBe("xls");
    expect(parsed.records.length).toBeGreaterThan(0);
  });

  it("parses a valid .xlsx workbook", () => {
    const bytes = buildXlsxBytes([
      ["Opportunity Name", "Stage", "Amount"],
      ["Alpha", "Discovery", 1000],
      ["Beta", "Closed Won", 2500],
    ]);
    const parsed = parseExcelWorkbook({
      bytes,
      filename: "sample.xlsx",
    });
    expect(parsed.ok).toBe(true);
    expect(parsed.format).toBe("xlsx");
    expect(parsed.headers).toEqual([
      "Opportunity Name",
      "Stage",
      "Amount",
    ]);
    expect(parsed.records).toHaveLength(2);
    expect(parsed.records[0]?.fields["Opportunity Name"]).toBe("Alpha");
  });

  it("parses CSV via the text path only", () => {
    const csv = readFileSync(CSV_FIXTURE, "utf8");
    expect(looksLikeBinaryMisdecodedAsText(csv)).toBe(false);
    const parsed = parseTabularText(csv);
    expect(parsed.records.length).toBe(476);
    const csvConnector = createCsvConnector().parse({ tabularText: csv });
    expect(csvConnector.ok).toBe(true);
    expect(csvConnector.records.length).toBe(476);
  });

  it("rejects invalid / corrupt XLS bytes with an executive-facing error", () => {
    const junk = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
    const parsed = parseExcelWorkbook({
      bytes: junk,
      filename: "broken.xls",
    });
    expect(parsed.ok).toBe(false);
    expect(parsed.errors[0]).toMatch(/could not (identify|read)/i);
    expect(parsed.errors.join(" ")).not.toMatch(/ENOENT|node:|stack/i);
  });

  it("preserves dates and numeric values from XLSX", () => {
    const bytes = buildXlsxBytes([
      ["Opportunity Name", "Close Date", "SaaS value"],
      ["Dated Deal", new Date("2026-06-15T00:00:00Z"), 12500.5],
    ]);
    const parsed = parseExcelWorkbook({ bytes, filename: "dates.xlsx" });
    expect(parsed.ok).toBe(true);
    const row = parsed.records[0]!;
    expect(row.fields["SaaS value"]).toBe(12500.5);
    expect(String(row.fields["Close Date"])).toMatch(/2026-06-15/);
  });

  it("preserves blank cells as null", () => {
    const bytes = buildXlsxBytes([
      ["Opportunity Name", "Next Step", "Industry"],
      ["Blankish", null, "Mining"],
      ["Also", "", ""],
    ]);
    const parsed = parseExcelWorkbook({ bytes, filename: "blanks.xlsx" });
    expect(parsed.ok).toBe(true);
    expect(parsed.records[0]?.fields["Next Step"]).toBeNull();
  });

  it("selects a meaningful sheet from multi-worksheet workbooks", () => {
    const bytes = buildMultiSheetXlsx();
    const parsed = parseExcelWorkbook({
      bytes,
      filename: "multi.xlsx",
    });
    expect(parsed.ok).toBe(true);
    expect(parsed.sheetNames.length).toBe(2);
    expect(parsed.sheetName).toBe("Opportunities");
    expect(parsed.headers).toContain("Opportunity Name");
    expect(parsed.records).toHaveLength(2);
  });

  it("parses the Salesforce .xls fixture with ~476 opportunities and real headers", () => {
    const bytes = new Uint8Array(readFileSync(XLS_FIXTURE));
    const parsed = parseExcelWorkbook({
      bytes,
      filename: "report1786533305012.xls",
    });
    expect(parsed.ok).toBe(true);
    expect(parsed.records.length).toBe(476);
    for (const header of EXPECTED_HEADERS) {
      expect(parsed.headers).toContain(header);
    }
    expect(containsBinaryWorkbookResidue(parsed.headers)).toBe(false);
    expect(parsed.headers.join(" ")).not.toMatch(/Aptos Narrow/i);
  });

  it("does not surface binary workbook content in mapped fields", () => {
    const bytes = new Uint8Array(readFileSync(XLS_FIXTURE));
    const parsed = parseExcelWorkbook({
      bytes,
      filename: "report1786533305012.xls",
    });
    const mapping = inferMappingFromHeaders(parsed.headers, {
      organisationId: "org_sf",
      profileId: "commercial",
      productId: "executiveos",
      name: "SF mapping",
    });
    const sources = mapping.fields.map((f) => f.sourceColumn);
    expect(containsBinaryWorkbookResidue(sources)).toBe(false);
    expect(sources).toContain("Opportunity Name");
    expect(sources).toContain("Opportunity Owner");
    expect(sources.join(" ")).not.toMatch(/Aptos|Root Entry|Workbook/i);
  });

  it("detects Commercial Executive Intelligence for the Salesforce workbook", () => {
    const bytes = new Uint8Array(readFileSync(XLS_FIXTURE));
    const parsed = parseExcelWorkbook({
      bytes,
      filename: "report1786533305012.xls",
    });
    const detection = detectBusinessProfile({ headers: parsed.headers });
    expect(detection.profileId).toBe("commercial");
    expect(detection.label).toMatch(/Commercial/i);
    expect(detection.confidence).toBeGreaterThanOrEqual(70);
  });

  it("flat commercial datasets do not produce false relationship failure", () => {
    const bytes = new Uint8Array(readFileSync(XLS_FIXTURE));
    const parsed = parseExcelWorkbook({
      bytes,
      filename: "report1786533305012.xls",
    });
    const mapping = inferMappingFromHeaders(parsed.headers, {
      organisationId: "org_sf",
      profileId: "commercial",
      productId: "executiveos",
    });
    const preview = buildMappingPreview(mapping, true);
    expect(preview.hierarchy.join(" ")).toMatch(/Flat commercial opportunity/i);
    expect(preview.relationships.some((r) => r.includes("→"))).toBe(true);

    const bundle = createStudioSnapshot({
      organisationId: "org_sf",
      profileId: "commercial",
      productId: "executiveos",
      sourceKind: "excel",
      binaryBase64: Buffer.from(bytes).toString("base64"),
      filename: "report1786533305012.xls",
      mapping,
    });
    expect(bundle.ingestion.ok).toBe(true);
    expect(bundle.readiness?.relationshipIntegrity).toBeGreaterThanOrEqual(70);
    expect(bundle.readiness?.judgementReadiness.narrative.join(" ")).toMatch(
      /Flat commercial opportunity dataset detected/i,
    );
  });

  it("refuses binary-as-text so a valid Executive Snapshot cannot be created", () => {
    const bytes = readFileSync(XLS_FIXTURE);
    const misdecoded = bytes.toString("utf8");
    expect(looksLikeBinaryMisdecodedAsText(misdecoded)).toBe(true);

    const result = ingest({
      organisationId: "org_bad",
      profileId: "commercial",
      productId: "executiveos",
      sourceKind: "excel",
      connectorId: "udg-excel",
      mode: "upload",
      tabularText: misdecoded,
      filename: "report1786533305012.xls",
    });
    expect(result.ok).toBe(false);
    expect(result.snapshot).toBeUndefined();
    expect(result.errors[0]).toMatch(/legacy XLS|could not read/i);
  });

  it("server workbook parse action returns Salesforce headers without binary residue", async () => {
    const bytes = readFileSync(XLS_FIXTURE);
    const result = await parseUploadedWorkbookAction({
      filename: "report1786533305012.xls",
      binaryBase64: bytes.toString("base64"),
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.recordCount).toBe(476);
    expect(result.headers).toContain("Opportunity Name");
    expect(result.headers.join(" ")).not.toMatch(/Aptos Narrow/i);
  });

  it("corrected snapshot can proceed to the existing intelligence pipeline", async () => {
    const bytes = readFileSync(XLS_FIXTURE);
    const mapping = inferMappingFromHeaders(
      [
        "Opportunity Name",
        "Opportunity Owner",
        "Product Family",
        "Stage",
        "Transaction Type",
        "Net SaaS (converted)",
        "Net Maintenance (converted)",
        "Net Software License (converted)",
        "Net One Time Services (converted)",
        "Net Recurring Services (converted)",
        "Last Stage Change Date",
        "Stage Duration",
        "Next Step",
        "Industry",
        "Close Date",
      ],
      {
        organisationId: "org_sf",
        profileId: "commercial",
        productId: "executiveos",
      },
    );

    const created = await createExecutiveSnapshotAction({
      organisationId: "org_sf",
      organisationName: "Salesforce Validation Co",
      profileId: "commercial",
      productId: "executiveos",
      sourceKind: "excel",
      filename: "report1786533305012.xls",
      binaryBase64: bytes.toString("base64"),
      selectedProfileId: "commercial",
      mapping,
    });

    expect(created.success).toBe(true);
    expect(created.snapshot?.meta.recordCount).toBe(476);
    expect(created.readiness?.relationshipIntegrity).toBeGreaterThanOrEqual(70);
    expect(created.mappingPreview?.hierarchy.join(" ")).toMatch(
      /Flat commercial/i,
    );

    const intel = await runStudioIntelligenceAction({
      organisationName: "Salesforce Validation Co",
      selectedProfileId: "commercial",
      snapshot: created.snapshot!,
      readiness: created.readiness!,
    });
    expect(intel.success).toBe(true);
    expect(intel.brief?.summary).toBeTruthy();
    expect(intel.council?.seats).toEqual(
      expect.arrayContaining(["CEO", "CFO", "COO", "CRO", "CSO"]),
    );
    expect(intel.council?.seats).toHaveLength(5);
  });

  it("invalidates corrupt snapshots so they cannot become intelligence SoT", () => {
    const corrupt = {
      meta: {
        snapshotId: "snap_corrupt_xls",
        version: 1,
        createdAt: new Date().toISOString(),
        organisationId: "org_bad",
        profileId: "commercial",
        productId: "executiveos",
        sourceKind: "excel" as const,
        connectorId: "udg-excel",
        recordCount: 9166,
        validationStatus: "passed" as const,
        confidence: {
          overall: 40,
          coverage: 40,
          quality: 40,
          freshness: 40,
          consistency: 40,
          completeness: 40,
          scoredAt: new Date().toISOString(),
        },
      },
      records: [
        {
          recordId: "r1",
          rowIndex: 1,
          fields: { "Aptos Narrow": "Root Entry", font: "Microsoft Macintosh Excel" },
        },
      ],
      contentHash: "bad",
      immutable: true as const,
    };
    storeSnapshot(corrupt as never);
    expect(snapshotLooksLikeCorruptBinaryParse(corrupt as never)).toBe(true);
    expect(isSnapshotValidForIntelligence(corrupt as never)).toBe(false);
    invalidateSnapshot("snap_corrupt_xls");
    expect(isSnapshotValidForIntelligence(corrupt as never)).toBe(false);
  });

  it("Excel connector prefers binary workbook bytes over text", () => {
    const bytes = readFileSync(XLS_FIXTURE);
    const excel = createExcelConnector();
    const result = excel.parse({
      binaryBase64: bytes.toString("base64"),
      filename: "report1786533305012.xls",
    });
    expect(result.ok).toBe(true);
    expect(result.records.length).toBe(476);
  });

  it("Phase 57A council integrity remains CEO · CFO · COO · CRO · CSO", () => {
    expect(COUNCIL_AGENT_IDS).toEqual([
      "ceo",
      "cfo",
      "coo",
      "cro",
      "cso",
    ]);
  });

  it("scoreExecutiveReadiness treats flat commercial as dataset limitation", () => {
    const readiness = scoreExecutiveReadiness({
      confidence: {
        overall: 90,
        coverage: 90,
        quality: 92,
        freshness: 95,
        consistency: 90,
        completeness: 90,
        scoredAt: new Date().toISOString(),
      },
      validation: {
        status: "passed",
        issues: [
          {
            code: "hierarchy",
            severity: "warning",
            message: "No region hierarchy",
          },
        ],
        errorCount: 0,
        warningCount: 1,
        checkedAt: new Date().toISOString(),
      },
      datasetShape: "flat_commercial",
    });
    expect(readiness.relationshipIntegrity).toBeGreaterThanOrEqual(90);
    expect(readiness.judgementReadiness.narrative.join(" ")).toMatch(
      /Organisational hierarchy is not present/i,
    );
  });
});
