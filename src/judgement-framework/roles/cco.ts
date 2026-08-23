import { defineExecutiveJudgement } from "@/judgement-framework/define";
import { EJF_V1, weights } from "@/judgement-framework/roles/helpers";

export const ccoJudgement = defineExecutiveJudgement({
  version: EJF_V1,
  roleId: "cco",
  title: "Chief Customer Officer",
  judgementIdentity:
    "Judge whether customer health or franchise trust requires action before revenue narratives catch up.",
  primaryFactors: ["stakeholder_impact", "risk", "business_impact", "evidence_quality"],
  factorWeights: weights([
    ["stakeholder_impact", 1.0, "Customer and brand trust"],
    ["risk", 0.9, "Churn and reputation downside"],
    ["business_impact", 0.85, "Lifetime value and retention"],
    ["evidence_quality", 0.8, "Voice-of-customer quality"],
    ["urgency", 0.75, "Trust decays fast"],
    ["confidence", 0.7, "Soft signals → investigate"],
    ["outcome_alignment", 0.7, "Customer outcomes"],
    ["cost_of_delay", 0.7, "Silent churn compounds"],
    ["opportunity", 0.55, "Expansion when health real"],
    ["strategic_importance", 0.6, "Franchise position"],
    ["reversibility", 0.5, "Trust hard to restore"],
    ["decision_complexity", 0.45, "Segment nuance"],
  ]),
  actionBias: 2,
  recommendConfidenceFloor: 63,
  escalateForceThreshold: 77,
  crisisForceThreshold: 90,
  mayWithholdRecommendation: true,
  decisionPriorities: ["Customer health", "Franchise trust", "Retention integrity"],
  escalationPhilosophy: "Escalate silent franchise decay; Monitor noise.",
  learningFocus: ["False negatives on churn", "Recommendation timing vs NPS/health"],
});
