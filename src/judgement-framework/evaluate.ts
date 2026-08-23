/**
 * Apply a role's judgement model to factor readings → posture state.
 * This is judgement (whether/how to act), not EIM reasoning.
 */

import { factorIntensityContribution } from "@/judgement-framework/factors";
import { getJudgementState } from "@/judgement-framework/states";
import type {
  FactorBundle,
  JudgementFactorId,
  JudgementStateId,
  ResolvedExecutiveJudgementModel,
  RoleJudgementAssessment,
} from "@/judgement-framework/types";
import { JUDGEMENT_FACTORS } from "@/judgement-framework/types";

function clamp(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(100, n));
}

function reading(bundle: FactorBundle, id: JudgementFactorId, fallback = 50): number {
  const value = bundle[id];
  return typeof value === "number" ? clamp(value) : fallback;
}

/** Role-weighted peak of the factors this executive privileges for force. */
export function roleForcePeak(
  model: ResolvedExecutiveJudgementModel,
  factors: FactorBundle,
): number {
  const forceFactors: JudgementFactorId[] = [
    "risk",
    "business_impact",
    "stakeholder_impact",
    "cost_of_delay",
    "urgency",
  ];
  const weightMap = new Map(model.factorWeights.map((w) => [w.factor, w.weight]));
  let peak = 0;
  for (const id of forceFactors) {
    const w = weightMap.get(id) ?? 0.3;
    const adjusted = reading(factors, id) * (0.55 + 0.45 * Math.min(1, w));
    peak = Math.max(peak, adjusted);
  }
  // Primary-factor emphasis (e.g. CRO opportunity can force action)
  for (const id of model.primaryFactors) {
    if (id === "confidence" || id === "evidence_quality" || id === "reversibility") {
      continue;
    }
    peak = Math.max(peak, reading(factors, id) * 0.92);
  }
  return clamp(peak + model.actionBias * 0.35);
}

export function scoreJudgementIntensity(
  model: ResolvedExecutiveJudgementModel,
  factors: FactorBundle,
): number {
  const totalWeight = model.factorWeights.reduce((sum, w) => sum + w.weight, 0) || 1;
  let weighted = 0;
  for (const w of model.factorWeights) {
    const value = reading(factors, w.factor);
    weighted += factorIntensityContribution(w.factor, value) * (w.weight / totalWeight);
  }
  return clamp(weighted + model.actionBias);
}

export function selectJudgementState(
  model: ResolvedExecutiveJudgementModel,
  factors: FactorBundle,
  intensity: number,
): JudgementStateId {
  const risk = reading(factors, "risk");
  const impact = reading(factors, "business_impact");
  const urgency = reading(factors, "urgency");
  const confidence = reading(factors, "confidence");
  const evidence = reading(factors, "evidence_quality");
  const complexity = reading(factors, "decision_complexity");
  const reversibility = reading(factors, "reversibility");
  const costOfDelay = reading(factors, "cost_of_delay");
  const strategic = reading(factors, "strategic_importance");
  const opportunity = reading(factors, "opportunity");

  const forcePeak = roleForcePeak(model, factors);

  if (
    forcePeak >= model.crisisForceThreshold ||
    (risk >= 88 && urgency >= 85 && model.primaryFactors.includes("risk"))
  ) {
    return "crisis";
  }

  if (
    forcePeak >= model.escalateForceThreshold ||
    (costOfDelay >= 82 &&
      risk >= 68 &&
      model.primaryFactors.includes("risk") &&
      model.actionBias >= 6)
  ) {
    return "escalate";
  }

  const materialForRole =
    intensity >= 52 ||
    model.primaryFactors.some((id) => reading(factors, id) >= 62);

  const readyToRecommend =
    confidence >= model.recommendConfidenceFloor &&
    evidence >= model.recommendConfidenceFloor - 8 &&
    materialForRole;

  if (
    materialForRole &&
    reversibility <= 32 &&
    complexity >= 55 &&
    !readyToRecommend &&
    forcePeak >= 50
  ) {
    return "challenge";
  }

  // High strategic / complex fog → Investigate (CEO/CSO pattern)
  if (
    materialForRole &&
    (confidence < model.recommendConfidenceFloor ||
      evidence < model.recommendConfidenceFloor - 12 ||
      (complexity >= 68 && strategic >= 55) ||
      (model.primaryFactors.includes("strategic_importance") &&
        strategic >= 60 &&
        confidence < model.recommendConfidenceFloor + 5))
  ) {
    // Execution-biased roles (negative actionBias) may Monitor when force is
    // real for peers but ops heat is not yet at their intervention bar.
    const opsHeat = Math.max(urgency, complexity, reading(factors, "risk") * 0.5);
    if (
      model.actionBias < 0 &&
      forcePeak < model.escalateForceThreshold - 6 &&
      opsHeat < 62 &&
      !readyToRecommend
    ) {
      return "monitor";
    }
    return "investigate";
  }

  if (readyToRecommend) {
    return "recommend";
  }

  // Opportunity-led recommend path for growth roles with decent confidence
  if (
    opportunity >= 70 &&
    confidence >= model.recommendConfidenceFloor - 5 &&
    model.primaryFactors.includes("opportunity")
  ) {
    return "recommend";
  }

  if (intensity >= 36 || forcePeak >= 40 || impact >= 40) {
    return "monitor";
  }

  return "observe";
}

export function evaluateRoleJudgement(
  model: ResolvedExecutiveJudgementModel,
  factors: FactorBundle,
): RoleJudgementAssessment {
  const intensity = scoreJudgementIntensity(model, factors);
  const state = selectJudgementState(model, factors, intensity);
  const def = getJudgementState(state);
  const confidence = reading(factors, "confidence");
  const evidenceQuality = reading(factors, "evidence_quality");

  const scored = model.primaryFactors.map((id) => ({
    id,
    value: reading(factors, id),
  }));
  scored.sort((a, b) => b.value - a.value);
  const primaryDrivers = scored.slice(0, 3).map((s) => s.id);

  const rationale: string[] = [
    `${model.title} judgement identity: ${model.judgementIdentity}`,
    `Intensity ${Math.round(intensity)}; role force peak ${Math.round(roleForcePeak(model, factors))}.`,
    `State ${def.label}: ${def.purpose}`,
    `Confidence ${Math.round(confidence)} vs recommend floor ${model.recommendConfidenceFloor}.`,
    `Thresholds — escalate ${model.escalateForceThreshold}, crisis ${model.crisisForceThreshold}.`,
  ];

  for (const id of primaryDrivers) {
    const note = factors.notes?.[id];
    rationale.push(
      `Driver ${id}=${Math.round(reading(factors, id))}${note ? ` (${note})` : ""}.`,
    );
  }

  const withholdsRecommendation = state === "observe" || state === "monitor";

  return {
    roleId: model.roleId,
    state,
    stateLabel: def.label,
    intensity,
    confidence,
    evidenceQuality,
    primaryDrivers,
    rationale,
    withholdsRecommendation,
    mayEscalateAlone: state === "escalate" || state === "crisis",
    industry: model.industry,
  };
}

/** Factors missing from a bundle (defaults will apply). */
export function missingFactors(factors: FactorBundle): JudgementFactorId[] {
  return JUDGEMENT_FACTORS.filter((id) => typeof factors[id] !== "number");
}
