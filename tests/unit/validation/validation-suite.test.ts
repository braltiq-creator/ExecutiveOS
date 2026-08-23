import { describe, expect, it, beforeEach } from "vitest";
import {
  createDiscoverySession,
  submitMinimumQuestions,
  runDiscovery,
  validateDiscovery,
  completeDiscovery,
  getValidationQueue,
  resetDiscoverySessions,
  saveDiscoverySession,
} from "@/onboarding";
import {
  buildValidationSuite,
  submitExecutiveFeedback,
  resetFeedbackStore,
  resetRecommendationStore,
  resetValidationHistory,
  measureDiscoveryCoverage,
  buildExecutiveMaturity,
  assessLearning,
  benchmarkTenant,
  confidenceBand,
} from "@/validation";
import { getM365ConnectionRegistry, resetM365ConnectionRegistry } from "@/providers/microsoft365";
import { getSimproConnectionRegistry, resetSimproConnectionRegistry } from "@/providers/simpro";
import { PRODUCTION_GRAPH_SCOPES } from "@/providers/microsoft365";
import { SIMPRO_OAUTH_SCOPES } from "@/providers/simpro";

describe("Executive Validation Suite", () => {
  beforeEach(() => {
    resetDiscoverySessions();
    resetFeedbackStore();
    resetRecommendationStore();
    resetValidationHistory();
    resetM365ConnectionRegistry();
    resetSimproConnectionRegistry();
  });

  async function seedTenant(tenantId = "tenant-northline") {
    let session = createDiscoverySession({
      tenantId,
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
      asOf: "2026-07-26T08:05:00.000Z",
    });
    const queue = getValidationQueue(session);
    if (queue[0]) {
      session = validateDiscovery(session, queue[0].id, "confirm");
    }
    session = completeDiscovery(session, "2026-07-26T08:12:00.000Z");
    saveDiscoverySession(session);

    getM365ConnectionRegistry().connect({
      executiveosTenantId: tenantId,
      microsoftTenantId: "m365-1",
      tokens: {
        accessToken: "a",
        refreshToken: "r",
        idToken: null,
        tokenType: "Bearer",
        expiresAt: "2026-07-26T12:00:00.000Z",
        scopes: [...PRODUCTION_GRAPH_SCOPES],
        tenantId: "m365-1",
      },
      userId: "admin",
      scopes: [...PRODUCTION_GRAPH_SCOPES],
      asOf: "2026-07-26T08:00:00.000Z",
    });
    await getM365ConnectionRegistry().sync({
      executiveosTenantId: tenantId,
      mode: "full",
      asOf: "2026-07-26T08:10:00.000Z",
    });

    getSimproConnectionRegistry().connect({
      executiveosTenantId: tenantId,
      companyId: "simpro-1",
      credentials: {
        strategy: "api_key",
        apiKeyRef: "vault:k",
        apiKey: "k",
      },
      userId: "admin",
      scopes: [...SIMPRO_OAUTH_SCOPES],
      asOf: "2026-07-26T08:00:00.000Z",
    });
    await getSimproConnectionRegistry().sync({
      executiveosTenantId: tenantId,
      mode: "full",
      asOf: "2026-07-26T08:10:00.000Z",
    });

    return session;
  }

  it("builds an explained Executive Intelligence Score with gaps", async () => {
    await seedTenant();
    const dashboard = buildValidationSuite({
      tenantId: "tenant-northline",
      asOf: "2026-07-26T09:00:00.000Z",
    });

    expect(dashboard.executiveIntelligenceScore.score).toBeGreaterThan(0);
    expect(dashboard.executiveIntelligenceScore.explanation.length).toBeGreaterThan(20);
    expect(dashboard.maturity.components.organisation_understanding.evidence.length).toBeGreaterThan(0);
    expect(dashboard.coverage.dimensions.length).toBeGreaterThan(8);
    expect(dashboard.providers.providers.map((p) => p.providerId)).toEqual(
      expect.arrayContaining(["microsoft365", "simpro"]),
    );
    expect(dashboard.graphHealth.entities).toBeGreaterThan(0);
    expect(dashboard.history.daily.length).toBeGreaterThan(0);
    expect(dashboard.dailyImprovements.length).toBeGreaterThan(0);
  });

  it("lets executives identify gaps and improve confidence via feedback", async () => {
    await seedTenant();
    const before = buildValidationSuite({
      tenantId: "tenant-northline",
      asOf: "2026-07-26T09:00:00.000Z",
    });
    expect(before.outstandingValidationRequests.length).toBeGreaterThan(0);

    submitExecutiveFeedback({
      tenantId: "tenant-northline",
      kind: "useful",
      subject: "Today briefing",
      asOf: "2026-07-26T09:01:00.000Z",
    });
    submitExecutiveFeedback({
      tenantId: "tenant-northline",
      kind: "useful",
      subject: "Capacity signal",
      asOf: "2026-07-26T09:02:00.000Z",
    });

    const after = buildValidationSuite({
      tenantId: "tenant-northline",
      asOf: "2026-07-26T09:05:00.000Z",
    });
    expect(after.executiveIntelligenceScore.score).toBeGreaterThanOrEqual(
      before.executiveIntelligenceScore.score,
    );
    expect(confidenceBand(after.executiveIntelligenceScore.score)).toMatch(
      /high|medium|low/,
    );
  });

  it("tracks learning history and recommendation quality for Design Partners", async () => {
    await seedTenant();
    const dashboard = buildValidationSuite({
      tenantId: "tenant-northline",
      asOf: "2026-07-26T09:00:00.000Z",
    });

    expect(dashboard.recommendationQuality.generated).toBeGreaterThan(0);
    expect(dashboard.recommendationQuality.usefulnessPct).toBeGreaterThanOrEqual(0);
    expect(dashboard.successMetrics.connectorUptimePct).toBeGreaterThan(0);
    expect(dashboard.tenantHealth.overallReadiness.score).toBeGreaterThan(0);

    const learning = assessLearning({
      history: dashboard.history.daily,
      graphGrowth: dashboard.graphHealth.growth,
      feedbackCount: 1,
      validationsCompleted: 1,
    });
    expect(learning.trend).toMatch(/up|flat|down/);

    const bench = benchmarkTenant({
      tenantId: "tenant-northline",
      overallScore: dashboard.executiveIntelligenceScore.score,
    });
    expect(bench.peerPercentile).toBeGreaterThan(0);
  });

  it("isolates coverage measurement per tenant", async () => {
    await seedTenant("tenant-a");
    const coverageA = measureDiscoveryCoverage({
      tenantId: "tenant-a",
      asOf: "2026-07-26T09:00:00.000Z",
      discoveries: [],
    });
    const coverageB = measureDiscoveryCoverage({
      tenantId: "tenant-b",
      asOf: "2026-07-26T09:00:00.000Z",
      discoveries: [],
    });
    expect(coverageA.tenantId).toBe("tenant-a");
    expect(coverageB.tenantId).toBe("tenant-b");

    // Maturity explanations remain present even with empty discovery
    const empty = buildValidationSuite({
      tenantId: "tenant-empty",
      asOf: "2026-07-26T09:00:00.000Z",
    });
    expect(empty.maturity.overall.explanation).toBeTruthy();
    void buildExecutiveMaturity;
  });
});
