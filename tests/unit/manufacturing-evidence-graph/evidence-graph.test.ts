/**
 * Manufacturing Evidence Graph — co-occurrence, evidence, and snapshot isolation.
 * @vitest-environment node
 */

import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { UdgCanonicalRecord } from "@/data-gateway/contracts/record";
import { listManufacturingGraphEntitiesAction } from "@/manufacturing-evidence-graph/actions";
import { clearManufacturingEvidenceGraphMemory } from "@/manufacturing-evidence-graph/memory-store";
import {
  manufacturingFactsFromRecords,
  projectManufacturingEvidenceGraph,
} from "@/manufacturing-evidence-graph/project";
import {
  assertUserProvidedProvenance,
  ManufacturingProvenanceError,
} from "@/manufacturing-evidence-graph/provenance";
import {
  compareManufacturingEvidenceGraphs,
  getManufacturingGraphRelationshipEvidence,
  listManufacturingGraphEntities,
  listManufacturingGraphRelationships,
  listManufacturingGraphRelationshipsForEntity,
  materializeManufacturingEvidenceGraph,
  saveManufacturingFactGrain,
} from "@/manufacturing-evidence-graph/store";
import type {
  ManufacturingGraphEntity,
  ManufacturingGraphRelationship,
} from "@/manufacturing-evidence-graph/types";
import * as authActions from "@/lib/auth/actions";
import * as orgQueries from "@/lib/organizations/queries";
import type { OrganizationMembership } from "@/lib/organizations/types";

const ORG_A = "11111111-1111-4111-8111-111111111111";
const ORG_B = "22222222-2222-4222-8222-222222222222";
const EVIDENCE_A = "33333333-3333-4333-8333-333333333333";
const EVIDENCE_B = "44444444-4444-4444-8444-444444444444";
const SNAP_A = "snap_mfg_a";
const SNAP_B = "snap_mfg_b";

function record(
  recordId: string,
  fields: Record<string, string | number | null>,
): UdgCanonicalRecord {
  return { recordId, rowIndex: 1, fields };
}

function fullRow(recordId = "rec-1"): UdgCanonicalRecord {
  return record(recordId, {
    period: "2026-09",
    asOfDate: "2026-01-01",
    region: "Queensland",
    branch: "Brisbane",
    dealer: "Dealer X",
    model: "Model H",
    variant: "H-Long",
    factory: "Factory 2",
    actualQuantity: 14,
    orderBankQuantity: 6,
    finishedGoods: 3,
    productionCapacity: 20,
    forecastQuantity: 12,
  });
}

function edge(
  entities: ManufacturingGraphEntity[],
  relationships: ManufacturingGraphRelationship[],
  relationshipType: string,
  fromType: string,
  fromLabel: string,
  toType: string,
  toLabel: string,
): ManufacturingGraphRelationship | undefined {
  return relationships.find((relationship) => {
    if (relationship.relationshipType !== relationshipType) return false;
    const from = entities.find((entity) => entity.id === relationship.fromEntityId);
    const to = entities.find((entity) => entity.id === relationship.toEntityId);
    return (
      from?.entityType === fromType &&
      from.label === fromLabel &&
      to?.entityType === toType &&
      to.label === toLabel
    );
  });
}

async function persist(
  records: UdgCanonicalRecord[],
  options?: {
    organisationId?: string;
    snapshotId?: string;
    evidenceId?: string;
    organisationLabel?: string | null;
  },
) {
  const organisationId = options?.organisationId ?? ORG_A;
  const snapshotId = options?.snapshotId ?? SNAP_A;
  const evidenceId = options?.evidenceId ?? EVIDENCE_A;
  await saveManufacturingFactGrain({
    organisationId,
    snapshotId,
    organisationLabel: options?.organisationLabel ?? null,
    records,
  });
  await materializeManufacturingEvidenceGraph({
    organisationId,
    snapshotId,
    evidenceId,
  });
  const entities = await listManufacturingGraphEntities(organisationId, snapshotId);
  const relationships = await listManufacturingGraphRelationships(
    organisationId,
    snapshotId,
  );
  return { entities, relationships, organisationId, snapshotId, evidenceId };
}

