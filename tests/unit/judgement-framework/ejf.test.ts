import { describe, expect, it } from "vitest";
import {
  JUDGEMENT_FACTORS,
  JUDGEMENT_STATES,
  applyJudgementOverlay,
  formCouncilJudgement,
  getExecutiveJudgementModel,
  getJudgementOverlay,
  judgeAsCouncil,
  judgeAsExecutive,
  listExecutiveJudgementModels,
  refineJudgementThresholds,
  resolveExecutiveJudgement,
  reviewExecutiveJudgementFramework,
  type FactorBundle,
  type RoleJudgementAssessment,
} from "@/judgement-framework";

/** Cash / exposure hot; ops heat moderate; confidence soft — mission pattern. */
const MISSION_FACTORS: FactorBundle = {
  business_impact: 72,
  urgency: 48,
  confidence: 48,
  evidence_quality: 46,
  outcome_alignment: 60,
  strategic_importance: 64,
  risk: 76,
  opportunity: 35,
  cost_of_delay: 84,
  reversibility: 40,
  decision_complexity: 58,
  stakeholder_impact: 55,
  notes: {
    risk: "Cash exposure and commitment timing",
    cost_of_delay: "Funding window closing",
    urgency: "Ops not yet in breach",
  },
};

describe("Executive Judgement Framework (Phase 51)", () => {
  it("defines seven states and twelve factors", () => {
    expect(Object.keys(JUDGEMENT_STATES)).toHaveLength(7);
    expect(JUDGEMENT_FACTORS).toHaveLength(12);
  });

  it("registers judgement models for all intelligence roles", () => {
    const models = listExecutiveJudgementModels();
    expect(models).toHaveLength(10);
    for (const model of models) {
      expect(model.mayWithholdRecommendation).toBe(true);
      expect(model.primaryFactors.length).toBeGreaterThan(0);
      expect(model.factorWeights.length).toBeGreaterThan(0);
    }
  });

  it("distinguishes judgement identity from mere role title", () => {
    const ceo = getExecutiveJudgementModel("ceo");
    expect(ceo?.judgementIdentity.toLowerCase()).toContain("enterprise");
    const cfo = getExecutiveJudgementModel("cfo");
    expect(cfo?.judgementIdentity.toLowerCase()).toMatch(/cash|capital|exposure/);
  });

  it("allows executives to withhold recommendation (Observe/Monitor)", () => {
    const calm: FactorBundle = {
      business_impact: 20,
      urgency: 15,
      confidence: 70,
      evidence_quality: 70,
      outcome_alignment: 20,
      strategic_importance: 15,
      risk: 18,
      opportunity: 10,
      cost_of_delay: 12,
      reversibility: 80,
      decision_complexity: 20,
      stakeholder_impact: 15,
    };
    const ceo = judgeAsExecutive("ceo", calm);
    expect(["observe", "monitor"]).toContain(ceo.state);
    expect(ceo.withholdsRecommendation).toBe(true);
  });

  it("produces differing states for the mission cash-pressure scenario", () => {
    const cfo = judgeAsExecutive("cfo", MISSION_FACTORS);
    const coo = judgeAsExecutive("coo", MISSION_FACTORS);
    const ceo = judgeAsExecutive("ceo", MISSION_FACTORS);

    expect(cfo.state).toBe("escalate");
    expect(coo.state).toBe("monitor");
    expect(ceo.state).toBe("investigate");
  });

  it("preserves council dissent and consensus Investigate before decision", () => {
    const council = judgeAsCouncil(["cfo", "coo", "ceo"], MISSION_FACTORS, null, "test");

    expect(council.dissentingStates.map((d) => d.state).sort()).toEqual(
      ["escalate", "investigate", "monitor"].sort(),
    );
    expect(council.consensusState).toBe("investigate");
    expect(council.requiresInvestigationBeforeDecision).toBe(true);
    expect(council.escalateImmediately).toBe(false);
    expect(council.minority.length).toBeGreaterThanOrEqual(2);
    expect(council.consensusNarrative.toLowerCase()).toContain("investigate before decision");
  });

  it("does not average assessments into a single collapsed list", () => {
    const assessments: RoleJudgementAssessment[] = [
      {
        roleId: "cfo",
        state: "escalate",
        stateLabel: "Escalate",
        intensity: 80,
        confidence: 50,
        evidenceQuality: 50,
        primaryDrivers: ["risk"],
        rationale: [],
        withholdsRecommendation: false,
        mayEscalateAlone: true,
        industry: null,
      },
      {
        roleId: "coo",
        state: "monitor",
        stateLabel: "Monitor",
        intensity: 40,
        confidence: 50,
        evidenceQuality: 50,
        primaryDrivers: ["risk"],
        rationale: [],
        withholdsRecommendation: true,
        mayEscalateAlone: false,
        industry: null,
      },
    ];
    const council = formCouncilJudgement(assessments);
    expect(council.assessments).toHaveLength(2);
    expect(new Set(council.assessments.map((a) => a.state)).size).toBe(2);
  });

  it("industry overlays adjust thresholds only", () => {
    const base = resolveExecutiveJudgement("cfo");
    const overlaid = resolveExecutiveJudgement("cfo", "financial_services");
    const overlay = getJudgementOverlay("financial_services", "cfo");
    expect(overlay).toBeDefined();
    expect(overlaid.overlayApplied).toBe(true);
    expect(overlaid.judgementIdentity).toBe(base.judgementIdentity);
    expect(overlaid.primaryFactors).toEqual(base.primaryFactors);
    expect(overlaid.escalateForceThreshold).not.toBe(base.escalateForceThreshold);

    const frozen = applyJudgementOverlay(base, overlay!, "financial_services");
    expect(frozen.judgementIdentity).toBe(base.judgementIdentity);
  });

  it("learning refines thresholds from signals", () => {
    const refinement = refineJudgementThresholds("cfo", [
      {
        roleId: "cfo",
        metric: "false_negatives",
        delta: 1,
        observation: "Missed cash squeeze",
        asOf: "2026-08-08",
      },
      {
        roleId: "cfo",
        metric: "confidence_calibration",
        delta: -1,
        observation: "Overconfident on forecast",
        asOf: "2026-08-08",
      },
    ]);
    expect(refinement.escalateForceThresholdDelta).toBeLessThan(0);
    expect(refinement.recommendConfidenceFloorDelta).toBeGreaterThan(0);
    expect(refinement.rationale.length).toBeGreaterThan(0);
  });

  it("passes Phase 51 self-review", () => {
    const review = reviewExecutiveJudgementFramework();
    expect(review.distinguishesReasoningFromJudgement).toBe(true);
    expect(review.canWithholdRecommendation).toBe(true);
    expect(review.canHoldDifferingStates).toBe(true);
    expect(review.canImproveThroughLearning).toBe(true);
    expect(review.allPassed).toBe(true);
  });
});
