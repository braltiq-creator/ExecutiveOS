/**
 * Phase 37C — Data & Sources recurring upload experience
 * @vitest-environment node
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  PRIMARY_NAV,
  isPrimaryNavActive,
} from "@/lib/navigation/primary-nav";
import { clearMappingStore } from "@/data-gateway/mapping/store";
import {
  createDataSource,
  dataSourceStatusDisplay,
  listOrganizationDataSourcesAction,
  logicalDataSourceNameForProfile,
  persistStudioWeeklyMappingAction,
  resetDataSourceMemory,
  resetVerifiedEvidenceMemory,
  resolveStudioWeeklySourceAction,
} from "@/verified-evidence";
import type { UdgMappingDefinition } from "@/data-gateway/contracts/mapping";

const ORG = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";

vi.mock("@/executive-snapshot-studio/server/auth", () => ({
  requireStudioActor: vi.fn(async (requested?: string | null) => ({
    ok: true as const,
    userId: "user-37c",
    organisationId: requested?.trim() || ORG,
  })),
  requireStudioSession: vi.fn(async () => ({
    ok: true as const,
    userId: "user-37c",
    organisationId: ORG,
  })),
}));

function sampleMapping(): UdgMappingDefinition {
  const now = new Date().toISOString();
  return {
    id: "map-37c",
    name: "Commercial Pipeline",
    organisationId: ORG,
    sourceKind: "USER_UPLOAD",
    fields: [
      { sourceColumn: "Opportunity Name", canonicalField: "name" },
      { sourceColumn: "Amount", canonicalField: "amount" },
    ],
    createdAt: now,
    updatedAt: now,
    version: 1,
  };
}

const HEADERS = ["Opportunity Name", "Amount"];

describe("Phase 37C — Data & Sources", () => {
  beforeEach(() => {
    resetVerifiedEvidenceMemory();
    resetDataSourceMemory();
    clearMappingStore();
    vi.stubEnv("NODE_ENV", "test");
  });

  afterEach(() => {
    resetVerifiedEvidenceMemory();
    resetDataSourceMemory();
    clearMappingStore();
    vi.unstubAllEnvs();
  });

  it("adds Data & Sources to primary navigation before Administration", () => {
    expect(PRIMARY_NAV.map((i) => i.label)).toEqual([
      "Today",
      "Strategy",
      "Decisions",
      "Knowledge",
      "Reports",
      "Data & Sources",
      "Administration",
    ]);
    expect(PRIMARY_NAV.find((i) => i.id === "data")?.href).toBe("/data");
    expect(isPrimaryNavActive("/data", "/data")).toBe(true);
    expect(isPrimaryNavActive("/data/upload", "/data")).toBe(true);
  });

  it("lists durable data sources for the authenticated organisation", async () => {
    createDataSource({
      organizationId: ORG,
      name: logicalDataSourceNameForProfile("commercial"),
      expectedCadence: "WEEKLY",
    });
    createDataSource({
      organizationId: ORG,
      name: logicalDataSourceNameForProfile("manufacturing"),
      expectedCadence: "WEEKLY",
    });
    createDataSource({
      organizationId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
      name: "Other Org Pipeline",
    });

    const listed = await listOrganizationDataSourcesAction({
      organisationId: ORG,
    });
    expect(listed.ok).toBe(true);
    if (!listed.ok) return;
    expect(listed.sources).toHaveLength(2);
    expect(listed.sources.map((s) => s.name).sort()).toEqual([
      "Commercial Pipeline",
      "Manufacturing Operations",
    ]);
  });

  it("status display uses freshness without inventing timestamps", () => {
    const empty = createDataSource({
      organizationId: ORG,
      name: "Empty Source",
      expectedCadence: "WEEKLY",
    });
    expect(dataSourceStatusDisplay(empty)).toBe("awaiting_first_upload");

    const current = createDataSource({
      organizationId: ORG,
      name: "Fresh Source",
      expectedCadence: "WEEKLY",
    });
    // simulate receive via mutate through resolve+persist path
    const withReceive = {
      ...current,
      lastReceivedAt: new Date().toISOString(),
      lastSnapshotId: "snap-1",
    };
    expect(dataSourceStatusDisplay(withReceive)).toBe("current");

    const overdue = {
      ...current,
      lastReceivedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      lastSnapshotId: "snap-old",
    };
    expect(dataSourceStatusDisplay(overdue)).toBe("update_due");
  });

  it("recurring upload pins the same logical Data Source regardless of filename", async () => {
    const created = createDataSource({
      organizationId: ORG,
      name: "Commercial Pipeline",
      expectedCadence: "WEEKLY",
    });
    await persistStudioWeeklyMappingAction({
      organisationId: ORG,
      dataSourceId: created.id,
      mapping: sampleMapping(),
      headers: HEADERS,
    });

    const week1 = await resolveStudioWeeklySourceAction({
      organisationId: ORG,
      profileId: "commercial",
      headers: HEADERS,
      dataSourceId: created.id,
    });
    const week2 = await resolveStudioWeeklySourceAction({
      organisationId: ORG,
      profileId: "commercial",
      headers: HEADERS,
      dataSourceId: created.id,
    });
    expect(week1.ok && week2.ok).toBe(true);
    if (!week1.ok || !week2.ok) return;
    expect(week1.source.id).toBe(created.id);
    expect(week2.source.id).toBe(created.id);
    expect(week2.created).toBe(false);
    expect(week2.mappingReused).toBe(true);
    expect(week2.requiresSchemaConfirmation).toBe(false);
  });

  it("schema drift still requires confirmation on recurring upload", async () => {
    const created = createDataSource({
      organizationId: ORG,
      name: "Commercial Pipeline",
      expectedCadence: "WEEKLY",
    });
    await persistStudioWeeklyMappingAction({
      organisationId: ORG,
      dataSourceId: created.id,
      mapping: sampleMapping(),
      headers: HEADERS,
    });

    const drifted = await resolveStudioWeeklySourceAction({
      organisationId: ORG,
      profileId: "commercial",
      headers: [...HEADERS, "Owner"],
      dataSourceId: created.id,
    });
    expect(drifted.ok).toBe(true);
    if (!drifted.ok) return;
    expect(drifted.requiresSchemaConfirmation).toBe(true);
  });

  it("Data & Sources page and panel avoid Reality Lab fixtures", () => {
    const files = [
      "src/app/data/page.tsx",
      "src/features/data-sources/DataSourcesPanel.tsx",
      "src/lib/navigation/primary-nav.ts",
    ];
    for (const f of files) {
      const text = readFileSync(resolve(process.cwd(), f), "utf8");
      expect(text).not.toMatch(/tenant-northline|Northline Operations|Acme Facilities/);
      expect(text).not.toMatch(/Reality Lab|MOCK_SESSION/);
    }
  });
});
