import { describe, expect, it, beforeEach } from "vitest";
import {
  resetOrganisationalMemory,
  recordMemoryEpisode,
  recordMemoryDecision,
  captureLesson,
  searchLessons,
  detectMemoryPatterns,
  recallOrganisationalMemory,
  evolvePlaybooksFromExperience,
  buildOrganisationalTimeline,
  buildMemoryDashboard,
  attachMemoryRecallToTodayActions,
  assertMemoryPayload,
  buildAnonymisedMemoryPortfolio,
  measureMemoryGrowth,
} from "@/memory";
import { buildExecutiveSnapshotForUi } from "@/intelligence/executive-intelligence";
import { MOCK_OUTCOME_PORTFOLIO } from "@/lib/outcomes/mock-portfolio";

describe("Executive Organisational Memory Engine", () => {
  beforeEach(() => {
    resetOrganisationalMemory();
  });

  const tenantId = "tenant-memory-a";
  const otherTenant = "tenant-memory-b";

  it("records episodes and significant decision history", () => {
    const episode = recordMemoryEpisode({
      tenantId,
      profileId: "operations_executive",
      name: "Customer at risk intervention",
      businessQuestion: "Which customers are at risk?",
      context: "Delivery delays threatened a strategic customer",
      scenarioId: "ops-customers-at-risk",
      decision: "Executive called customer sponsor",
      actionsTaken: ["Contacted strategic customer"],
      observedOutcome: "Relationship stabilised",
      lessonsLearned: ["Call early when delivery slips twice"],
      participants: ["CEO", "Account lead"],
      confidence: 80,
    });

    const decision = recordMemoryDecision({
      tenantId,
      kind: "major_customer_intervention",
      title: "Strategic customer intervention",
      profileId: "operations_executive",
      summary: "CEO outreach after repeated delivery risk",
      decidedBy: "CEO",
      scenarioId: "ops-customers-at-risk",
      episodeId: episode.id,
      businessEvidence: ["Customer risk signal", "Two delayed jobs"],
    });

    expect(episode.id).toBeTruthy();
    expect(decision.episodeId).toBe(episode.id);
    expect(decision.businessEvidence.length).toBeGreaterThan(0);
  });

  it("builds timeline and detects recurring patterns", () => {
    recordMemoryEpisode({
      tenantId,
      profileId: "operations_executive",
      name: "Capacity shortage A",
      businessQuestion: "Where is operational capacity constrained?",
      context: "Capacity shortage in west region",
      scenarioId: "ops-capacity-constrained",
      timestamp: "2026-07-10T08:00:00.000Z",
    });
    recordMemoryEpisode({
      tenantId,
      profileId: "operations_executive",
      name: "Capacity shortage B",
      businessQuestion: "Where is operational capacity constrained?",
      context: "Capacity shortage returned in west region",
      scenarioId: "ops-capacity-constrained",
      timestamp: "2026-07-18T08:00:00.000Z",
    });

    const timeline = buildOrganisationalTimeline(tenantId);
    expect(timeline.length).toBeGreaterThanOrEqual(2);

    const patterns = detectMemoryPatterns(tenantId);
    expect(patterns.some((p) => p.kind === "capacity_shortage")).toBe(true);
    expect(
      patterns.find((p) => p.kind === "capacity_shortage")!.occurrenceCount,
    ).toBeGreaterThanOrEqual(2);
  });

  it("captures searchable lessons and evolves living playbooks", () => {
    const episode = recordMemoryEpisode({
      tenantId,
      profileId: "commercial_executive",
      name: "Forecast recovery",
      businessQuestion: "How has forecast confidence changed?",
      context: "Forecast confidence declined; leadership challenged commit",
      scenarioId: "com-forecast-confidence",
    });
    captureLesson({
      tenantId,
      episodeId: episode.id,
      whatWorked: ["Weekly forecast challenge"],
      whatFailed: ["Waiting until month-end"],
      futureRecommendations: ["Challenge mid-month when confidence drops"],
      tags: ["forecast"],
    });

    expect(searchLessons({ tenantId, query: "forecast" }).length).toBe(1);

    const playbooks = evolvePlaybooksFromExperience(tenantId);
    expect(playbooks.some((p) => p.kind === "forecast_recovery")).toBe(true);
    expect(
      playbooks.find((p) => p.kind === "forecast_recovery")!.steps.length,
    ).toBeGreaterThan(0);
  });

  it("recalls similar situations with supporting evidence", () => {
    recordMemoryEpisode({
      tenantId,
      profileId: "operations_executive",
      name: "Safety escalation last quarter",
      businessQuestion: "What safety issues require escalation?",
      context: "Safety hazard on site required executive escalation",
      scenarioId: "ops-safety-escalation",
      lessonsLearned: ["Escalate immediately when severity is high"],
      observedOutcome: "Hazard contained",
      participants: ["COO", "HSE lead"],
    });
    recordMemoryDecision({
      tenantId,
      kind: "executive_escalation",
      title: "Safety escalation decision",
      profileId: "operations_executive",
      summary: "Stopped work until hazard cleared",
      decidedBy: "COO",
      scenarioId: "ops-safety-escalation",
      businessEvidence: ["Safety signal"],
    });

    const recall = recallOrganisationalMemory({
      tenantId,
      query: "What safety issues require escalation?",
    });

    expect(recall.similarEpisodes.length).toBeGreaterThan(0);
    expect(recall.previousDecisions.length).toBeGreaterThan(0);
    expect(recall.lessons.length).toBeGreaterThan(0);
    expect(recall.overallSimilarityConfidence).toBeGreaterThan(0);
    expect(recall.supportingEvidence.length).toBeGreaterThan(0);
  });

  it("attaches memory recall to Today recommendations", () => {
    recordMemoryEpisode({
      tenantId,
      profileId: "operations_executive",
      name: "Focus day success",
      businessQuestion: "What should I focus on today?",
      context: "Executive followed Today priority and cleared bottleneck",
      scenarioId: "ops-focus-today",
      lessonsLearned: ["Protect first 90 minutes for top action"],
      observedOutcome: "Top risk resolved before midday",
    });

    const snapshot = buildExecutiveSnapshotForUi(MOCK_OUTCOME_PORTFOLIO);
    const withMemory = attachMemoryRecallToTodayActions(
      {
        ...snapshot,
        recommendedActions: snapshot.recommendedActions.map((a) => ({
          ...a,
          businessQuestion: "What should I focus on today?",
        })),
      },
      tenantId,
      "operations_executive",
    );

    const withRecall = withMemory.recommendedActions.filter(
      (a) => (a.previousSituations?.length ?? 0) > 0,
    );
    expect(withRecall.length).toBeGreaterThan(0);
    expect(withRecall[0]?.similarityConfidence).toBeGreaterThan(0);
    expect(withRecall[0]?.lessonsLearned?.length).toBeGreaterThan(0);
  });

  it("builds admin dashboard with growth and recall quality", () => {
    recordMemoryEpisode({
      tenantId,
      profileId: "operations_executive",
      name: "Bottleneck cleared",
      businessQuestion: "Where is operational capacity constrained?",
      context: "Operational bottleneck resolved via reallocation",
    });
    recordMemoryEpisode({
      tenantId,
      profileId: "operations_executive",
      name: "Bottleneck again",
      businessQuestion: "Where is operational capacity constrained?",
      context: "Operational bottleneck returned",
    });
    recallOrganisationalMemory({
      tenantId,
      query: "capacity bottleneck",
    });

    const dashboard = buildMemoryDashboard({ tenantId });
    expect(dashboard.growth.episodeCount).toBe(2);
    expect(dashboard.playbooks.length).toBeGreaterThan(0);
    expect(dashboard.timeline.length).toBeGreaterThan(0);
    expect(measureMemoryGrowth(tenantId).explanation).toContain("episodes");
  });

  it("preserves tenant isolation for memory", () => {
    recordMemoryEpisode({
      tenantId,
      profileId: "operations_executive",
      name: "Tenant A only",
      businessQuestion: "What changed overnight?",
      context: "Secret A",
    });
    recordMemoryEpisode({
      tenantId: otherTenant,
      profileId: "commercial_executive",
      name: "Tenant B only",
      businessQuestion: "What changed overnight?",
      context: "Secret B",
    });

    const recallA = recallOrganisationalMemory({
      tenantId,
      query: "What changed overnight?",
    });
    expect(
      recallA.similarEpisodes.every((e) => e.name !== "Tenant B only"),
    ).toBe(true);

    assertMemoryPayload(recallA as unknown as Record<string, unknown>);

    const portfolio = buildAnonymisedMemoryPortfolio({
      tenantIds: [tenantId, otherTenant],
    });
    expect(portfolio.partnerCount).toBe(2);
    expect(JSON.stringify(portfolio)).not.toContain("Secret A");
    expect(JSON.stringify(portfolio)).not.toContain("Secret B");
  });
});
