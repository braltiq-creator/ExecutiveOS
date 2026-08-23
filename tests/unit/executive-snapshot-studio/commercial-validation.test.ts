import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { beforeEach, describe, expect, it } from "vitest";
import { COUNCIL_AGENT_IDS } from "@/agents";
import {
  clearStudioStores,
  detectBusinessProfile,
  formatCommercialValidationReport,
  runCommercialValidationFromTabular,
} from "@/executive-snapshot-studio";
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

const DEMO_PRIORITY_MARKERS = [
  "Increase Enterprise ARR",
  "Board Readiness",
  "Reduce Executive Meeting Load",
];

const FORBIDDEN_COUNCIL_ROLES = [
  "Chief of Staff",
  "Chief Customer Officer",
  "chief_of_staff",
  "chief_customer_officer",
  "chief_strategy_officer",
  "chief_risk_officer",
  "chief_people_officer",
];

describe("Phase 57 commercial export validation", () => {
  beforeEach(() => {
    clearStudioStores();
    clearSnapshotStore();
    clearMappingStore();
    clearLineageStore();
    clearAuditStore();
  });

  it("detects Commercial Executive Intelligence — not Manufacturing", () => {
    const text = readFileSync(FIXTURE, "utf8");
    const parsed = parseTabularText(text);
    const detection = detectBusinessProfile({
      headers: parsed.headers,
      records: parsed.records.slice(0, 40),
    });
    expect(detection.profileId).toBe("commercial");
    expect(detection.label).toMatch(/Commercial/i);
    expect(detection.profileId).not.toBe("manufacturing");
  });

  it("maps commercial ontology fields from opportunity export headers", () => {
    const text = readFileSync(FIXTURE, "utf8");
    const headers = parseTabularText(text).headers;
    const mapping = inferMappingFromHeaders(headers, {
      organisationId: "org_v",
    });
    const canonical = new Set(mapping.fields.map((f) => f.canonicalField));
    expect(canonical.has("opportunity")).toBe(true);
    expect(canonical.has("owner")).toBe(true);
    expect(canonical.has("stage")).toBe(true);
    expect(canonical.has("product")).toBe(true);
    expect(canonical.has("saasValue")).toBe(true);
    expect(canonical.has("recurringValue")).toBe(true);
    expect(canonical.has("closeDate")).toBe(true);
    expect(canonical.has("nextStep")).toBe(true);
    expect(canonical.has("industry")).toBe(true);
    expect(canonical.has("dealer")).toBe(false);
  });

  it("ingests fixture through UDG and produces integrity-gated commercial brief", () => {
    const text = readFileSync(FIXTURE, "utf8");
    const result = runCommercialValidationFromTabular({
      tabularText: text,
      organisationId: "org_v",
      organisationName: "Validation Org",
      profileId: "profile_v",
      filename: "salesforce-opportunity-export.csv",
    });

    expect(result.errors).toEqual([]);
    expect(result.ingested).toBe(true);
    expect(result.profile.profileId).toBe("commercial");
    expect(result.snapshot?.meta.recordCount).toBeGreaterThan(100);
    expect(result.readiness?.executiveReadiness).toBeGreaterThan(0);
    expect(result.readiness?.commercialDatasetReadiness).toBeGreaterThan(0);
    expect(result.readiness?.evidenceCoverage).toBeDefined();
    expect(result.analysis?.insights.length).toBeGreaterThan(0);
    expect(result.analysis?.missingInformation.join(" ")).toMatch(/Next Step/i);
    expect(
      result.analysis?.insights.some(
        (i) => i.posture === "insufficient_evidence" || i.posture === "investigate",
      ),
    ).toBe(true);
    expect(result.intelligent).toBeDefined();
    expect(result.council).toBeDefined();
    expect(result.brief?.title).toMatch(/Commercial Executive Brief/i);
    expect(result.brief?.recommendedJudgement.length).toBeGreaterThan(0);
    expect(result.brief?.confidence).toBeGreaterThan(0);
    expect(result.brief?.executiveValue).toMatch(
      /not yet quantified|Pipeline in View/i,
    );
    expect(result.brief?.executiveValue).not.toMatch(
      /value protected ≈|Value Protected ≈/i,
    );

    const report = formatCommercialValidationReport(result);
    expect(report).toContain("Data successfully ingested");
    expect(report).toContain("Executive Brief generated");
    expect(report).not.toContain("hard-coded");

    writeFileSync(
      resolve(
        process.cwd(),
        "docs/validation/PHASE_57_COMMERCIAL_EXPORT_VALIDATION.md",
      ),
      report,
      "utf8",
    );
  });
});

