/**
 * Weekly finalisation retry: reuse evidence and finish a partial graph.
 * @vitest-environment node
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { UdgMappingDefinition } from "@/data-gateway/contracts/mapping";
import { clearMappingStore } from "@/data-gateway/mapping/store";
import { resolveBoundEvidenceId } from "@/manufacturing-evidence-graph/binding";
import {
  armManufacturingGraphWriteFaultForTests,
  clearManufacturingEvidenceGraphMemory,
} from "@/manufacturing-evidence-graph/memory-store";
import {
  listManufacturingGraphEntities,
  listManufacturingGraphRelationships,
  materializeManufacturingEvidenceGraph,
  saveManufacturingFactGrain,
} from "@/manufacturing-evidence-graph/store";
import {
  clearPilotPersistenceMemory,
  getPilotPersistence,
} from "@/pilot-persistence";
import { recordMemoryEvidence } from "@/verified-evidence/memory-store";
import {
  attachImmutableSnapshot,
  createDataSource,
  finalizeStudioWeeklyIngestionAction,
  getDataSource,
  listMemoryEvidence,
  persistDataSourceMapping,
  persistStudioWeeklyMappingAction,
  receiveWeeklyUpload,
  resetDataSourceMemory,
  resetVerifiedEvidenceMemory,
  resolveStudioWeeklySourceAction,
} from "@/verified-evidence";
import { assertReusableWeeklyEvidence } from "@/verified-evidence/data-sources/evidence-identity";
import type { OrganizationEvidence } from "@/verified-evidence/types";

const ORG = "11111111-1111-4111-8111-111111111111";
const OTHER_ORG = "22222222-2222-4222-8222-222222222222";
const HEADERS = ["Model", "Region", "Actual"];

function mapping(): UdgMappingDefinition {
  const now = new Date().toISOString();
  return {
    id: `map-${ORG}-manufacturing`,
    name: "Manufacturing Operations",
    organisationId: ORG,
    sourceKind: "USER_UPLOAD",
    fields: [
      { sourceColumn: "Model", canonicalField: "model" },
      { sourceColumn: "Region", canonicalField: "region" },
      { sourceColumn: "Actual", canonicalField: "actualQuantity" },
    ],
    createdAt: now,
    updatedAt: now,
    version: 1,
  };
}

function pilotContext(snapshotId: string) {
  return {
    snapshotId,
    profileId: "manufacturing",
    portfolio: {
      intent: { id: "i", statement: "s", horizon: "near", successCriteria: [] },
      outcomes: [],
      decisions: [],
      actions: [],
      health: 80,
      narrative: "n",
    },
  } as never;
}

function evidence(overrides: Partial<OrganizationEvidence>): OrganizationEvidence {
  return {
    id: "ev-existing",
    organizationId: ORG,
    connectionId: null,
    dataSourceId: "ds-1",
    provider: "user_upload",
    sourceSystem: "Manufacturing Operations",
    sourceObjectType: "workbook_export",
    sourceIdentifier: "weekly-upload:ds-1:snap-a",
    observedAt: "2026-10-01T00:00:00.000Z",
    retrievedAt: "2026-10-01T00:00:00.000Z",
    provenance: "USER_PROVIDED",
    evidenceStatus: "active",
    confidence: 0.85,
    contentPayload: { snapshotId: "snap-a" },
    schemaVersion: "v1",
    createdBy: null,
    createdAt: "2026-10-01T00:00:00.000Z",
    ...overrides,
  };
}

async function prepareSnapshot(snapshotId: string, recordCount: number) {
  const resolved = await resolveStudioWeeklySourceAction({
    organisationId: ORG,
    profileId: "manufacturing",
    headers: HEADERS,
  });
  if (!resolved.ok) throw new Error(resolved.error);
  const saved = await persistStudioWeeklyMappingAction({
    organisationId: ORG,
    dataSourceId: resolved.source.id,
    mapping: mapping(),
    headers: HEADERS,
  });
  if (!saved.ok) throw new Error(saved.error);

  await getPilotPersistence().saveSnapshot({
    snapshotId,
    organisationId: ORG,
    profileId: "manufacturing",
    recordCount,
    context: pilotContext(snapshotId),
    createdAt: "2026-10-01T00:00:00.000Z",
  });
  await saveManufacturingFactGrain({
    organisationId: ORG,
    snapshotId,
    organisationLabel: null,
    records: [
      {
        recordId: `${snapshotId}-row`,
        rowIndex: 1,
        fields: { region: "Queensland", model: "Model H", actualQuantity: 14 },
      },
    ],
  });
  return resolved.source.id;
}

describe("manufacturing finalisation retry", () => {
  beforeEach(() => {
    resetVerifiedEvidenceMemory();
    resetDataSourceMemory();
    clearMappingStore();
    clearPilotPersistenceMemory();
    clearManufacturingEvidenceGraphMemory();
  });

  afterEach(() => {
    resetVerifiedEvidenceMemory();
    resetDataSourceMemory();
    clearMappingStore();
    clearPilotPersistenceMemory();
    clearManufacturingEvidenceGraphMemory();
  });

  it("reuses one evidence row when graph materialisation fails and is retried", async () => {
    const dataSourceId = await prepareSnapshot("snap-retry-a", 4);
    armManufacturingGraphWriteFaultForTests("after-entities");

    const failed = await finalizeStudioWeeklyIngestionAction({
      organisationId: ORG,
      dataSourceId,
      snapshotId: "snap-retry-a",
      recordCount: 4,
      headers: HEADERS,
      mapping: mapping(),
      fileName: "week-a.csv",
    });
    expect(failed.ok).toBe(false);
    const firstEvidence = listMemoryEvidence(ORG);
    expect(firstEvidence).toHaveLength(1);
    expect(firstEvidence[0]?.provenance).toBe("USER_PROVIDED");
    expect(firstEvidence[0]?.sourceIdentifier).toBe(
      `weekly-upload:${dataSourceId}:snap-retry-a`,
    );
    const entitiesAfterFailure = await listManufacturingGraphEntities(
      ORG,
      "snap-retry-a",
    );
    expect(entitiesAfterFailure.length).toBeGreaterThan(0);
    expect(
      await listManufacturingGraphRelationships(ORG, "snap-retry-a"),
    ).toHaveLength(0);

    const retried = await finalizeStudioWeeklyIngestionAction({
      organisationId: ORG,
      dataSourceId,
      snapshotId: "snap-retry-a",
      recordCount: 99,
      headers: HEADERS,
      mapping: mapping(),
      fileName: "week-a-retry.csv",
    });
    expect(retried.ok).toBe(true);
    if (!retried.ok) return;
    expect(retried.evidenceId).toBe(firstEvidence[0]?.id);
    expect(retried.lineage.previousSnapshotId).toBeNull();
    expect(retried.lineage.currentSnapshotId).toBe("snap-retry-a");

    const evidenceAfterRetry = listMemoryEvidence(ORG);
    expect(evidenceAfterRetry).toHaveLength(1);
    expect(evidenceAfterRetry[0]?.id).toBe(firstEvidence[0]?.id);
    expect(evidenceAfterRetry[0]?.contentPayload.recordCount).toBe(4);
    expect(evidenceAfterRetry[0]?.contentPayload.fileName).toBeUndefined();

    const entities = await listManufacturingGraphEntities(ORG, "snap-retry-a");
    const relationships = await listManufacturingGraphRelationships(
      ORG,
      "snap-retry-a",
    );
    expect(entities.length).toBe(entitiesAfterFailure.length);
    expect(new Set(entities.map((entity) => entity.id)).size).toBe(entities.length);
    expect(relationships.length).toBeGreaterThan(0);
    expect(entities.every((entity) => entity.evidenceId === retried.evidenceId)).toBe(
      true,
    );
    expect(
      relationships.every((relationship) => relationship.evidenceId === retried.evidenceId),
    ).toBe(true);
    expect(entities.every((entity) => entity.provenance === "USER_PROVIDED")).toBe(true);
    expect(getDataSource(dataSourceId)?.previousSnapshotId).toBeNull();
  });

  it("keeps the previous snapshot when a later snapshot is retried", async () => {
    const dataSourceId = await prepareSnapshot("snap-chain-a", 4);
    const first = await finalizeStudioWeeklyIngestionAction({
      organisationId: ORG,
      dataSourceId,
      snapshotId: "snap-chain-a",
      recordCount: 4,
      headers: HEADERS,
      mapping: mapping(),
    });
    expect(first.ok).toBe(true);

    await getPilotPersistence().saveSnapshot({
      snapshotId: "snap-chain-b",
      organisationId: ORG,
      profileId: "manufacturing",
      recordCount: 9,
      context: pilotContext("snap-chain-b"),
      createdAt: "2026-10-08T00:00:00.000Z",
    });
    await saveManufacturingFactGrain({
      organisationId: ORG,
      snapshotId: "snap-chain-b",
      organisationLabel: null,
      records: [
        {
          recordId: "snap-chain-b-row",
          rowIndex: 1,
          fields: { region: "Victoria", model: "Model K", actualQuantity: 2 },
        },
      ],
    });
    armManufacturingGraphWriteFaultForTests("after-entities");
    const failed = await finalizeStudioWeeklyIngestionAction({
      organisationId: ORG,
      dataSourceId,
      snapshotId: "snap-chain-b",
      recordCount: 9,
      headers: HEADERS,
      mapping: mapping(),
    });
    expect(failed.ok).toBe(false);
    expect(listMemoryEvidence(ORG)).toHaveLength(2);

    const retried = await finalizeStudioWeeklyIngestionAction({
      organisationId: ORG,
      dataSourceId,
      snapshotId: "snap-chain-b",
      recordCount: 9,
      headers: HEADERS,
      mapping: mapping(),
    });
    expect(retried.ok).toBe(true);
    if (!retried.ok) return;
    expect(retried.lineage.previousSnapshotId).toBe("snap-chain-a");
    expect(retried.lineage.currentSnapshotId).toBe("snap-chain-b");
    expect(retried.compare.volumeDelta).toBe(5);
    expect(listMemoryEvidence(ORG)).toHaveLength(2);
    expect(getDataSource(dataSourceId)?.previousSnapshotId).toBe("snap-chain-a");
    expect(getDataSource(dataSourceId)?.lastSnapshotId).toBe("snap-chain-b");

    const snapshotA = await listManufacturingGraphEntities(ORG, "snap-chain-a");
    const snapshotB = await listManufacturingGraphEntities(ORG, "snap-chain-b");
    expect(snapshotA.length).toBeGreaterThan(0);
    expect(snapshotB.length).toBeGreaterThan(0);
    expect(snapshotB.map((entity) => entity.id)).not.toEqual(
      snapshotA.map((entity) => entity.id),
    );
    expect(
      snapshotB.some((entity) => snapshotA.some((other) => other.id === entity.id)),
    ).toBe(false);
    expect(
      (await listManufacturingGraphRelationships(ORG, "snap-chain-b")).every(
        (relationship) => relationship.snapshotId === "snap-chain-b",
      ),
    ).toBe(true);
  });

  it("materialises the same graph on a second run and rejects a different evidence id", async () => {
    await saveManufacturingFactGrain({
      organisationId: ORG,
      snapshotId: "snap-direct",
      organisationLabel: null,
      records: [
        {
          recordId: "rec-1",
          rowIndex: 1,
          fields: {
            region: "Queensland",
            dealer: "Dealer X",
            model: "Model H",
            actualQuantity: 14,
          },
        },
      ],
    });
    const evidenceA = "33333333-3333-4333-8333-333333333333";
    const evidenceB = "44444444-4444-4444-8444-444444444444";
    armManufacturingGraphWriteFaultForTests("after-entities");
    await expect(
      materializeManufacturingEvidenceGraph({
        organisationId: ORG,
        snapshotId: "snap-direct",
        evidenceId: evidenceA,
      }),
    ).rejects.toThrow(/failed before completion/);
    const partial = await listManufacturingGraphEntities(ORG, "snap-direct");
    expect(partial.every((entity) => entity.evidenceId === evidenceA)).toBe(true);

    await expect(
      materializeManufacturingEvidenceGraph({
        organisationId: ORG,
        snapshotId: "snap-direct",
        evidenceId: evidenceB,
      }),
    ).rejects.toThrow(/already bound/);
    expect(await listManufacturingGraphEntities(ORG, "snap-direct")).toEqual(partial);
    expect(await listManufacturingGraphRelationships(ORG, "snap-direct")).toHaveLength(0);
    expect(await listManufacturingGraphEntities(ORG, "snap-other")).toEqual([]);

    const completed = await materializeManufacturingEvidenceGraph({
      organisationId: ORG,
      snapshotId: "snap-direct",
      evidenceId: evidenceA,
    });
    const again = await materializeManufacturingEvidenceGraph({
      organisationId: ORG,
      snapshotId: "snap-direct",
      evidenceId: evidenceA,
    });
    const entities = await listManufacturingGraphEntities(ORG, "snap-direct");
    const relationships = await listManufacturingGraphRelationships(ORG, "snap-direct");
    expect(again).toEqual(completed);
    expect(new Set(entities.map((entity) => entity.id)).size).toBe(entities.length);
    expect(new Set(relationships.map((relationship) => relationship.id)).size).toBe(
      relationships.length,
    );
    expect(entities.every((entity) => entity.evidenceId === evidenceA)).toBe(true);
    expect(relationships.every((relationship) => relationship.evidenceId === evidenceA)).toBe(
      true,
    );
    expect(entities.every((entity) => entity.organisationId === ORG)).toBe(true);
    expect(entities.every((entity) => entity.snapshotId === "snap-direct")).toBe(true);
  });

  it("does not create a second evidence row when the existing row cannot be reused", async () => {
    const dataSourceId = await prepareSnapshot("snap-mismatch", 4);
    const source = getDataSource(dataSourceId);
    if (!source) throw new Error("missing source");
    recordMemoryEvidence({
      id: "ev-mismatch",
      organizationId: ORG,
      connectionId: null,
      dataSourceId,
      provider: "user_upload",
      sourceSystem: source.provider ?? source.name,
      sourceObjectType: source.sourceType,
      sourceIdentifier: `weekly-upload:${dataSourceId}:snap-mismatch`,
      observedAt: "2026-10-01T00:00:00.000Z",
      retrievedAt: "2026-10-01T00:00:00.000Z",
      provenance: "USER_PROVIDED",
      evidenceStatus: "active",
      confidence: 0.85,
      contentPayload: { snapshotId: "snap-other" },
      schemaVersion: "v1",
      createdBy: null,
    });

    expect(() =>
      receiveWeeklyUpload({
        dataSourceId,
        headers: HEADERS,
        recordCount: 4,
        payload: { snapshotId: "snap-mismatch" },
      }),
    ).toThrow(/bound to a different snapshot/);
    expect(listMemoryEvidence(ORG)).toHaveLength(1);
  });

  it("rejects evidence that belongs to another organisation or data source", () => {
    expect(() =>
      assertReusableWeeklyEvidence(evidence({ organizationId: OTHER_ORG }), {
        organizationId: ORG,
        dataSourceId: "ds-1",
        snapshotId: "snap-a",
      }),
    ).toThrow(/another organisation/);
    expect(() =>
      assertReusableWeeklyEvidence(evidence({ dataSourceId: "ds-2" }), {
        organizationId: ORG,
        dataSourceId: "ds-1",
        snapshotId: "snap-a",
      }),
    ).toThrow(/different data source/);
    expect(() =>
      assertReusableWeeklyEvidence(evidence({ provenance: "DIRECT" }), {
        organizationId: ORG,
        dataSourceId: "ds-1",
        snapshotId: "snap-a",
      }),
    ).toThrow(/cannot be reused/);
    expect(
      resolveBoundEvidenceId("evidence-a", [null, "evidence-a", undefined]),
    ).toBe("evidence-a");
    expect(() => resolveBoundEvidenceId("evidence-b", ["evidence-a"])).toThrow(
      /already bound/,
    );
  });

  it("does not point a snapshot at itself when attach is repeated", () => {
    const source = createDataSource({
      organizationId: ORG,
      name: "Manufacturing Operations",
    });
    persistDataSourceMapping(source.id, mapping(), HEADERS);
    receiveWeeklyUpload({
      dataSourceId: source.id,
      headers: HEADERS,
      recordCount: 4,
    });
    attachImmutableSnapshot({
      dataSourceId: source.id,
      snapshotId: "snap-week-1",
      recordCount: 4,
    });
    const repeated = attachImmutableSnapshot({
      dataSourceId: source.id,
      snapshotId: "snap-week-1",
      recordCount: 4,
    });
    expect(repeated.lineage.previousSnapshotId).toBeNull();
    expect(repeated.lineage.currentSnapshotId).toBe("snap-week-1");

    receiveWeeklyUpload({
      dataSourceId: source.id,
      headers: HEADERS,
      recordCount: 9,
      fileName: "week-2.csv",
    });
    const next = attachImmutableSnapshot({
      dataSourceId: source.id,
      snapshotId: "snap-week-2",
      recordCount: 9,
    });
    expect(next.lineage.previousSnapshotId).toBe("snap-week-1");
    const repeatedNext = attachImmutableSnapshot({
      dataSourceId: source.id,
      snapshotId: "snap-week-2",
      recordCount: 9,
    });
    expect(repeatedNext.lineage.previousSnapshotId).toBe("snap-week-1");
    expect(getDataSource(source.id)?.lastSnapshotId).toBe("snap-week-2");
  });

  it("matches the manufacturing graph tables to the Supabase unique keys", () => {
    const migration = readFileSync(
      resolve(process.cwd(), "supabase/migrations/015_manufacturing_evidence_graph.sql"),
      "utf8",
    );
    const evidenceMigration = readFileSync(
      resolve(process.cwd(), "supabase/migrations/013_verified_connections_evidence.sql"),
      "utf8",
    );
    const adapter = readFileSync(
      resolve(process.cwd(), "src/manufacturing-evidence-graph/supabase-store.ts"),
      "utf8",
    );

    expect(migration).toContain("primary key (organization_id, snapshot_id)");
    expect(migration).toContain("unique (organization_id, snapshot_id, source_record_id)");
    expect(migration).toContain(
      "unique (organization_id, snapshot_id, entity_type, entity_key)",
    );
    expect(migration).toContain("relationship_type");
    expect(migration).toContain("from_entity_id");
    expect(migration).toContain("to_entity_id");
    expect(migration).toContain("references public.organization_evidence (id)");
    expect(migration).toContain("references public.manufacturing_graph_entities (id)");
    expect(migration).toContain("enable row level security");
    expect(migration).not.toMatch(/for delete/i);
    expect(adapter).toContain(
      'onConflict: "organization_id,snapshot_id,entity_type,entity_key"',
    );
    expect(adapter).toContain(
      '"organization_id,snapshot_id,relationship_type,from_entity_id,to_entity_id"',
    );
    expect(evidenceMigration).toContain("organization_evidence_source_uniq");
    expect(evidenceMigration).toContain("source_identifier");
    expect(evidenceMigration).toContain("where evidence_status = 'active'");
  });
});