function walk(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = resolve(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(path));
    else if (entry.name.endsWith(".ts") || entry.name.endsWith(".sql")) files.push(path);
  }
  return files;
}

describe("Manufacturing Evidence Graph", () => {
  beforeEach(() => {
    clearManufacturingEvidenceGraphMemory();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    clearManufacturingEvidenceGraphMemory();
  });

  it("creates entities from a manufacturing row", async () => {
    const { entities } = await persist([fullRow()]);
    const types = entities.map((entity) => entity.entityType).sort();
    expect(types).toEqual(
      [
        "Branch",
        "Capacity",
        "Dealer",
        "Demand",
        "Factory",
        "Forecast",
        "Inventory",
        "MachineModel",
        "MachineVariant",
        "Order",
        "Organisation",
        "Region",
      ].sort(),
    );
    expect(entities.find((entity) => entity.entityType === "MachineModel")?.label).toBe(
      "Model H",
    );
    expect(entities.find((entity) => entity.entityType === "Region")?.label).toBe(
      "Queensland",
    );
    expect(entities.find((entity) => entity.entityType === "Dealer")?.label).toBe(
      "Dealer X",
    );
    expect(entities.find((entity) => entity.entityType === "Factory")?.label).toBe(
      "Factory 2",
    );
    expect(entities.find((entity) => entity.entityType === "Demand")?.quantity).toBe(14);
    expect(entities.find((entity) => entity.entityType === "Order")?.quantity).toBe(6);
    expect(entities.find((entity) => entity.entityType === "Inventory")?.quantity).toBe(3);
    expect(entities.find((entity) => entity.entityType === "Capacity")?.quantity).toBe(20);
    expect(entities.find((entity) => entity.entityType === "Forecast")?.quantity).toBe(12);

    const facts = manufacturingFactsFromRecords([fullRow()]);
    expect(facts[0]?.period).toBe("2026-09");
    expect(facts[0]?.sourceRecordId).toBe("rec-1");
  });

  it("creates co-occurrence relationships from the same source record", async () => {
    const { entities, relationships } = await persist([fullRow()]);
    expect(
      edge(entities, relationships, "CONTAINS", "Region", "Queensland", "Dealer", "Dealer X"),
    ).toBeDefined();
    expect(
      edge(entities, relationships, "LOCATED_IN", "Dealer", "Dealer X", "Region", "Queensland"),
    ).toBeDefined();
    expect(
      edge(entities, relationships, "DEMANDS", "Dealer", "Dealer X", "MachineModel", "Model H"),
    ).toBeDefined();
    expect(
      edge(entities, relationships, "DEMANDS", "Dealer", "Dealer X", "MachineVariant", "H-Long"),
    ).toBeDefined();
    expect(
      edge(entities, relationships, "DEMANDS", "Region", "Queensland", "MachineModel", "Model H"),
    ).toBeDefined();
    expect(
      edge(entities, relationships, "DEMANDS", "Region", "Queensland", "MachineVariant", "H-Long"),
    ).toBeDefined();
    expect(
      edge(entities, relationships, "HAS_VARIANT", "MachineModel", "Model H", "MachineVariant", "H-Long"),
    ).toBeDefined();
    expect(
      edge(entities, relationships, "PLANNED_AT", "MachineModel", "Model H", "Factory", "Factory 2"),
    ).toBeDefined();
    expect(
      edge(entities, relationships, "PLANNED_AT", "MachineVariant", "H-Long", "Factory", "Factory 2"),
    ).toBeDefined();
    expect(
      edge(entities, relationships, "HAS_CAPACITY", "Factory", "Factory 2", "Capacity", "20"),
    ).toBeDefined();
    expect(
      edge(entities, relationships, "FOR_MODEL", "Demand", "14", "MachineModel", "Model H"),
    ).toBeDefined();
    expect(
      edge(entities, relationships, "FOR_REGION", "Demand", "14", "Region", "Queensland"),
    ).toBeDefined();
    expect(
      edge(entities, relationships, "THROUGH_DEALER", "Demand", "14", "Dealer", "Dealer X"),
    ).toBeDefined();
    expect(
      edge(entities, relationships, "FOR_MODEL", "Forecast", "12", "MachineModel", "Model H"),
    ).toBeDefined();
    expect(
      edge(entities, relationships, "FOR_REGION", "Forecast", "12", "Region", "Queensland"),
    ).toBeDefined();
    expect(
      edge(entities, relationships, "CONSTRAINED_BY", "Forecast", "12", "Capacity", "20"),
    ).toBeDefined();
    expect(relationships).toHaveLength(16);

    const unrelated = [
      "Branch",
      "Order",
      "Inventory",
      "Organisation",
    ];
    expect(
      relationships.some(
        (relationship) =>
          unrelated.includes(relationship.fromEntityType) ||
          unrelated.includes(relationship.toEntityType),
      ),
    ).toBe(false);
  });

  it("does not create relationships when fields are missing or split across rows", async () => {
    const modelOnly = await persist([record("rec-model", { model: "Model H" })]);
    expect(modelOnly.relationships).toEqual([]);
    expect(modelOnly.entities.map((entity) => entity.entityType).sort()).toEqual([
      "MachineModel",
      "Organisation",
    ]);

    clearManufacturingEvidenceGraphMemory();
    const forecastOnly = await persist([
      record("rec-forecast", { model: "Model H", forecastQuantity: 12 }),
    ]);
    expect(
      forecastOnly.entities.some((entity) => entity.entityType === "Demand"),
    ).toBe(false);
    expect(
      edge(
        forecastOnly.entities,
        forecastOnly.relationships,
        "CONSTRAINED_BY",
        "Forecast",
        "12",
        "Capacity",
        "20",
      ),
    ).toBeUndefined();

    clearManufacturingEvidenceGraphMemory();
    const ignoredMeasures = await persist([
      record("rec-days", { inventoryDays: 40, availableSlots: 5, model: "Model H" }),
    ]);
    expect(
      ignoredMeasures.entities.some((entity) =>
        entity.entityType === "Inventory" || entity.entityType === "Capacity",
      ),
    ).toBe(false);

    clearManufacturingEvidenceGraphMemory();
    const split = await persist([
      record("rec-left", { region: "Queensland", model: "Model H" }),
      record("rec-right", { factory: "Factory 2", productionCapacity: 20 }),
    ]);
    expect(
      split.relationships.some((relationship) => relationship.relationshipType === "PLANNED_AT"),
    ).toBe(false);
    expect(
      split.relationships.some(
        (relationship) => relationship.relationshipType === "CONSTRAINED_BY",
      ),
    ).toBe(false);
    expect(
      edge(
        split.entities,
        split.relationships,
        "DEMANDS",
        "Region",
        "Queensland",
        "MachineModel",
        "Model H",
      ),
    ).toBeDefined();
  });

  it("isolates graphs by organisation", async () => {
    await persist([fullRow()], { organisationId: ORG_A });
    await persist(
      [record("rec-b", { region: "Victoria", dealer: "Dealer Y", model: "Model K" })],
      { organisationId: ORG_B, evidenceId: EVIDENCE_B },
    );

    const orgA = await listManufacturingGraphEntities(ORG_A, SNAP_A);
    const orgB = await listManufacturingGraphEntities(ORG_B, SNAP_A);
    expect(orgA.some((entity) => entity.label === "Dealer X")).toBe(true);
    expect(orgA.some((entity) => entity.label === "Dealer Y")).toBe(false);
    expect(orgB.some((entity) => entity.label === "Dealer Y")).toBe(true);
    expect(orgB.some((entity) => entity.label === "Dealer X")).toBe(false);
    expect(orgA.every((entity) => entity.organisationId === ORG_A)).toBe(true);
    expect(orgB.every((entity) => entity.organisationId === ORG_B)).toBe(true);
  });

  it("isolates graphs by snapshot and supports comparison", async () => {
    await persist([fullRow()], { snapshotId: SNAP_A });
    const before = await listManufacturingGraphEntities(ORG_A, SNAP_A);
    await persist(
      [record("rec-2", { region: "Victoria", dealer: "Dealer Y", model: "Model K" })],
      { snapshotId: SNAP_B, evidenceId: EVIDENCE_B },
    );
    const after = await listManufacturingGraphEntities(ORG_A, SNAP_A);
    expect(after).toEqual(before);
    expect(after.some((entity) => entity.label === "Dealer Y")).toBe(false);

    const comparison = await compareManufacturingEvidenceGraphs({
      organisationId: ORG_A,
      snapshotId: SNAP_B,
      previousSnapshotId: SNAP_A,
    });
    expect(comparison.entitiesAdded.some((entity) => entity.label === "Dealer Y")).toBe(
      true,
    );
    expect(comparison.entitiesRemoved.some((entity) => entity.label === "Dealer X")).toBe(
      true,
    );
    expect(comparison.currentSnapshotId).toBe(SNAP_B);
    expect(comparison.previousSnapshotId).toBe(SNAP_A);
  });

  it("does not duplicate entities for the same canonical value", async () => {
    const { entities } = await persist([
      record("rec-1", { region: "Queensland", dealer: "Dealer X" }),
      record("rec-2", { region: "  Queensland  ", dealer: "Dealer X" }),
    ]);
    const regions = entities.filter((entity) => entity.entityType === "Region");
    const dealers = entities.filter((entity) => entity.entityType === "Dealer");
    const organisations = entities.filter((entity) => entity.entityType === "Organisation");
    expect(regions).toHaveLength(1);
    expect(dealers).toHaveLength(1);
    expect(organisations).toHaveLength(1);
    expect(regions[0]?.sourceRecordIds).toEqual(["rec-1", "rec-2"]);

    const firstSave = await saveManufacturingFactGrain({
      organisationId: ORG_A,
      snapshotId: SNAP_A,
      organisationLabel: null,
      records: [record("rec-9", { region: "Elsewhere", dealer: "Other" })],
    });
    expect(firstSave.created).toBe(false);
    const still = await listManufacturingGraphEntities(ORG_A, SNAP_A);
    expect(still.some((entity) => entity.label === "Elsewhere")).toBe(false);
    expect(still.filter((entity) => entity.entityType === "Region")).toHaveLength(1);
  });

  it("links every entity and relationship to organisation, snapshot, and evidence", async () => {
    const { entities, relationships } = await persist([fullRow()]);
    expect(entities.length).toBeGreaterThan(0);
    expect(relationships.length).toBeGreaterThan(0);
    for (const entity of entities) {
      expect(entity.organisationId).toBe(ORG_A);
      expect(entity.snapshotId).toBe(SNAP_A);
      expect(entity.evidenceId).toBe(EVIDENCE_A);
    }
    for (const relationship of relationships) {
      expect(relationship.organisationId).toBe(ORG_A);
      expect(relationship.snapshotId).toBe(SNAP_A);
      expect(relationship.evidenceId).toBe(EVIDENCE_A);
      expect(relationship.sourceRecordIds).toContain("rec-1");
    }

    const contains = relationships.find(
      (relationship) => relationship.relationshipType === "CONTAINS",
    );
    expect(contains).toBeDefined();
    const evidence = await getManufacturingGraphRelationshipEvidence(
      ORG_A,
      SNAP_A,
      contains!.id,
    );
    expect(evidence?.evidenceId).toBe(EVIDENCE_A);
    expect(evidence?.supportingFacts.map((fact) => fact.sourceRecordId)).toEqual(["rec-1"]);
    expect(evidence?.supportingFacts[0]?.evidenceId).toBe(EVIDENCE_A);
    expect(evidence?.supportingFacts[0]?.region).toBe("Queensland");
    expect(evidence?.supportingFacts[0]?.dealer).toBe("Dealer X");

    const hidden = await getManufacturingGraphRelationshipEvidence(
      ORG_B,
      SNAP_A,
      contains!.id,
    );
    expect(hidden).toBeNull();

    const model = entities.find((entity) => entity.entityType === "MachineModel");
    const forModel = await listManufacturingGraphRelationshipsForEntity(
      ORG_A,
      SNAP_A,
      model!.id,
    );
    expect(forModel.length).toBeGreaterThan(0);
    expect(forModel.every((relationship) =>
      relationship.fromEntityId === model!.id || relationship.toEntityId === model!.id,
    )).toBe(true);
  });

  it("stores USER_PROVIDED provenance and rejects SYNTHETIC", async () => {
    const { entities, relationships } = await persist([fullRow()]);
    expect(entities.every((entity) => entity.provenance === "USER_PROVIDED")).toBe(true);
    expect(relationships.every((relationship) => relationship.provenance === "USER_PROVIDED")).toBe(
      true,
    );
    expect(() => assertUserProvidedProvenance("SYNTHETIC")).toThrow(ManufacturingProvenanceError);
    expect(() => assertUserProvidedProvenance("USER_PROVIDED")).not.toThrow();

    const migration = readFileSync(
      resolve(process.cwd(), "supabase/migrations/015_manufacturing_evidence_graph.sql"),
      "utf8",
    );
    expect(migration).toContain("check (provenance = 'USER_PROVIDED')");
    expect(migration).not.toMatch(/provenance\s*(=|in)\s*'SYNTHETIC'/i);
  });

  it("does not mutate the first snapshot when a second snapshot is written", async () => {
    await persist([fullRow()], { snapshotId: SNAP_A, evidenceId: EVIDENCE_A });
    const firstEntities = await listManufacturingGraphEntities(ORG_A, SNAP_A);
    const firstRelationships = await listManufacturingGraphRelationships(ORG_A, SNAP_A);

    await persist(
      [record("rec-2", { region: "Queensland", dealer: "Dealer Z", model: "Model H" })],
      { snapshotId: SNAP_B, evidenceId: EVIDENCE_B },
    );

    expect(await listManufacturingGraphEntities(ORG_A, SNAP_A)).toEqual(firstEntities);
    expect(await listManufacturingGraphRelationships(ORG_A, SNAP_A)).toEqual(
      firstRelationships,
    );
    await expect(
      materializeManufacturingEvidenceGraph({
        organisationId: ORG_A,
        snapshotId: SNAP_A,
        evidenceId: EVIDENCE_B,
      }),
    ).rejects.toThrow(/already bound/);
    expect(await listManufacturingGraphEntities(ORG_A, SNAP_A)).toEqual(firstEntities);
  });

  it("does not inject Northline, Acme, or Sarah Jones fixtures", async () => {
    const { entities, relationships } = await persist([fullRow()], {
      organisationLabel: null,
    });
    const rendered = JSON.stringify({ entities, relationships });
    expect(rendered).not.toMatch(/Northline/i);
    expect(rendered).not.toMatch(/Acme Facilities/);
    expect(rendered).not.toMatch(/Sarah Jones/);
    expect(entities.find((entity) => entity.entityType === "Organisation")?.label).toBe(ORG_A);

    const files = [
      ...walk(resolve(process.cwd(), "src/manufacturing-evidence-graph")),
      resolve(process.cwd(), "supabase/migrations/015_manufacturing_evidence_graph.sql"),
    ];
    const source = files.map((file) => readFileSync(file, "utf8")).join("\n");
    expect(source).not.toMatch(/Northline/);
    expect(source).not.toMatch(/Acme Facilities/);
    expect(source).not.toMatch(/Sarah Jones/);
    expect(source).not.toMatch(/buildKnowledgeGraphForUser/);
    expect(source).not.toMatch(/getKnowledgeGraph/);
    expect(source).not.toMatch(/@\/knowledge-graph/);
    expect(source).not.toMatch(/provenance:\s*["']SYNTHETIC["']/);
    expect(source).not.toMatch(/analyseManufacturingSnapshot/);
  });

  it("produces deterministic ids for the same snapshot and different ids per snapshot", () => {
    const facts = manufacturingFactsFromRecords([fullRow()]);
    const first = projectManufacturingEvidenceGraph({
      organisationId: ORG_A,
      snapshotId: SNAP_A,
      evidenceId: EVIDENCE_A,
      facts,
    });
    const second = projectManufacturingEvidenceGraph({
      organisationId: ORG_A,
      snapshotId: SNAP_A,
      evidenceId: EVIDENCE_A,
      facts,
    });
    expect(second).toEqual(first);

    const otherSnapshot = projectManufacturingEvidenceGraph({
      organisationId: ORG_A,
      snapshotId: SNAP_B,
      evidenceId: EVIDENCE_A,
      facts,
    });
    expect(otherSnapshot.entities.map((entity) => entity.id)).not.toEqual(
      first.entities.map((entity) => entity.id),
    );
    expect(otherSnapshot.relationships.map((relationship) => relationship.id)).not.toEqual(
      first.relationships.map((relationship) => relationship.id),
    );

    const otherOrg = projectManufacturingEvidenceGraph({
      organisationId: ORG_B,
      snapshotId: SNAP_A,
      evidenceId: EVIDENCE_A,
      facts,
    });
    expect(otherOrg.entities.map((entity) => entity.id)).not.toEqual(
      first.entities.map((entity) => entity.id),
    );
  });

  it("reads through the authenticated organisation and rejects a mismatched client org", async () => {
    await persist([fullRow()]);
    const allowed = await listManufacturingGraphEntitiesAction({
      organisationId: ORG_A,
      snapshotId: SNAP_A,
    });
    expect(allowed.ok).toBe(true);
    if (allowed.ok) {
      expect(allowed.entities.some((entity) => entity.label === "Model H")).toBe(true);
    }

    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_EXECUTIVEOS_MOCK", "false");
    vi.spyOn(authActions, "getAuthenticatedUser").mockResolvedValue({
      id: "user-a",
      email: "a@example.com",
    } as Awaited<ReturnType<typeof authActions.getAuthenticatedUser>>);
    vi.spyOn(orgQueries, "fetchActiveMembership").mockResolvedValue(
      membership(ORG_A),
    );

    const denied = await listManufacturingGraphEntitiesAction({
      organisationId: ORG_B,
      snapshotId: SNAP_A,
    });
    expect(denied.ok).toBe(false);
    if (!denied.ok) expect(denied.code).toBe("FORBIDDEN");

    const studio = readFileSync(
      resolve(process.cwd(), "src/executive-snapshot-studio/server/actions.ts"),
      "utf8",
    );
    const finalize = readFileSync(
      resolve(process.cwd(), "src/verified-evidence/data-sources/actions.ts"),
      "utf8",
    );
    expect(studio).toContain("organisationId: actor.organisationId");
    expect(studio).not.toContain("organisationId: input.organisationId");
    expect(finalize).toContain("organisationId: actor.organisationId");
    expect(finalize).not.toContain("buildKnowledgeGraphForUser");
  });
});

function membership(organizationId: string): OrganizationMembership {
  return {
    member: {
      id: "m1",
      organization_id: organizationId,
      user_id: "user-a",
      role: "owner",
      status: "active",
      email: "a@example.com",
      display_name: "Member",
      joined_at: null,
      invited_at: null,
      created_at: new Date().toISOString(),
    },
    organization: {
      id: organizationId,
      name: "Member Org",
      legal_name: null,
      industry: null,
      company_size: null,
      country: null,
      timezone: "Australia/Brisbane",
      website: null,
      logo_url: null,
      subscription_plan: "free",
      created_by: "user-a",
      archived_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  };
}
