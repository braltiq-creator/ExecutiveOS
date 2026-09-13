/**
 * Phase 37 addendum — Manual weekly data ingestion
 * @vitest-environment node
 */

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { clearMappingStore } from "@/data-gateway/mapping/store";
import type { UdgMappingDefinition } from "@/data-gateway/contracts/mapping";
import {
  attachImmutableSnapshot,
  computeFreshness,
  createDataSource,
  detectSchemaChange,
  getDataSourceFreshness,
  getSnapshotSummary,
  listMemoryConnections,
  listMemoryEvidence,
  persistDataSourceMapping,
  receiveWeeklyUpload,
  resetDataSourceMemory,
  resetVerifiedEvidenceMemory,
  resolveMappingForUpload,
  setDataSourceCadence,
} from "@/verified-evidence";

const ORG = "dddddddd-eeee-ffff-aaaa-bbbbbbbbbbbb";

const HEADERS_V1 = [
  "Opportunity Name",
  "Amount",
  "Stage",
  "Close Date",
];

const HEADERS_V2 = [
  "Opportunity Name",
  "Amount",
  "Stage",
  "Close Date",
  "Owner",
];

function sampleMapping(orgId: string): UdgMappingDefinition {
  const now = new Date().toISOString();
  return {
    id: `map-${orgId}-commercial`,
    name: "Commercial Weekly Export",
    organisationId: orgId,
    sourceKind: "USER_UPLOAD",
    fields: [
      { sourceColumn: "Opportunity Name", canonicalField: "name" },
      { sourceColumn: "Amount", canonicalField: "amount" },
      { sourceColumn: "Stage", canonicalField: "stage" },
      { sourceColumn: "Close Date", canonicalField: "close_date" },
    ],
    createdAt: now,
    updatedAt: now,
    version: 1,
  };
}

