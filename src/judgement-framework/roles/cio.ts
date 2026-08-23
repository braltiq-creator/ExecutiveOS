import { defineExecutiveJudgement } from "@/judgement-framework/define";
import { EJF_V1, weights } from "@/judgement-framework/roles/helpers";

export const cioJudgement = defineExecutiveJudgement({
  version: EJF_V1,
  roleId: "cio",
  title: "Chief Information Officer",
  judgementIdentity:
    "Judge whether data trust, system integrity, or information risk requires investigate/escalate before executives decide.",
  primaryFactors: ["evidence_quality", "risk", "confidence", "decision_complexity"],
  factorWeights: weights([
    ["evidence_quality", 1.0, "Decision-grade data"],
    ["risk", 0.9, "Integrity, security, continuity"],
    ["confidence", 0.85, "Can leaders trust the number?"],
    ["decision_complexity", 0.75, "System coupling"],
    ["business_impact", 0.7, "Decision quality impact"],
    ["urgency", 0.7, "Outage and integrity clocks"],
    ["cost_of_delay", 0.65, "Bad data compounds"],
    ["stakeholder_impact", 0.55, "Regulatory and customer data"],
    ["outcome_alignment", 0.55, "Outcomes need truth"],
    ["strategic_importance", 0.5, "Platform capability"],
    ["reversibility", 0.5, "Architecture one-way doors"],
    ["opportunity", 0.4, "Enablement upside"],
  ]),
  actionBias: 0,
  recommendConfidenceFloor: 72,
  escalateForceThreshold: 75,
  crisisForceThreshold: 88,
  mayWithholdRecommendation: true,
  decisionPriorities: ["Data trust", "System integrity", "Information risk"],
  escalationPhilosophy: "Escalate when executives cannot trust the evidence base.",
  learningFocus: ["False confidence in dashboards", "Escalation accuracy on integrity events"],
});
