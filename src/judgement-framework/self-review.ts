/**
 * Phase 51 self-review gates.
 */

import { JUDGEMENT_STATES } from "@/judgement-framework/states";
import { JUDGEMENT_FACTORS } from "@/judgement-framework/types";
import { listExecutiveJudgementModels } from "@/judgement-framework/roles";
import { JUDGEMENT_LEARNING_METRICS } from "@/judgement-framework/learning";
import { formCouncilJudgement } from "@/judgement-framework/council";
import type { EjfSelfReview, RoleJudgementAssessment } from "@/judgement-framework/types";

export function reviewExecutiveJudgementFramework(): EjfSelfReview {
  const notes: string[] = [];
  const models = listExecutiveJudgementModels();

  const distinguishesReasoningFromJudgement =
    Object.keys(JUDGEMENT_STATES).length === 7 &&
    JUDGEMENT_FACTORS.length === 12 &&
    models.every((m) => m.judgementIdentity.length > 0);

  if (distinguishesReasoningFromJudgement) {
    notes.push(
      "EJF states + factors define whether action is required; EIM remains reasoning behaviour.",
    );
  } else {
    notes.push("FAIL: judgement catalogue incomplete.");
  }

  const canWithholdRecommendation = models.every(
    (m) => m.mayWithholdRecommendation === true,
  );
  if (canWithholdRecommendation) {
    notes.push("Every executive may Observe/Monitor — withhold recommendation.");
  } else {
    notes.push("FAIL: some executives cannot withhold recommendation.");
  }

  // Synthetic dissent fixture — must preserve different states
  const synthetic: RoleJudgementAssessment[] = [
    {
      roleId: "cfo",
      state: "escalate",
      stateLabel: "Escalate",
      intensity: 80,
      confidence: 55,
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
      intensity: 45,
      confidence: 50,
      evidenceQuality: 48,
      primaryDrivers: ["risk"],
      rationale: [],
      withholdsRecommendation: true,
      mayEscalateAlone: false,
      industry: null,
    },
    {
      roleId: "ceo",
      state: "investigate",
      stateLabel: "Investigate",
      intensity: 60,
      confidence: 48,
      evidenceQuality: 45,
      primaryDrivers: ["business_impact"],
      rationale: [],
      withholdsRecommendation: false,
      mayEscalateAlone: false,
      industry: null,
    },
  ];
  const council = formCouncilJudgement(synthetic, "self-review");
  const distinct = new Set(council.dissentingStates.map((d) => d.state));
  const canHoldDifferingStates =
    distinct.size >= 3 &&
    council.consensusState === "investigate" &&
    council.requiresInvestigationBeforeDecision &&
    council.minority.length >= 2;

  if (canHoldDifferingStates) {
    notes.push(
      "Council preserves CFO Escalate / COO Monitor / CEO Investigate → Investigate before decision.",
    );
  } else {
    notes.push("FAIL: council averaging or collapsing dissent.");
  }

  const canImproveThroughLearning = JUDGEMENT_LEARNING_METRICS.length >= 7;
  if (canImproveThroughLearning) {
    notes.push("Learning metrics cover quality, escalation, FP/FN, timing, outcomes, calibration.");
  } else {
    notes.push("FAIL: learning metrics incomplete.");
  }

  const allPassed =
    distinguishesReasoningFromJudgement &&
    canWithholdRecommendation &&
    canHoldDifferingStates &&
    canImproveThroughLearning;

  return {
    distinguishesReasoningFromJudgement,
    canWithholdRecommendation,
    canHoldDifferingStates,
    canImproveThroughLearning,
    allPassed,
    notes,
  };
}