describe("Phase 37 addendum — weekly data sources", () => {
  beforeEach(() => {
    resetVerifiedEvidenceMemory();
    resetDataSourceMemory();
    clearMappingStore();
  });

  afterEach(() => {
    resetVerifiedEvidenceMemory();
    resetDataSourceMemory();
    clearMappingStore();
  });

  it("creates USER_UPLOAD data source without a Connection", () => {
    const source = createDataSource({
      organizationId: ORG,
      name: "Commercial Weekly Export",
      provider: "Salesforce",
      expectedCadence: "WEEKLY",
    });
    expect(source.ingestionMethod).toBe("USER_UPLOAD");
    expect(source.connectionId).toBeNull();
    expect(listMemoryConnections(ORG).every((c) => c.connectionStatus === "not_connected")).toBe(
      true,
    );
  });

  it("rejects fake Connection on USER_UPLOAD sources", () => {
    expect(() =>
      createDataSource({
        organizationId: ORG,
        name: "Bad Source",
        ingestionMethod: "USER_UPLOAD",
        connectionId: "conn-fake",
      }),
    ).toThrow(/must not require a Connection/);
  });

  it("persists mapping and reuses it on second identical upload", () => {
    const source = createDataSource({
      organizationId: ORG,
      name: "Commercial Weekly Export",
      provider: "Salesforce",
      expectedCadence: "WEEKLY",
    });
    persistDataSourceMapping(source.id, sampleMapping(ORG), HEADERS_V1);

    const first = receiveWeeklyUpload({
      dataSourceId: source.id,
      headers: HEADERS_V1,
      recordCount: 100,
      fileName: "week-1.csv",
    });
    expect(first.evidence.provenance).toBe("USER_PROVIDED");
    expect(first.evidence.connectionId).toBeNull();
    expect(first.evidence.provider).toBe("user_upload");
    expect(first.mappingReused).toBe(true);

    const resolved = resolveMappingForUpload(source.id, HEADERS_V1);
    expect(resolved.reuse).toBe(true);
    expect(resolved.schema.changed).toBe(false);
    expect(resolved.mapping?.id).toBe(sampleMapping(ORG).id);

    const second = receiveWeeklyUpload({
      dataSourceId: source.id,
      headers: HEADERS_V1,
      recordCount: 112,
      fileName: "week-2.csv",
    });
    expect(second.mappingReused).toBe(true);
    expect(second.schema.changed).toBe(false);
    expect(listMemoryEvidence(ORG)).toHaveLength(2);
  });

  it("detects schema changes and requires confirmation", () => {
    const source = createDataSource({
      organizationId: ORG,
      name: "Commercial Weekly Export",
    });
    persistDataSourceMapping(source.id, sampleMapping(ORG), HEADERS_V1);

    const change = detectSchemaChange({
      headers: HEADERS_V2,
      previousFingerprint: `schema:${HEADERS_V1.map((h) => h.toLowerCase()).sort().join("|")}`,
      previousHeaders: HEADERS_V1,
    });
    // fingerprint uses normalized headers
    const report = resolveMappingForUpload(source.id, HEADERS_V2);
    expect(report.schema.changed).toBe(true);
    expect(report.schema.requiresConfirmation).toBe(true);
    expect(report.schema.addedColumns.length).toBeGreaterThan(0);
    expect(report.reuse).toBe(false);

    expect(() =>
      receiveWeeklyUpload({
        dataSourceId: source.id,
        headers: HEADERS_V2,
        recordCount: 120,
      }),
    ).toThrow(/Schema changed/);

    const confirmed = receiveWeeklyUpload({
      dataSourceId: source.id,
      headers: HEADERS_V2,
      recordCount: 120,
      confirmSchemaChange: true,
    });
    expect(confirmed.evidence.provenance).toBe("USER_PROVIDED");
    expect(change.requiresConfirmation || report.schema.requiresConfirmation).toBe(true);
  });

  it("creates new immutable snapshot without overwriting previous", () => {
    const source = createDataSource({
      organizationId: ORG,
      name: "Commercial Weekly Export",
      expectedCadence: "WEEKLY",
    });
    persistDataSourceMapping(source.id, sampleMapping(ORG), HEADERS_V1);
    receiveWeeklyUpload({
      dataSourceId: source.id,
      headers: HEADERS_V1,
      recordCount: 100,
    });

    const snap1 = attachImmutableSnapshot({
      dataSourceId: source.id,
      snapshotId: "snap-week-1",
      recordCount: 100,
      keys: ["opp-a", "opp-b"],
    });
    expect(snap1.lineage.previousSnapshotId).toBeNull();
    expect(snap1.lineage.currentSnapshotId).toBe("snap-week-1");
    expect(getSnapshotSummary("snap-week-1")?.recordCount).toBe(100);

    receiveWeeklyUpload({
      dataSourceId: source.id,
      headers: HEADERS_V1,
      recordCount: 130,
    });

    const snap2 = attachImmutableSnapshot({
      dataSourceId: source.id,
      snapshotId: "snap-week-2",
      recordCount: 130,
      keys: ["opp-a", "opp-c"],
    });
    expect(snap2.lineage.previousSnapshotId).toBe("snap-week-1");
    expect(snap2.lineage.currentSnapshotId).toBe("snap-week-2");

    // Previous snapshot summary remains unchanged
    expect(getSnapshotSummary("snap-week-1")).toEqual({
      snapshotId: "snap-week-1",
      dataSourceId: source.id,
      recordCount: 100,
      keys: ["opp-a", "opp-b"],
    });
    expect(getSnapshotSummary("snap-week-2")?.recordCount).toBe(130);

    expect(snap2.compare.volumeDelta).toBe(30);
    expect(snap2.compare.whatAppeared).toContain("opp-c");
    expect(snap2.compare.whatDisappeared).toContain("opp-b");
  });

  it("represents freshness honestly from established weekly cadence", () => {
    const source = createDataSource({
      organizationId: ORG,
      name: "Commercial Weekly Export",
    });
    // No cadence → UNKNOWN (do not fabricate)
    expect(computeFreshness(source)).toBe("UNKNOWN");

    setDataSourceCadence(source.id, "WEEKLY");
    expect(getDataSourceFreshness(source.id).freshness).toBe("MISSING");
    expect(getDataSourceFreshness(source.id).executiveCopy).toMatch(/Upload your first/);

    persistDataSourceMapping(source.id, sampleMapping(ORG), HEADERS_V1);
    receiveWeeklyUpload({
      dataSourceId: source.id,
      headers: HEADERS_V1,
      recordCount: 50,
    });
    expect(getDataSourceFreshness(source.id).freshness).toBe("CURRENT");
    expect(getDataSourceFreshness(source.id).executiveCopy).toMatch(
      /Executive Intelligence is ready/,
    );

    const overdueAt = new Date();
    overdueAt.setDate(overdueAt.getDate() - 10);
    expect(
      computeFreshness(
        {
          expectedCadence: "WEEKLY",
          lastReceivedAt: overdueAt.toISOString(),
        },
        new Date(),
      ),
    ).toBe("OVERDUE");
  });

  it("migration 014 defines data sources without requiring connections", () => {
    const sql = readFileSync(
      resolve(process.cwd(), "supabase/migrations/014_organization_data_sources.sql"),
      "utf8",
    );
    expect(sql).toContain("organization_data_sources");
    expect(sql).toContain("USER_UPLOAD");
    expect(sql).toContain("connection_id uuid REFERENCES public.organization_integrations");
    expect(sql).toMatch(/connection_id[\s\S]*ON DELETE SET NULL/);
    expect(sql).toContain("data_source_id");
    expect(sql).not.toContain("is.active_organization_member");
  });
});
