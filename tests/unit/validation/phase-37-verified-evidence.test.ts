/**
 * Phase 37 — Verified Connections & Evidence Infrastructure
 * @vitest-environment node
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  buildClaim,
  ClaimEvidenceError,
  discoverFromVerifiedEvidence,
  getDiscoveryEvidenceContext,
  listMemoryConnections,
  markConnectionVerified,
  recordMemoryClaim,
  recordMemoryEvidence,
  registerAuthenticatedConnection,
  resetVerifiedEvidenceMemory,
  SyntheticEvidenceError,
  assertProvenanceAllowed,
  buildSnapshotEvidenceBundle,
  entityFromEvidence,
} from "@/verified-evidence";
import {
  createDiscoverySession,
  discoverOrganisation,
  runDiscovery,
  submitMinimumQuestions,
} from "@/onboarding";

const ORG = "bbbbbbbb-cccc-dddd-eeee-ffffffffffff";
const ORG_B = "cccccccc-dddd-eeee-ffff-000000000000";

describe("Phase 37 — verified connections & evidence", () => {
  const env = process.env;

  beforeEach(() => {
    process.env = { ...env };
    resetVerifiedEvidenceMemory();
  });

  afterEach(() => {
    process.env = { ...env };
    vi.unstubAllEnvs();
    resetVerifiedEvidenceMemory();
  });

  function productionEnv() {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_EXECUTIVEOS_MOCK", "false");
  }

  it("connection registry isolates organisations and defaults to not_connected", () => {
    const a = listMemoryConnections(ORG);
    const b = listMemoryConnections(ORG_B);
    expect(a).toHaveLength(2);
    expect(b).toHaveLength(2);
    expect(a.every((c) => c.connectionStatus === "not_connected")).toBe(true);
    expect(a.map((c) => c.provider).sort()).toEqual(["microsoft365", "simpro"]);

    registerAuthenticatedConnection({
      organizationId: ORG,
      provider: "microsoft365",
      scopes: ["User.Read"],
    });
    expect(
      listMemoryConnections(ORG).find((c) => c.provider === "microsoft365")
        ?.authenticationStatus,
    ).toBe("authenticated");
    expect(
      listMemoryConnections(ORG_B).find((c) => c.provider === "microsoft365")
        ?.authenticationStatus,
    ).toBe("none");
  });

  it("lifecycle distinguishes authentication from verification", () => {
    registerAuthenticatedConnection({
      organizationId: ORG,
      provider: "simpro",
    });
    const pending = listMemoryConnections(ORG).find((c) => c.provider === "simpro")!;
    expect(pending.connectionStatus).toBe("verification_required");
    expect(pending.verificationStatus).toBe("verification_required");

    const verified = markConnectionVerified({
      organizationId: ORG,
      provider: "simpro",
    });
    expect(verified.verificationStatus).toBe("verified");
    expect(verified.connectionStatus).toBe("connected");
    expect(verified.lastVerifiedAt).toBeTruthy();
  });

  it("rejects SYNTHETIC evidence in Production", () => {
    productionEnv();
    expect(() =>
      assertProvenanceAllowed("SYNTHETIC", { allowSyntheticInMock: false }),
    ).toThrow(SyntheticEvidenceError);

    expect(() =>
      recordMemoryEvidence({
        id: "ev-synth",
        organizationId: ORG,
        connectionId: null,
        provider: "microsoft365",
        sourceSystem: "reality-lab",
        sourceObjectType: "person",
        sourceIdentifier: "sarah",
        observedAt: null,
        retrievedAt: new Date().toISOString(),
        provenance: "SYNTHETIC",
        evidenceStatus: "active",
        confidence: 0.9,
        contentPayload: { label: "Sarah Jones" },
        schemaVersion: "1",
        createdBy: null,
      }),
    ).toThrow(SyntheticEvidenceError);
  });

  it("evidence requires provenance and source attribution", () => {
    const row = recordMemoryEvidence({
      id: "ev-1",
      organizationId: ORG,
      connectionId: null,
      provider: "user_upload",
      sourceSystem: "excel",
      sourceObjectType: "workbook",
      sourceIdentifier: "file-1",
      observedAt: "2026-09-01T00:00:00.000Z",
      retrievedAt: "2026-09-13T00:00:00.000Z",
      provenance: "USER_PROVIDED",
      evidenceStatus: "active",
      confidence: 1,
      contentPayload: { label: "Forecast workbook" },
      schemaVersion: "1",
      createdBy: "user-1",
    });
    expect(row.provenance).toBe("USER_PROVIDED");
    expect(row.sourceSystem).toBe("excel");
    expect(row.sourceIdentifier).toBe("file-1");
  });

  it("claims require evidence references and preserve classification", () => {
    expect(() =>
      buildClaim({
        id: "c1",
        organizationId: ORG,
        claimKind: "customer",
        statement: "Acme is a customer",
        evidence: [],
      }),
    ).toThrow(ClaimEvidenceError);

    const direct = recordMemoryEvidence({
      id: "ev-direct",
      organizationId: ORG,
      connectionId: null,
      provider: "simpro",
      sourceSystem: "simpro",
      sourceObjectType: "customer",
      sourceIdentifier: "cust-1",
      observedAt: null,
      retrievedAt: new Date().toISOString(),
      provenance: "DIRECT",
      evidenceStatus: "active",
      confidence: 0.8,
      contentPayload: { label: "Harbour Customer" },
      schemaVersion: "1",
      createdBy: null,
    });

    const claim = recordMemoryClaim({
      id: "claim-1",
      organizationId: ORG,
      claimKind: "customer",
      statement: "Harbour Customer is an active customer",
      evidenceIds: [direct.id],
      classification: "DIRECT",
    });
    expect(claim.evidenceIds).toEqual([direct.id]);
    expect(claim.classification).toBe("DIRECT");

    const derivedEv = recordMemoryEvidence({
      id: "ev-derived",
      organizationId: ORG,
      connectionId: null,
      provider: "executiveos",
      sourceSystem: "executiveos",
      sourceObjectType: "metric",
      sourceIdentifier: "m1",
      observedAt: null,
      retrievedAt: new Date().toISOString(),
      provenance: "DERIVED",
      evidenceStatus: "active",
      confidence: 0.5,
      contentPayload: { label: "Derived score" },
      schemaVersion: "1",
      createdBy: null,
    });

    expect(() =>
      buildClaim({
        id: "c-bad",
        organizationId: ORG,
        claimKind: "metric",
        statement: "score",
        evidence: [derivedEv],
        classification: "DIRECT",
      }),
    ).toThrow(/Cannot classify a claim as DIRECT/);
  });

  it("connected but unverified yields no Discovery business claims", () => {
    productionEnv();
    registerAuthenticatedConnection({
      organizationId: ORG,
      provider: "microsoft365",
    });
    const ctx = getDiscoveryEvidenceContext(ORG);
    expect(ctx.verifiedProviders).toEqual([]);
    expect(ctx.hasVerifiedEvidence).toBe(false);
    expect(
      discoverFromVerifiedEvidence({
        organizationId: ORG,
        evidence: ctx.evidence,
        verifiedProviders: ctx.verifiedProviders,
      }),
    ).toEqual([]);
  });

  it("verified source with no evidence remains honest empty", () => {
    productionEnv();
    registerAuthenticatedConnection({
      organizationId: ORG,
      provider: "simpro",
    });
    markConnectionVerified({ organizationId: ORG, provider: "simpro" });
    const ctx = getDiscoveryEvidenceContext(ORG);
    expect(ctx.verifiedProviders).toEqual(["simpro"]);
    expect(ctx.hasVerifiedEvidence).toBe(false);
    expect(discoverOrganisation({ tenantId: ORG })).toEqual([]);
  });

  it("verified evidence becomes eligible for Discovery", () => {
    productionEnv();
    registerAuthenticatedConnection({
      organizationId: ORG,
      provider: "simpro",
    });
    markConnectionVerified({ organizationId: ORG, provider: "simpro" });
    const evidence = recordMemoryEvidence({
      id: "ev-job",
      organizationId: ORG,
      connectionId: null,
      provider: "simpro",
      sourceSystem: "simpro",
      sourceObjectType: "job",
      sourceIdentifier: "job-99",
      observedAt: null,
      retrievedAt: new Date().toISOString(),
      provenance: "DIRECT",
      evidenceStatus: "active",
      confidence: 0.91,
      contentPayload: {
        label: "Open HVAC commitment",
        summary: "Verified Simpro job evidence for open field commitment.",
      },
      schemaVersion: "1",
      createdBy: null,
    });

    const items = discoverFromVerifiedEvidence({
      organizationId: ORG,
      evidence: [evidence],
      verifiedProviders: ["simpro"],
    });
    expect(items).toHaveLength(1);
    expect(items[0]?.label).toBe("Open HVAC commitment");
    expect(JSON.stringify(items)).not.toContain("Acme Facilities");
    expect(JSON.stringify(items)).not.toContain("Northline");
  });

  it("Production Discovery still blocks Reality Lab fixtures", () => {
    productionEnv();
    const items = discoverOrganisation({
      tenantId: ORG,
      connectedSystems: ["microsoft365", "simpro"],
    });
    expect(items).toEqual([]);
    expect(JSON.stringify(items)).not.toContain("Sarah Jones");
    expect(JSON.stringify(items)).not.toContain("Monday 8:00am");
  });

  it("runDiscovery in Production does not recommend from fabricated Simpro", () => {
    productionEnv();
    let session = createDiscoverySession({
      tenantId: ORG,
      userId: "user-1",
    });
    session = submitMinimumQuestions(session, {
      role: "CEO",
      primaryObjective: "Growth",
      briefingTime: "Morning",
      strategicOutcomes: ["Growth"],
    });
    session = runDiscovery(session, {
      connectedSystems: ["simpro"],
      verifiedConnections: false,
      accountOrganisation: { id: ORG, name: "Braltiq" },
    });
    expect(session.discoveries).toEqual([]);
    expect(session.profileRecommendation).toBeNull();
    expect(session.progress.systemsConnected).toEqual([]);
  });

  it("snapshot evidence bundle retains multi-source provenance without replacing Excel", () => {
    const excel = recordMemoryEvidence({
      id: "ev-excel",
      organizationId: ORG,
      connectionId: null,
      provider: "user_upload",
      sourceSystem: "excel",
      sourceObjectType: "workbook",
      sourceIdentifier: "wb-1",
      observedAt: null,
      retrievedAt: new Date().toISOString(),
      provenance: "USER_PROVIDED",
      evidenceStatus: "active",
      confidence: 1,
      contentPayload: { label: "Excel forecast" },
      schemaVersion: "1",
      createdBy: null,
    });
    const bundle = buildSnapshotEvidenceBundle({
      organizationId: ORG,
      evidence: [excel],
    });
    expect(bundle.sources).toHaveLength(1);
    expect(bundle.sources[0]?.provider).toBe("user_upload");
    expect(bundle.sources[0]?.provenance).toBe("USER_PROVIDED");
  });

  it("graph prep entities remain evidence-backed", () => {
    const evidence = recordMemoryEvidence({
      id: "ev-ent",
      organizationId: ORG,
      connectionId: null,
      provider: "microsoft365",
      sourceSystem: "graph",
      sourceObjectType: "user",
      sourceIdentifier: "u-1",
      observedAt: null,
      retrievedAt: new Date().toISOString(),
      provenance: "DIRECT",
      evidenceStatus: "active",
      confidence: 0.7,
      contentPayload: { label: "Executive user" },
      schemaVersion: "1",
      createdBy: null,
    });
    const entity = entityFromEvidence({
      id: "ent-1",
      evidence,
      entityType: "Person",
      entityKey: "u-1",
      label: "Executive user",
    });
    expect(entity.evidenceId).toBe(evidence.id);
    expect(entity.properties.provenance).toBe("DIRECT");
  });

  it("migration 013 and ADR exist", () => {
    const migration = readFileSync(
      resolve(
        process.cwd(),
        "supabase/migrations/013_verified_connections_evidence.sql",
      ),
      "utf8",
    );
    expect(migration).toContain("organization_evidence");
    expect(migration).toContain("organization_claims");
    expect(migration).toContain("provenance <> 'SYNTHETIC'");
    expect(migration).toContain("verification_status");
    expect(migration).toContain("'simpro'");

    const adr = readFileSync(
      resolve(
        process.cwd(),
        "docs/architecture/ADR-008-verified-connections-evidence.md",
      ),
      "utf8",
    );
    expect(adr).toMatch(/Connection is not evidence|A connection is not evidence/i);
  });
});
