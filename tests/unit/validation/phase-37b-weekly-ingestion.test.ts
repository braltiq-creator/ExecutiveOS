/**
 * Phase 37B — Durable weekly ingestion integration
 * @vitest-environment node
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { UdgMappingDefinition } from "@/data-gateway/contracts/mapping";
import { clearMappingStore } from "@/data-gateway/mapping/store";
import {
  clearPilotPersistenceMemory,
  getPilotPersistence,
  setPilotPersistenceOverride,
} from "@/pilot-persistence";
import {
  finalizeStudioWeeklyIngestionAction,
  findDataSourceByName,
  getDataSource,
  getSnapshotSummary,
  listMemoryConnections,
  listMemoryEvidence,
  logicalDataSourceNameForProfile,
  persistStudioWeeklyMappingAction,
  resetDataSourceMemory,
  resetVerifiedEvidenceMemory,
  resolveMappingForSource,
  resolveStudioWeeklySourceAction,
} from "@/verified-evidence";

const ORG = "eeeeeeee-ffff-aaaa-bbbb-cccccccccccc";

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

function sampleMapping(orgId: string, name = "Commercial Pipeline"): UdgMappingDefinition {
  const now = new Date().toISOString();
  return {
    id: `map-${orgId}-commercial`,
    name,
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

vi.mock("@/executive-snapshot-studio/server/auth", () => ({
  requireStudioActor: vi.fn(async (requested?: string | null) => ({
    ok: true as const,
    userId: "user-37b",
    organisationId: requested?.trim() || ORG,
  })),
  requireStudioSession: vi.fn(async () => ({
    ok: true as const,
    userId: "user-37b",
    organisationId: ORG,
  })),
}));

describe("Phase 37B — durable weekly ingestion", () => {
  beforeEach(() => {
    resetVerifiedEvidenceMemory();
    resetDataSourceMemory();
    clearMappingStore();
    clearPilotPersistenceMemory();
    setPilotPersistenceOverride(null);
    vi.stubEnv("NODE_ENV", "test");
  });

  afterEach(() => {
    resetVerifiedEvidenceMemory();
    resetDataSourceMemory();
    clearMappingStore();
    clearPilotPersistenceMemory();
    setPilotPersistenceOverride(null);
    vi.unstubAllEnvs();
  });

  it("uses a stable logical source name (not filename)", () => {
    expect(logicalDataSourceNameForProfile("commercial")).toBe(
      "Commercial Pipeline",
    );
    expect(logicalDataSourceNameForProfile("manufacturing")).toBe(
      "Manufacturing Operations",
    );
  });

  it("1–3 first upload creates one Data Source, USER_UPLOAD connection null, mapping persisted", async () => {
    const resolved = await resolveStudioWeeklySourceAction({
      organisationId: ORG,
      profileId: "commercial",
      headers: HEADERS_V1,
    });
    expect(resolved.ok).toBe(true);
    if (!resolved.ok) return;

    expect(resolved.created).toBe(true);
    expect(resolved.source.ingestionMethod).toBe("USER_UPLOAD");
    expect(resolved.source.connectionId).toBeNull();
    expect(resolved.logicalName).toBe("Commercial Pipeline");
    expect(resolved.requiresSchemaConfirmation).toBe(false);

    const mapping = sampleMapping(ORG);
    const persisted = await persistStudioWeeklyMappingAction({
      organisationId: ORG,
      dataSourceId: resolved.source.id,
      mapping,
      headers: HEADERS_V1,
    });
    expect(persisted.ok).toBe(true);
    if (!persisted.ok) return;
    expect(persisted.source.mapping?.id).toBe(mapping.id);
    expect(persisted.source.schemaFingerprint).toContain("schema:");
    expect(persisted.source.connectionId).toBeNull();

    const again = findDataSourceByName(ORG, "Commercial Pipeline");
    expect(again?.id).toBe(resolved.source.id);
    expect(listMemoryConnections(ORG).every((c) => c.connectionStatus === "not_connected")).toBe(
      true,
    );
  });

  it("4–6 second upload same source reuses mapping without remapping confirmation", async () => {
    const first = await resolveStudioWeeklySourceAction({
      organisationId: ORG,
      profileId: "commercial",
      headers: HEADERS_V1,
    });
    if (!first.ok) throw new Error("resolve failed");
    await persistStudioWeeklyMappingAction({
      organisationId: ORG,
      dataSourceId: first.source.id,
      mapping: sampleMapping(ORG),
      headers: HEADERS_V1,
    });

    const second = await resolveStudioWeeklySourceAction({
      organisationId: ORG,
      profileId: "commercial",
      headers: HEADERS_V1,
    });
    expect(second.ok).toBe(true);
    if (!second.ok) return;
    expect(second.created).toBe(false);
    expect(second.source.id).toBe(first.source.id);
    expect(second.mappingReused).toBe(true);
    expect(second.requiresSchemaConfirmation).toBe(false);
    expect(second.schema.changed).toBe(false);

    const pure = resolveMappingForSource(second.source, HEADERS_V1);
    expect(pure.reuse).toBe(true);
  });

  it("7–9 schema change detected, requires confirmation, then updates mapping", async () => {
    const first = await resolveStudioWeeklySourceAction({
      organisationId: ORG,
      profileId: "commercial",
      headers: HEADERS_V1,
    });
    if (!first.ok) throw new Error("resolve failed");
    await persistStudioWeeklyMappingAction({
      organisationId: ORG,
      dataSourceId: first.source.id,
      mapping: sampleMapping(ORG),
      headers: HEADERS_V1,
    });

    const drifted = await resolveStudioWeeklySourceAction({
      organisationId: ORG,
      profileId: "commercial",
      headers: HEADERS_V2,
    });
    expect(drifted.ok).toBe(true);
    if (!drifted.ok) return;
    expect(drifted.requiresSchemaConfirmation).toBe(true);
    expect(drifted.schema.addedColumns.length).toBeGreaterThan(0);

    const blocked = await persistStudioWeeklyMappingAction({
      organisationId: ORG,
      dataSourceId: first.source.id,
      mapping: sampleMapping(ORG),
      headers: HEADERS_V2,
      confirmSchemaChange: false,
    });
    expect(blocked.ok).toBe(false);

    const updatedMapping = {
      ...sampleMapping(ORG),
      fields: [
        ...sampleMapping(ORG).fields,
        { sourceColumn: "Owner", canonicalField: "owner" as const },
      ],
    };
    const confirmed = await persistStudioWeeklyMappingAction({
      organisationId: ORG,
      dataSourceId: first.source.id,
      mapping: updatedMapping,
      headers: HEADERS_V2,
      confirmSchemaChange: true,
    });
    expect(confirmed.ok).toBe(true);
    if (!confirmed.ok) return;
    expect(confirmed.source.mapping?.fields.some((f) => f.sourceColumn === "Owner")).toBe(
      true,
    );
  });

  it("10–15 lineage, USER_PROVIDED evidence, compare, no SYNTHETIC", async () => {
    const resolved = await resolveStudioWeeklySourceAction({
      organisationId: ORG,
      profileId: "commercial",
      headers: HEADERS_V1,
    });
    if (!resolved.ok) throw new Error("resolve failed");
    const mapping = sampleMapping(ORG);
    await persistStudioWeeklyMappingAction({
      organisationId: ORG,
      dataSourceId: resolved.source.id,
      mapping,
      headers: HEADERS_V1,
    });

    const pilot = getPilotPersistence();
    await pilot.saveSnapshot({
      snapshotId: "snap-37b-1",
      organisationId: ORG,
      profileId: "commercial",
      recordCount: 100,
      context: {
        kind: "executive_snapshot",
        studioId: "studio-1",
        snapshotId: "snap-37b-1",
        organisationId: ORG,
        organisationName: "Test",
        profileId: "commercial",
        profileLabel: "Commercial",
        recordCount: 100,
        confidenceOverall: 80,
        readiness: {
          dataQuality: 80,
          coverage: 80,
          freshness: 80,
          confidence: 80,
          relationshipIntegrity: 80,
          evidenceCoverage: 80,
          commercialDatasetReadiness: 80,
          executiveReadiness: 80,
          judgementReadiness: {
            forecastOpportunityEvidence: "sufficient",
            activityBasedJudgement: "sufficient",
            concentrationJudgement: "sufficient",
            narrative: [],
          },
          recommendations: [],
          scoredAt: new Date().toISOString(),
        },
        portfolio: {
          intent: {
            id: "i",
            statement: "s",
            horizon: "near",
            successCriteria: [],
          },
          outcomes: [],
          decisions: [],
          actions: [],
          health: 80,
          narrative: "n",
        },
        activatedAt: new Date().toISOString(),
        demoIsolation: true,
      } as never,
      createdAt: new Date().toISOString(),
    });

    const firstFinal = await finalizeStudioWeeklyIngestionAction({
      organisationId: ORG,
      dataSourceId: resolved.source.id,
      snapshotId: "snap-37b-1",
      recordCount: 100,
      headers: HEADERS_V1,
      mapping,
      fileName: "week1.csv",
    });
    expect(firstFinal.ok).toBe(true);
    if (!firstFinal.ok) return;
    expect(firstFinal.lineage.previousSnapshotId).toBeNull();
    expect(firstFinal.lineage.currentSnapshotId).toBe("snap-37b-1");
    expect(getDataSource(resolved.source.id)?.lastSnapshotId).toBe("snap-37b-1");

    const evidence = listMemoryEvidence(ORG);
    expect(evidence).toHaveLength(1);
    expect(evidence[0].provenance).toBe("USER_PROVIDED");
    expect(evidence[0].connectionId).toBeNull();
    expect(evidence[0].dataSourceId).toBe(resolved.source.id);
    expect(evidence.every((e) => e.provenance !== "SYNTHETIC")).toBe(true);

    await pilot.saveSnapshot({
      snapshotId: "snap-37b-2",
      organisationId: ORG,
      profileId: "commercial",
      recordCount: 130,
      context: {
        kind: "executive_snapshot",
        studioId: "studio-2",
        snapshotId: "snap-37b-2",
        organisationId: ORG,
        organisationName: "Test",
        profileId: "commercial",
        profileLabel: "Commercial",
        recordCount: 130,
        confidenceOverall: 80,
        readiness: {
          dataQuality: 80,
          coverage: 80,
          freshness: 80,
          confidence: 80,
          relationshipIntegrity: 80,
          evidenceCoverage: 80,
          commercialDatasetReadiness: 80,
          executiveReadiness: 80,
          judgementReadiness: {
            forecastOpportunityEvidence: "sufficient",
            activityBasedJudgement: "sufficient",
            concentrationJudgement: "sufficient",
            narrative: [],
          },
          recommendations: [],
          scoredAt: new Date().toISOString(),
        },
        portfolio: {
          intent: {
            id: "i",
            statement: "s",
            horizon: "near",
            successCriteria: [],
          },
          outcomes: [],
          decisions: [],
          actions: [],
          health: 80,
          narrative: "n",
        },
        activatedAt: new Date().toISOString(),
        demoIsolation: true,
      } as never,
      createdAt: new Date().toISOString(),
    });

    const secondFinal = await finalizeStudioWeeklyIngestionAction({
      organisationId: ORG,
      dataSourceId: resolved.source.id,
      snapshotId: "snap-37b-2",
      recordCount: 130,
      headers: HEADERS_V1,
      mapping,
      fileName: "week2.csv",
    });
    expect(secondFinal.ok).toBe(true);
    if (!secondFinal.ok) return;
    expect(secondFinal.lineage.previousSnapshotId).toBe("snap-37b-1");
    expect(secondFinal.lineage.currentSnapshotId).toBe("snap-37b-2");
    expect(secondFinal.compare.volumeDelta).toBe(30);
    expect(getSnapshotSummary("snap-37b-1")?.recordCount).toBe(100);

    // Pilot immutability: first snapshot unchanged
    const snap1 = await pilot.getSnapshot(ORG, "snap-37b-1");
    expect(snap1?.recordCount).toBe(100);
  });

  it("16 organisation scoping rejects cross-org data source access", async () => {
    const resolved = await resolveStudioWeeklySourceAction({
      organisationId: ORG,
      profileId: "commercial",
      headers: HEADERS_V1,
    });
    if (!resolved.ok) throw new Error("resolve failed");

    const other = await persistStudioWeeklyMappingAction({
      organisationId: "ffffffff-0000-1111-2222-333333333333",
      dataSourceId: resolved.source.id,
      mapping: sampleMapping(ORG),
      headers: HEADERS_V1,
    });
    // Actor mock uses requested org — source belongs to ORG, so lookup fails for other org id in memory store
    expect(other.ok).toBe(false);
  });

  it("20 production path strings are free of Reality Lab fixtures in weekly actions module", async () => {
    const { readFileSync } = await import("node:fs");
    const { resolve } = await import("node:path");
    const files = [
      "src/verified-evidence/data-sources/actions.ts",
      "src/verified-evidence/data-sources/supabase-store.ts",
      "src/verified-evidence/data-sources/logical-source.ts",
      "src/executive-snapshot-studio/wizard/SnapshotStudio.tsx",
    ];
    for (const f of files) {
      const text = readFileSync(resolve(process.cwd(), f), "utf8");
      expect(text).not.toMatch(/tenant-northline|Northline Operations|Acme Facilities|Sarah Jones/);
      expect(text).not.toMatch(/fake Microsoft|fake Simpro|Reality Lab/);
    }
  });
});
