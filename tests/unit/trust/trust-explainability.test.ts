import { describe, expect, it, beforeEach } from "vitest";
import {
  resetTrustFramework,
  attachTrustExplanationsToTodayActions,
  buildExplanationForAction,
  explainConfidence,
  buildReasoningPath,
  collectEvidenceForAction,
  recordExecutiveReview,
  buildExplanationAuditPack,
  buildTrustDashboard,
  assertTrustPayload,
  getExplanation,
  listExplanations,
  REVIEW_VERDICT_LABELS,
} from "@/trust";
import { buildExecutiveSnapshotForUi } from "@/intelligence/executive-intelligence";
import { MOCK_OUTCOME_PORTFOLIO } from "@/lib/outcomes/mock-portfolio";
import { actionToExperienceCard } from "@/experience/executive-brief/actionToCard";

describe("Trust & Explainability Framework", () => {
  beforeEach(() => {
    resetTrustFramework();
  });

  const tenantId = "tenant-trust-a";

  it("builds a reusable Explanation with the full explainability model", () => {
    const action = {
      id: "rec-trust-1",
      title: "Rebalance capacity",
      why: "Delivery risk is rising",
      expectedOutcome: "Protect on-time delivery",
      href: "/decisions/rec-trust-1",
      businessQuestion: "Where should capacity move this week?",
      scenarioId: "ops-capacity-constrained",
      scenarioName: "Capacity constrained",
      evidence: ["Simpro at-risk jobs", "Calendar overload"],
      confidence: 62,
      supportsOutcome: "Improve operational reliability",
      supportsOutcomeId: "so-1",
      expectedImpact: "Reduce at-risk jobs",
      strategyConfidence: 70,
      strategyEvidence: ["Reliability operating rhythm"],
      previousSituations: ["Q3 capacity crunch"],
      potentialRisk: "Customer escalation",
    };

    const explanation = buildExplanationForAction({ tenantId, action });

    expect(explanation.recommendation).toBe(action.title);
    expect(explanation.executiveQuestion).toContain("capacity");
    expect(explanation.strategicOutcome).toBe(action.supportsOutcome);
    expect(explanation.scenario).toBe(action.scenarioName);
    expect(explanation.evidenceSources.length).toBeGreaterThan(0);
    expect(explanation.reasoningPath.map((s) => s.id)).toEqual([
      "question",
      "evidence",
      "business_events",
      "scenario",
      "strategic_outcome",
      "council",
      "recommendation",
      "expected_outcome",
    ]);
    expect(explanation.confidence.score).toBeGreaterThan(0);
    expect(explanation.assumptions.length).toBeGreaterThan(0);
    expect(explanation.relatedMemoryEpisodes).toContain("Q3 capacity crunch");
    expect(explanation.alternativeInterpretations.length).toBeGreaterThan(0);
    expect(explanation.recommendedAction).toBe("Reduce at-risk jobs");
    expect(explanation.expectedOutcome).toBe("Reduce at-risk jobs");
    expect(getExplanation(explanation.id)?.id).toBe(explanation.id);
  });

  it("never leaves a recommendation without evidence", () => {
    const evidence = collectEvidenceForAction(
      {
        id: "bare",
        title: "Bare recommendation",
        why: "Core rationale only",
        expectedOutcome: "Clarity",
        href: "/decisions/bare",
      },
      new Date().toISOString(),
    );
    expect(evidence.length).toBeGreaterThanOrEqual(1);
    expect(assertTrustPayload({ evidenceCount: evidence.length }).ok).toBe(true);
  });

  it("explains high and lower confidence with reasons", () => {
    const rich = explainConfidence({
      action: {
        id: "r1",
        title: "Rich",
        why: "why",
        expectedOutcome: "out",
        href: "/x",
        confidence: 68,
        strategyConfidence: 72,
        supportsOutcome: "Reliability",
        scenarioId: "ops-1",
        previousSituations: ["Prior episode"],
        evidence: ["a", "b"],
        strategyEvidence: ["c"],
      },
      evidence: [
        {
          id: "1",
          label: "a",
          provider: "simpro",
          timestamp: new Date().toISOString(),
          confidence: 70,
        },
        {
          id: "2",
          label: "b",
          provider: "organisational_memory",
          timestamp: new Date().toISOString(),
          confidence: 65,
        },
        {
          id: "3",
          label: "c",
          provider: "strategy",
          timestamp: new Date().toISOString(),
          confidence: 70,
        },
      ],
    });
    expect(rich.band).toBe("high");
    expect(rich.reasonsFor.length).toBeGreaterThan(0);

    const thin = explainConfidence({
      action: {
        id: "r2",
        title: "Thin",
        why: "why",
        expectedOutcome: "out",
        href: "/x",
        confidence: 40,
      },
      evidence: [
        {
          id: "1",
          label: "baseline",
          provider: "system",
          timestamp: new Date().toISOString(),
          confidence: 40,
        },
      ],
    });
    expect(thin.band).not.toBe("high");
    expect(thin.reasonsAgainst.length).toBeGreaterThan(0);
  });

  it("attaches trust fields to Today actions and experience cards", () => {
    const snapshot = buildExecutiveSnapshotForUi(MOCK_OUTCOME_PORTFOLIO);
    const withTrust = attachTrustExplanationsToTodayActions(snapshot, tenantId);

    expect(withTrust.recommendedActions.length).toBeGreaterThan(0);
    for (const action of withTrust.recommendedActions) {
      expect(action.explanationId).toBeTruthy();
      expect(action.whyWeBelieveThis).toBeTruthy();
      expect(action.confidenceExplanation).toBeTruthy();
      expect(action.evidenceSummary?.length).toBeGreaterThan(0);
      expect(action.decisionPathLabels?.length).toBe(8);
      expect(action.confidence).toBeGreaterThan(0);

      const card = actionToExperienceCard(action, tenantId);
      expect(card.trustAction?.explanationId).toBe(action.explanationId);
      expect(card.expectedImpact).toBeTruthy();
    }

    expect(listExplanations(tenantId).length).toBe(
      withTrust.recommendedActions.length,
    );
  });

  it("records executive review and builds an audit pack", () => {
    const explanation = buildExplanationForAction({
      tenantId,
      action: {
        id: "rec-review",
        title: "Call strategic account",
        why: "Retention risk",
        expectedOutcome: "Protect revenue",
        href: "/decisions/rec-review",
        evidence: ["CRM risk flag"],
      },
    });

    const review = recordExecutiveReview({
      tenantId,
      explanationId: explanation.id,
      recommendationId: explanation.recommendationId,
      verdict: "needs_more_evidence",
      note: "Need customer sentiment",
    });

    expect(REVIEW_VERDICT_LABELS[review.verdict]).toBe("Needs more evidence");

    const pack = buildExplanationAuditPack(explanation.id);
    expect(pack.explanation?.id).toBe(explanation.id);
    expect(pack.evidenceHistory.length).toBeGreaterThan(0);
    expect(pack.reasoningHistory.length).toBe(8);
    expect(pack.reviews[0]?.verdict).toBe("needs_more_evidence");
    expect(pack.auditTrail.length).toBeGreaterThanOrEqual(0);

    const path = buildReasoningPath({
      action: {
        id: explanation.recommendationId,
        title: explanation.recommendation,
        why: explanation.whyItMatters,
        expectedOutcome: explanation.expectedOutcome,
        href: "/x",
      },
      evidence: explanation.evidenceSources,
      expectedOutcome: explanation.expectedOutcome,
    });
    expect(path[0]?.id).toBe("question");
    expect(path.at(-1)?.id).toBe("expected_outcome");

    const dashboard = buildTrustDashboard({ tenantId });
    expect(dashboard.explanationCount).toBeGreaterThan(0);
    expect(dashboard.reviewCount).toBe(1);
    expect(dashboard.governance.requireEvidence).toBe(true);
  });
});
