import { beforeEach, describe, expect, it } from "vitest";
import {
  activateStudioIntelligence,
  buildMappingPreview,
  buildStudioBriefPreview,
  clearStudioStores,
  createStudioSnapshot,
  detectBusinessProfile,
  listLibrary,
  saveStudioSession,
  scoreExecutiveReadiness,
  upsertLibraryEntry,
  type StudioSession,
} from "@/executive-snapshot-studio";
import {
  clearAuditStore,
  clearLineageStore,
  clearMappingStore,
  clearSnapshotStore,
  inferMappingFromHeaders,
  parseTabularText,
} from "@/data-gateway";

const SAMPLE = `DealerName,Forecast_Qty,BranchCode,ModelCode,Variant
North Dealer,12,BNE,ZX350,LC
South Dealer,8,SYD,ZX250,Standard
`;

describe("Executive Snapshot Studio", () => {
  beforeEach(() => {
    clearStudioStores();
    clearSnapshotStore();
    clearMappingStore();
    clearLineageStore();
    clearAuditStore();
  });

  it("detects manufacturing profile from dealer/forecast/model signals", () => {
    const parsed = parseTabularText(SAMPLE);
    const detection = detectBusinessProfile({
      headers: parsed.headers,
      records: parsed.records,
    });
    expect(detection.profileId).toBe("manufacturing");
    expect(detection.confidence).toBeGreaterThan(50);
    expect(detection.label).toMatch(/Manufacturing/i);
  });

  it("builds mapping preview with entities and measures", () => {
    const mapping = inferMappingFromHeaders(parseTabularText(SAMPLE).headers, {
      organisationId: "org_1",
    });
    const preview = buildMappingPreview(mapping);
    expect(preview.entities.length).toBeGreaterThan(0);
    expect(preview.measures.some((m) => /Forecast|Quantity/i.test(m))).toBe(
      true,
    );
  });

  it("creates a studio snapshot with executive readiness", () => {
    const mapping = inferMappingFromHeaders(parseTabularText(SAMPLE).headers, {
      organisationId: "org_demo",
      profileId: "p",
      productId: "eos",
    });
    const bundle = createStudioSnapshot({
      organisationId: "org_demo",
      profileId: "p",
      productId: "eos",
      sourceKind: "csv",
      tabularText: SAMPLE,
      mapping,
      filename: "forecast.csv",
    });
    expect(bundle.ingestion.ok).toBe(true);
    expect(bundle.readiness?.executiveReadiness).toBeGreaterThan(40);
    expect(bundle.mappingPreview?.confirmed).toBe(true);
  });

  it("scores readiness recommendations in executive language", () => {
    const mapping = inferMappingFromHeaders(parseTabularText(SAMPLE).headers, {
      organisationId: "org_demo",
    });
    const bundle = createStudioSnapshot({
      organisationId: "org_demo",
      profileId: "p",
      productId: "eos",
      sourceKind: "csv",
      tabularText: SAMPLE,
      mapping,
    });
    const readiness = scoreExecutiveReadiness({
      confidence: bundle.ingestion.confidence!,
      validation: bundle.ingestion.validation,
    });
    expect(readiness.recommendations.length).toBeGreaterThan(0);
    expect(readiness.dataQuality).toBeGreaterThan(0);
  });

  it("activates intelligence without inventing new reasoning", () => {
    const intelligence = activateStudioIntelligence({
      profileId: "manufacturing",
      industryLabel: "manufacturing",
      readiness: {
        dataQuality: 80,
        coverage: 80,
        freshness: 90,
        confidence: 85,
        relationshipIntegrity: 78,
        executiveReadiness: 82,
        recommendations: [],
        scoredAt: new Date().toISOString(),
      },
      recordCount: 2,
      organisationName: "Demo Co",
    });
    expect(intelligence.briefGenerated).toBe(true);
    expect(intelligence.commandCentreHref).toBe("/today");
    expect(intelligence.outcomeEngine).toBe("ready");
    expect(intelligence.advisorNames.length).toBeGreaterThan(0);

    const brief = buildStudioBriefPreview({
      profileId: "manufacturing",
      readiness: {
        dataQuality: 80,
        coverage: 80,
        freshness: 90,
        confidence: 85,
        relationshipIntegrity: 78,
        executiveReadiness: 82,
        recommendations: [],
        scoredAt: new Date().toISOString(),
      },
      confidenceOverall: 85,
      recordCount: 2,
      intelligence,
    });
    expect(brief.title).toMatch(/Brief/i);
    expect(brief.whatRequiresJudgement.length).toBeGreaterThan(0);
  });

  it("stores immutable library entries", () => {
    const mapping = inferMappingFromHeaders(parseTabularText(SAMPLE).headers, {
      organisationId: "org_demo",
    });
    const bundle = createStudioSnapshot({
      organisationId: "org_demo",
      profileId: "p",
      productId: "eos",
      sourceKind: "csv",
      tabularText: SAMPLE,
      mapping,
    });
    const session: StudioSession = {
      studioId: "studio_test",
      organisationId: "org_demo",
      profileId: "p",
      productId: "eos",
      step: "brief",
      sourceKind: "csv",
      mappingConfirmed: true,
      selectedProfileId: "manufacturing",
      udgSnapshot: bundle.ingestion.snapshot,
      readiness: bundle.readiness,
      brief: {
        title: "Executive Brief generated",
        summary: "Ready",
        readiness: bundle.readiness!.executiveReadiness,
        confidence: 80,
        judgementCount: 3,
        profileLabel: "Manufacturing",
        whatChanged: [],
        whatRequiresJudgement: [],
        commandCentreHref: "/today",
      },
      intelligence: {
        activatedAt: new Date().toISOString(),
        profileId: "manufacturing",
        industryLabel: "manufacturing",
        councilStatus: "ready",
        advisorNames: ["A"],
        outcomeEngine: "ready",
        judgementFramework: "ready",
        briefGenerated: true,
        commandCentreHref: "/today",
        narrative: "Ready",
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveStudioSession(session);
    upsertLibraryEntry(session);
    const lib = listLibrary("org_demo");
    expect(lib).toHaveLength(1);
    expect(lib[0].briefGenerated).toBe(true);
    expect(lib[0].snapshotId).toBe(bundle.ingestion.snapshot!.meta.snapshotId);
  });
});
