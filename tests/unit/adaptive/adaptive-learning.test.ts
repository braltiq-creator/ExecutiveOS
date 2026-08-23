import { describe, expect, it, beforeEach } from "vitest";
import {
  resetAdaptivePlatform,
  ensureAdaptiveProfile,
  recordAdaptiveBehaviour,
  captureExecutiveFeedback,
  buildPersonalisationPlan,
  rankRecommendationsForExecutive,
  attachAdaptiveLearningToTodayActions,
  computeBenchmarkPercentiles,
  identifyImprovementOpportunities,
  feedImprovementsToProductIntelligence,
  viewLearnedPreferences,
  disableAdaptiveLearning,
  resetAdaptiveProfile,
  listLearningHistory,
  buildAdaptiveDashboard,
  runAdaptiveLearningCycle,
  getRecommendationLearning,
} from "@/adaptive";
import { buildExecutiveSnapshotForUi } from "@/intelligence/executive-intelligence";
import { MOCK_OUTCOME_PORTFOLIO } from "@/lib/outcomes/mock-portfolio";

describe("Continuous Intelligence & Adaptive Learning", () => {
  beforeEach(() => {
    resetAdaptivePlatform();
  });

  const tenantId = "tenant-adaptive-a";
  const executiveId = "exec-1";
  const profileId = "operations_executive" as const;

  it("builds an explainable adaptive executive profile from behaviour", () => {
    ensureAdaptiveProfile({ tenantId, executiveId, profileId });
    recordAdaptiveBehaviour({
      tenantId,
      executiveId,
      profileId,
      kind: "brief_open",
    });
    recordAdaptiveBehaviour({
      tenantId,
      executiveId,
      profileId,
      kind: "explanation_expand",
    });
    recordAdaptiveBehaviour({
      tenantId,
      executiveId,
      profileId,
      kind: "explanation_expand",
    });
    recordAdaptiveBehaviour({
      tenantId,
      executiveId,
      profileId,
      kind: "explanation_expand",
    });
    captureExecutiveFeedback({
      tenantId,
      executiveId,
      profileId,
      recommendationId: "rec-1",
      disposition: "accepted",
    });

    const learned = viewLearnedPreferences({
      tenantId,
      executiveId,
      profileId,
    });
    expect(learned.profile.explanations.length).toBeGreaterThan(0);
    expect(learned.profile.preferredDetailLevel).toBe("deep");
    expect(learned.profile.recommendationAcceptanceRate).toBeGreaterThan(0);
    expect(learned.preferences.some((p) => p.key === "detail_level")).toBe(
      true,
    );
  });

  it("learns recommendation dispositions and ranks without changing Core ids", () => {
    const snapshot = buildExecutiveSnapshotForUi(MOCK_OUTCOME_PORTFOLIO);
    const ids = snapshot.recommendedActions.map((a) => a.id);
    expect(ids.length).toBeGreaterThan(0);

    const first = ids[0]!;
    const second = ids[1] ?? first;

    captureExecutiveFeedback({
      tenantId,
      executiveId,
      profileId,
      recommendationId: second,
      disposition: "accepted",
    });
    captureExecutiveFeedback({
      tenantId,
      executiveId,
      profileId,
      recommendationId: second,
      disposition: "roi_confirmed",
    });
    captureExecutiveFeedback({
      tenantId,
      executiveId,
      profileId,
      recommendationId: first,
      disposition: "ignored",
    });

    const learning = getRecommendationLearning(tenantId, second);
    expect(learning?.priorityBoost).toBeGreaterThan(0);
    expect(learning?.explanation).toMatch(/Core recommendation unchanged/);

    const plan = buildPersonalisationPlan({
      tenantId,
      executiveId,
      profileId,
    });
    const ranked = rankRecommendationsForExecutive({
      tenantId,
      executiveId,
      actions: snapshot.recommendedActions,
      plan,
    });
    expect(ranked.map((a) => a.id).sort()).toEqual([...ids].sort());
    expect(ranked[0]?.id).toBe(second);

    const attached = attachAdaptiveLearningToTodayActions(
      snapshot,
      tenantId,
      profileId,
      executiveId,
    );
    expect(attached.recommendedActions[0]?.adaptiveExplanation).toBeTruthy();
  });

  it("supports governance reset/disable and anonymised benchmarks", () => {
    runAdaptiveLearningCycle({ tenantId, executiveId, profileId });
    captureExecutiveFeedback({
      tenantId,
      executiveId,
      profileId,
      recommendationId: "rec-x",
      disposition: "ignored",
    });
    captureExecutiveFeedback({
      tenantId,
      executiveId,
      profileId,
      recommendationId: "rec-x",
      disposition: "ignored",
    });

    const benchmarks = computeBenchmarkPercentiles({ tenantId });
    expect(benchmarks.length).toBe(6);
    expect(benchmarks[0]?.explanation).toMatch(/No customer identities/);

    const improvements = identifyImprovementOpportunities({ tenantId });
    expect(improvements.length).toBeGreaterThan(0);
    expect(
      feedImprovementsToProductIntelligence(improvements).length,
    ).toBeGreaterThan(0);

    disableAdaptiveLearning({ tenantId, executiveId });
    expect(
      viewLearnedPreferences({ tenantId, executiveId, profileId }).enabled,
    ).toBe(false);

    const reset = resetAdaptiveProfile({
      tenantId,
      executiveId,
      profileId,
    });
    expect(reset.learningConfidence).toBe(40);
    expect(listLearningHistory({ tenantId, executiveId }).length).toBeGreaterThan(
      0,
    );

    const dashboard = buildAdaptiveDashboard();
    expect(dashboard.profiles.length).toBeGreaterThan(0);
    expect(dashboard.learningHealth).toBeGreaterThanOrEqual(0);
  });
});
