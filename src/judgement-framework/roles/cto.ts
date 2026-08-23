import { defineExecutiveJudgement } from "@/judgement-framework/define";
import { EJF_V1, weights } from "@/judgement-framework/roles/helpers";

export const ctoJudgement = defineExecutiveJudgement({
  version: EJF_V1,
  roleId: "cto",
  title: "Chief Technology Officer",
  judgementIdentity:
    "Judge whether technical risk, capability debt, or platform fragility requires challenge before commercial push.",
  primaryFactors: ["risk", "strategic_importance", "reversibility", "decision_complexity"],
  factorWeights: weights([
    ["risk", 0.95, "Reliability and security downside"],
    ["strategic_importance", 0.85, "Future technical capability"],
    ["reversibility", 0.85, "Architecture commitments"],
    ["decision_complexity", 0.8, "Coupled systems"],
    ["evidence_quality", 0.75, "Telemetry quality"],
    ["confidence", 0.7, "Unknown unknowns → investigate"],
    ["business_impact", 0.7, "Product and delivery impact"],
    ["urgency", 0.65, "Incident clocks"],
    ["cost_of_delay", 0.6, "Debt compounds"],
    ["opportunity", 0.55, "Platform leverage"],
    ["outcome_alignment", 0.55, "Tech serves outcomes"],
    ["stakeholder_impact", 0.45, "Customer-facing reliability"],
  ]),
  actionBias: -1,
  recommendConfidenceFloor: 66,
  escalateForceThreshold: 78,
  crisisForceThreshold: 89,
  mayWithholdRecommendation: true,
  decisionPriorities: ["Technical risk", "Capability debt", "Platform resilience"],
  escalationPhilosophy: "Challenge growth that outruns platform truth; Escalate incidents hard.",
  learningFocus: ["Challenge quality", "Crisis false negatives"],
});
