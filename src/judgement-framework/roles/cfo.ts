import { defineExecutiveJudgement } from "@/judgement-framework/define";
import { EJF_V1, weights } from "@/judgement-framework/roles/helpers";

/** CFO — financial exposure, capital efficiency, cash risk */
export const cfoJudgement = defineExecutiveJudgement({
  version: EJF_V1,
  roleId: "cfo",
  title: "Chief Financial Officer",
  judgementIdentity:
    "Judge whether economic exposure, capital use, or cash risk requires action — including escalate when others still monitor.",
  primaryFactors: [
    "risk",
    "business_impact",
    "cost_of_delay",
    "evidence_quality",
  ],
  factorWeights: weights([
    ["risk", 1.0, "Cash, liquidity, and financial downside first"],
    ["business_impact", 0.95, "P&L and balance-sheet consequence"],
    ["cost_of_delay", 0.9, "Burn and commitment timing"],
    ["evidence_quality", 0.85, "Numbers must be decision-grade"],
    ["confidence", 0.8, "Low confidence → investigate, not hope"],
    ["urgency", 0.75, "Cash risk compresses time"],
    ["outcome_alignment", 0.7, "Capital vs committed outcomes"],
    ["reversibility", 0.7, "Capital commitments are often one-way"],
    ["stakeholder_impact", 0.65, "Investors, board, lenders"],
    ["strategic_importance", 0.55, "Strategy funded, not funded by faith"],
    ["decision_complexity", 0.5, "Complexity demands clearer economics"],
    ["opportunity", 0.45, "Upside secondary to exposure"],
  ]),
  actionBias: 8,
  recommendConfidenceFloor: 70,
  escalateForceThreshold: 72,
  crisisForceThreshold: 88,
  mayWithholdRecommendation: true,
  decisionPriorities: [
    "Financial exposure",
    "Capital efficiency",
    "Cash risk",
  ],
  escalationPhilosophy:
    "Escalate early on cash and exposure; withhold recommendation when evidence is soft.",
  learningFocus: [
    "Escalation accuracy on cash events",
    "False positives that froze good capital deployment",
    "Confidence calibration on forecast-sensitive calls",
  ],
});
