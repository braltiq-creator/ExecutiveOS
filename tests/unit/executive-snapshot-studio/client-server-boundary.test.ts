/**
 * Phase 57B — Client/Server boundary proofs for Executive Snapshot Studio.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { beforeEach, describe, expect, it } from "vitest";
import { COUNCIL_AGENT_IDS } from "@/agents";
import {
  clearStudioStores,
  formatCommercialValidationReport,
  runCommercialValidationFromTabular,
} from "@/executive-snapshot-studio";
import {
  createExecutiveSnapshotAction,
  runStudioIntelligenceAction,
} from "@/executive-snapshot-studio/server/actions";
import { runCommercialValidationFromFile } from "@/executive-snapshot-studio/server/commercial-validation-file";
import {
  clearAuditStore,
  clearLineageStore,
  clearMappingStore,
  clearSnapshotStore,
  inferMappingFromHeaders,
  parseTabularText,
} from "@/data-gateway";

const FIXTURE = resolve(
  process.cwd(),
  "fixtures/validation/salesforce-opportunity-export.csv",
);

const SAMPLE_CSV = `Opportunity Name,Opportunity Owner,Stage,Close Date,Net SaaS (converted)
Acme Deal,Alex Owner,Stage 3 - Discovery,2026-09-01,12000
Beta Deal,Alex Owner,Closed Won,2026-01-01,8000
`;

describe("Phase 57B Snapshot Studio client/server boundary", () => {
  beforeEach(() => {
    clearStudioStores();
    clearSnapshotStore();
    clearMappingStore();
    clearLineageStore();
    clearAuditStore();
  });

  it("SnapshotStudio client module source does not import node:fs", () => {
    const studioSrc = readFileSync(
      resolve(
        process.cwd(),
        "src/executive-snapshot-studio/wizard/SnapshotStudio.tsx",
      ),
      "utf8",
    );
    const clientApiSrc = readFileSync(
      resolve(process.cwd(), "src/executive-snapshot-studio/client/api.ts"),
      "utf8",
    );
    const validationSrc = readFileSync(
      resolve(
        process.cwd(),
        "src/executive-snapshot-studio/intelligence/run-commercial-validation.ts",
      ),
      "utf8",
    );

    expect(studioSrc).not.toMatch(/from ["']node:fs["']|require\(["']fs["']\)/);
    expect(studioSrc).not.toMatch(/run-commercial-validation/);
    expect(studioSrc).not.toMatch(/interpretCommercialSnapshot/);
    expect(studioSrc).toMatch(/createSnapshotOnServer|runIntelligenceOnServer|parseWorkbookOnServer/);

    expect(clientApiSrc).not.toMatch(/from ["']node:fs["']|require\(["']fs["']\)/);
    expect(clientApiSrc).not.toMatch(/fixtures\/validation/);

    expect(validationSrc).not.toMatch(/from ["']node:fs["']|require\(["']fs["']\)/);
    expect(validationSrc).not.toMatch(/readFileSync/);
  });

  it("keeps Salesforce fixture server-only and out of client modules", () => {
    const studioSrc = readFileSync(
      resolve(
        process.cwd(),
        "src/executive-snapshot-studio/wizard/SnapshotStudio.tsx",
      ),
      "utf8",
    );
    const clientApiSrc = readFileSync(
      resolve(process.cwd(), "src/executive-snapshot-studio/client/api.ts"),
      "utf8",
    );
    const fileHelperSrc = readFileSync(
      resolve(
        process.cwd(),
        "src/executive-snapshot-studio/server/commercial-validation-file.ts",
      ),
      "utf8",
    );

    expect(studioSrc).not.toContain("salesforce-opportunity-export");
    expect(clientApiSrc).not.toContain("salesforce-opportunity-export");
    expect(fileHelperSrc).toMatch(/server-only/);
    expect(fileHelperSrc).toMatch(/node:fs/);
    expect(readFileSync(FIXTURE, "utf8").split("\n").length).toBeGreaterThan(10);
  });

  it("commercial validation executes server-side from uploaded tabular text", async () => {
    const parsed = parseTabularText(SAMPLE_CSV);
    const mapping = inferMappingFromHeaders(parsed.headers, {
      organisationId: "org_boundary",
    });

    const created = await createExecutiveSnapshotAction({
      organisationId: "org_boundary",
      organisationName: "Boundary Org",
      profileId: "profile_boundary",
      sourceKind: "csv",
      filename: "upload.csv",
      tabularText: SAMPLE_CSV,
      selectedProfileId: "commercial",
      mapping,
    });

    expect(created.success).toBe(true);
    expect(created.snapshot?.meta.recordCount).toBe(2);
    expect(created.errors).toEqual([]);

    // Serializable plain object (no functions / class instances)
    const roundTrip = JSON.parse(JSON.stringify(created));
    expect(roundTrip.success).toBe(true);
    expect(roundTrip.snapshot.meta.recordCount).toBe(2);
    expect(roundTrip.readiness.executiveReadiness).toBeGreaterThan(0);

    const intelligence = await runStudioIntelligenceAction({
      organisationName: "Boundary Org",
      selectedProfileId: "commercial",
      snapshot: created.snapshot!,
      readiness: created.readiness!,
    });

    expect(intelligence.success).toBe(true);
    expect(intelligence.brief?.title).toMatch(/Brief/i);
    expect(intelligence.council?.seats).toEqual(
      expect.arrayContaining(["CEO", "CFO", "COO", "CRO", "CSO"]),
    );
    expect(intelligence.council?.seats).toHaveLength(5);
    expect(JSON.parse(JSON.stringify(intelligence)).success).toBe(true);
  });

  it("fixture file validation remains available on the server", () => {
    const result = runCommercialValidationFromFile(FIXTURE, {
      organisationId: "org_fixture",
      organisationName: "Fixture Org",
      profileId: "profile_fixture",
    });
    expect(result.ingested).toBe(true);
    expect(result.snapshot?.meta.recordCount).toBeGreaterThan(100);
    expect(result.council?.perspectives.map((p) => p.agentId).sort()).toEqual(
      [...COUNCIL_AGENT_IDS].sort(),
    );
  });

  it("does not change permanent Council architecture", () => {
    expect(COUNCIL_AGENT_IDS).toEqual(["ceo", "cfo", "coo", "cro", "cso"]);
  });

  it("Phase 57 tabular validation path still works through package exports", () => {
    const result = runCommercialValidationFromTabular({
      tabularText: SAMPLE_CSV,
      organisationId: "org_v57",
      organisationName: "V57 Org",
      profileId: "profile_v57",
      filename: "sample.csv",
    });
    expect(result.ingested).toBe(true);
    expect(result.brief?.title).toMatch(/Commercial Executive Brief/i);
    const report = formatCommercialValidationReport(result);
    expect(report).toContain("Executive Brief generated");
    expect(report).not.toContain("/Users/");
  });
});
