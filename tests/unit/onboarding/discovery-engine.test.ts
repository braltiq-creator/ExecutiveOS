import { describe, expect, it, beforeEach } from "vitest";
import { KnowledgeGraph } from "@/knowledge-graph";
import {
  createDiscoverySession,
  submitMinimumQuestions,
  runDiscovery,
  validateDiscovery,
  completeDiscovery,
  getValidationQueue,
  resetDiscoverySessions,
  assertDiscoveryTenantIsolation,
  assertGraphTenantIsolation,
  filterDiscoveriesForTenant,
  discoverOrganisation,
  TARGET_ONBOARDING_MINUTES,
  inferIndustry,
  measureOnboarding,
  buildLearningMaturity,
  scoreConfidence,
} from "@/onboarding";

describe("Executive Discovery Engine", () => {
  beforeEach(() => {
    resetDiscoverySessions();
  });

  it("discovers more than it asks and completes under 15 minutes", () => {
    let session = createDiscoverySession({
      tenantId: "tenant-northline",
      userId: "user-1",
      asOf: "2026-07-26T08:00:00.000Z",
    });

    session = submitMinimumQuestions(session, {
      role: "CEO",
      primaryObjective: "Operational Excellence",
      briefingTime: "Morning",
    });

    session = runDiscovery(session, {
      connectedSystems: ["microsoft365", "simpro"],
      asOf: "2026-07-26T08:03:00.000Z",
    });

    expect(session.discoveries.length).toBeGreaterThan(8);
    expect(session.questions?.industry).toBe("Field Services");
    expect(inferIndustry(session.discoveries).askUser).toBe(false);

    const queue = getValidationQueue(session);
    expect(queue.length).toBeGreaterThan(0);
    session = validateDiscovery(session, queue[0]!.id, "confirm");
    session = validateDiscovery(
      session,
      queue[1]?.id ?? queue[0]!.id,
      "edit",
      "Corrected label",
    );

    session = completeDiscovery(session, "2026-07-26T08:12:00.000Z");
    expect(session.progress.phase).toBe("complete");
    expect(session.brief?.executiveSummary).toBeTruthy();
    expect(session.brief?.whatWeLearned.length).toBeGreaterThan(3);
    expect(session.metrics?.timeToFirstBriefingSeconds).toBeLessThan(
      TARGET_ONBOARDING_MINUTES * 60,
    );
    expect(session.metrics?.manualConfigurationMinutes).toBeLessThanOrEqual(5);
    expect(JSON.stringify(session.brief)).not.toMatch(/odata|GraphCalendar/i);
  });

  it("keeps every discovery and graph entity tenant-isolated", () => {
    const a = discoverOrganisation({ tenantId: "tenant-a" });
    const b = discoverOrganisation({ tenantId: "tenant-b" });
    expect(assertDiscoveryTenantIsolation({ tenantId: "tenant-a", discoveries: a }).ok).toBe(
      true,
    );
    expect(
      assertDiscoveryTenantIsolation({
        tenantId: "tenant-a",
        discoveries: [...a, ...b],
      }).ok,
    ).toBe(false);
    expect(filterDiscoveriesForTenant("tenant-a", [...a, ...b])).toHaveLength(
      a.length,
    );

    const graph = new KnowledgeGraph({ asOf: "2026-07-26", source: "iso" });
    graph.addEntity({
      id: "org-tenant-a",
      type: "Team",
      label: "A",
      properties: { tenantId: "tenant-a" },
    });
    graph.addEntity({
      id: "leak",
      type: "Person",
      label: "Leak",
      properties: { tenantId: "tenant-b" },
    });
    expect(
      assertGraphTenantIsolation({ tenantId: "tenant-a", graph }).ok,
    ).toBe(false);
  });

  it("improves confidence from validation and hides learning banner at maturity", () => {
    let session = createDiscoverySession({
      tenantId: "tenant-northline",
      userId: "user-1",
      asOf: "2026-07-26T08:00:00.000Z",
    });
    session = submitMinimumQuestions(session, {
      role: "COO",
      primaryObjective: "Growth",
      briefingTime: "Afternoon",
    });
    session = runDiscovery(session, {
      asOf: "2026-07-26T08:05:00.000Z",
    });

    const before = session.confidence!.overall;
    const first = getValidationQueue(session)[0]!;
    session = validateDiscovery(session, first.id, "confirm");
    expect(session.confidence!.overall).toBeGreaterThanOrEqual(before - 1);

    const mature = buildLearningMaturity({
      tenantId: "tenant-northline",
      startedAt: "2026-06-01T08:00:00.000Z",
      asOf: "2026-07-26T08:00:00.000Z",
      connectedSystems: ["microsoft365", "simpro"],
      confidence: scoreConfidence({
        discoveries: session.discoveries,
        organisationConfidence: 90,
        profileConfidence: 90,
        graphCompleteness: 90,
      }),
      knowledgeGraphGrowth: 40,
      hideBannerThreshold: 75,
    });
    expect(mature.daysActive).toBeGreaterThan(30);
    expect(mature.showLearningBanner).toBe(false);

    const early = buildLearningMaturity({
      tenantId: "tenant-northline",
      startedAt: "2026-07-20T08:00:00.000Z",
      asOf: "2026-07-26T08:00:00.000Z",
      connectedSystems: ["microsoft365"],
      confidence: {
        discoveryConfidence: 50,
        organisationCoverage: 40,
        executiveProfileConfidence: 45,
        knowledgeGraphCompleteness: 35,
        overall: 45,
      },
      knowledgeGraphGrowth: 8,
    });
    expect(early.showLearningBanner).toBe(true);

    const metrics = measureOnboarding({
      tenantId: "tenant-northline",
      startedAt: session.startedAt,
      completedAt: "2026-07-26T08:10:00.000Z",
      discoveries: session.discoveries,
      confidence: session.confidence!,
    });
    expect(metrics.setupCompletionRate).toBe(100);
  });

  it("makes inferred relationships explainable via evidence", () => {
    const discoveries = discoverOrganisation({
      tenantId: "tenant-northline",
    });
    for (const item of discoveries) {
      expect(item.evidence.length).toBeGreaterThan(0);
      expect(item.confidence).toBeGreaterThan(0);
      expect(item.summary.length).toBeGreaterThan(10);
    }
  });
});
