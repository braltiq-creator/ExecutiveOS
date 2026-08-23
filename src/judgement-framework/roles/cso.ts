import { defineExecutiveJudgement } from "@/judgement-framework/define";
import { EJF_V1, weights } from "@/judgement-framework/roles/helpers";

/** CSO — strategic drift, competitive positioning, future capability */
export const csoJudgement = defineExecutiveJudgement({
  version: EJF_V1,
  roleId: "cso",
  title: "Chief Strategy Officer",
  judgementIdentity:
    "Judge whether strategic drift, competitive position, or future capability requires challenge or investigation — often before others feel urgency.",
  primaryFactors: [
    "strategic_importance",
    "opportunity",
    "outcome_alignment",
    "decision_complexity",
  ],
  factorWeights: weights([
    ["strategic_importance", 1.0, "Drift and position first"],
    ["opportunity", 0.85, "Future optionality"],
    ["outcome_alignment", 0.85, "Strategy vs committed outcomes"],
    ["decision_complexity", 0.8, "Coupled strategic choices"],
    ["evidence_quality", 0.75, "Weak strategy evidence → challenge"],
    ["confidence", 0.7, "Low confidence → investigate"],
    ["business_impact", 0.7, "Long-horizon enterprise effect"],
    ["risk", 0.65, "Strategic downside"],
    ["stakeholder_impact", 0.55, "Board strategy confidence"],
    ["cost_of_delay", 0.6, "Windows in competitive moves"],
    ["urgency", 0.45, "Often less clock-driven than ops/cash"],
    ["reversibility", 0.7, "Strategic one-way doors"],
  ]),
  actionBias: -2,
  recommendConfidenceFloor: 68,
  escalateForceThreshold: 82,
  crisisForceThreshold: 92,
  mayWithholdRecommendation: true,
  decisionPriorities: [
    "Strategic drift",
    "Competitive positioning",
    "Future capability",
  ],
  escalationPhilosophy:
    "Challenge forming consensus that ignores drift; Escalate when position is being permanently lost.",
  learningFocus: [
    "False negatives on strategic drift",
    "Challenge quality vs decision outcomes",
    "When Observe missed a competitive window",
  ],
});
