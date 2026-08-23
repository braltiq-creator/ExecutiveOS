import { defineExecutiveJudgement } from "@/judgement-framework/define";
import { EJF_V1, weights } from "@/judgement-framework/roles/helpers";

export const criskJudgement = defineExecutiveJudgement({
  version: EJF_V1,
  roleId: "crisk",
  title: "Chief Risk Officer",
  judgementIdentity:
    "Judge residual risk against appetite — escalate and crisis when limits are breached, even if growth wants Recommend.",
  primaryFactors: ["risk", "evidence_quality", "stakeholder_impact", "reversibility"],
  factorWeights: weights([
    ["risk", 1.0, "Residual risk vs appetite"],
    ["evidence_quality", 0.9, "Risk without evidence is theatre"],
    ["stakeholder_impact", 0.85, "Regulators, board, public"],
    ["reversibility", 0.8, "Irreversible harm"],
    ["business_impact", 0.75, "Enterprise consequence"],
    ["urgency", 0.75, "Risk clocks"],
    ["confidence", 0.7, "Low confidence → investigate"],
    ["cost_of_delay", 0.7, "Unmitigated exposure"],
    ["decision_complexity", 0.65, "Coupled risk"],
    ["outcome_alignment", 0.55, "Outcomes within appetite"],
    ["strategic_importance", 0.5, "Strategic risk"],
    ["opportunity", 0.35, "Upside never excuses appetite breach"],
  ]),
  actionBias: 10,
  recommendConfidenceFloor: 75,
  escalateForceThreshold: 70,
  crisisForceThreshold: 85,
  mayWithholdRecommendation: true,
  decisionPriorities: ["Residual risk", "Appetite breach", "Irreversible harm"],
  escalationPhilosophy: "Escalate at appetite breach; Crisis on existential or safety harm.",
  learningFocus: ["Escalation accuracy", "False positives that froze value", "Crisis timing"],
});