describe("Phase 57A commercial intelligence integrity", () => {
  beforeEach(() => {
    clearStudioStores();
    clearSnapshotStore();
    clearMappingStore();
    clearLineageStore();
    clearAuditStore();
  });

  it("isolates real customer snapshot from demo priorities, outcomes, decisions, and Council roles", () => {
    const text = readFileSync(FIXTURE, "utf8");
    const result = runCommercialValidationFromTabular({
      tabularText: text,
      organisationId: "org_real_customer",
      organisationName: "Real Customer Org",
      profileId: "profile_real",
      filename: "salesforce-opportunity-export.csv",
    });

    expect(result.ingested).toBe(true);
    expect(result.council?.perspectives).toHaveLength(5);
    expect(result.council?.perspectives.map((p) => p.agentId).sort()).toEqual(
      [...COUNCIL_AGENT_IDS].sort(),
    );

    const briefBlob = [
      result.brief?.executiveJudgement,
      result.brief?.executiveSummary,
      result.brief?.businessImplication,
      result.brief?.councilPosition,
      ...(result.brief?.councilDisagreement ?? []),
      result.intelligent?.narrative.executiveSummary,
      result.intelligent?.narrative.executiveBrief,
    ]
      .filter(Boolean)
      .join("\n");

    for (const marker of DEMO_PRIORITY_MARKERS) {
      expect(briefBlob).not.toContain(marker);
    }

    for (const role of FORBIDDEN_COUNCIL_ROLES) {
      expect(briefBlob).not.toContain(role);
      expect(
        result.council?.perspectives.some(
          (p) =>
            p.agentId === role ||
            p.title === role ||
            p.shortTitle === "CoS" ||
            p.shortTitle === "CCO",
        ),
      ).toBe(false);
    }

    expect(result.brief?.executiveJudgement).toMatch(
      /Strategic priorities have not yet been established/i,
    );

    // Portfolio outcomes/decisions come from commercial analysis — not demo ids
    expect(
      result.intelligent?.outcomes.every(
        (o) =>
          !o.id.includes("outcome-board") &&
          !o.id.includes("outcome-enterprise-arr") &&
          !o.id.includes("outcome-efficiency"),
      ),
    ).toBe(true);
    expect(
      result.intelligent?.decisions.every(
        (d) => !d.id.includes("decision-residency"),
      ),
    ).toBe(true);

    // Missing evidence → uncertainty; unsupported conclusions explicit
    expect(result.analysis?.missingInformation.length).toBeGreaterThan(0);
    expect(result.analysis?.unsupportedConclusions.length).toBeGreaterThan(0);
    expect(result.brief?.uncertainty.length).toBeGreaterThan(0);

    // Data quality high does not auto-claim activity judgement ready
    expect(result.readiness?.dataQuality).toBeGreaterThan(80);
    expect(
      result.readiness?.judgementReadiness.activityBasedJudgement,
    ).toBe("insufficient");

    // Executive Value cannot claim protected without evidence
    expect(result.analysis?.executiveValue.valueProtected).toBeNull();
    expect(result.analysis?.executiveValue.valueAtRisk).toBeNull();
    expect(result.analysis?.executiveValue.quantified).toBe(false);
  });
});
