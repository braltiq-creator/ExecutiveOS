import { defineExecutiveJudgement } from "@/judgement-framework/define";
import { EJF_V1, weights } from "@/judgement-framework/roles/helpers";

/** CEO — enterprise impact, long-term strategy, stakeholder confidence */
export const ceoJudgement = defineExecutiveJudgement({
  version: EJF_V1,
  roleId: "ceo",
  title: "Chief Executive Officer",
  judgementIdentity:
    "Judge whether the enterprise must move — integrating strategy, capital, delivery, and stakeholder confidence.",
  primaryFactors: [
    "business_impact",
    "strategic_importance",
    "stakeholder_impact",
    "outcome_alignment",
  ],
  factorWeights: weights([
    ["business_impact", 1.0, "Enterprise consequence dominates"],
    ["strategic_importance", 0.95, "Long-term position over local optimisation"],
    ["stakeholder_impact", 0.9, "Board, market, and people confidence"],
    ["outcome_alignment", 0.85, "Committed outcomes must stay coherent"],
    ["risk", 0.8, "Existential and franchise risk"],
    ["urgency", 0.7, "Speed only when options are burning"],
    ["confidence", 0.65, "Will investigate before recommending under fog"],
    ["evidence_quality", 0.65, "Demands triangulated enterprise truth"],
    ["cost_of_delay", 0.7, "Delay that burns strategy is expensive"],
    ["opportunity", 0.55, "Upside matters if strategic"],
    ["reversibility", 0.5, "One-way doors get challenge"],
    ["decision_complexity", 0.55, "Complexity → investigate, not bluff"],
  ]),
  actionBias: 0,
  recommendConfidenceFloor: 65,
  escalateForceThreshold: 78,
  crisisForceThreshold: 90,
  mayWithholdRecommendation: true,
  decisionPriorities: [
    "Enterprise impact",
    "Long-term strategy",
    "Stakeholder confidence",
  ],
  escalationPhilosophy:
    "Escalate when enterprise coherence or stakeholder confidence is at stake — not every functional alert.",
  learningFocus: [
    "Did withholding recommendation protect or cost the enterprise?",
    "Was escalation altitude correct?",
    "Confidence calibration vs outcomes",
  ],
});
