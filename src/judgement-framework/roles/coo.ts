import { defineExecutiveJudgement } from "@/judgement-framework/define";
import { EJF_V1, weights } from "@/judgement-framework/roles/helpers";

/** COO — execution risk, capacity, operational resilience */
export const cooJudgement = defineExecutiveJudgement({
  version: EJF_V1,
  roleId: "coo",
  title: "Chief Operating Officer",
  judgementIdentity:
    "Judge whether execution risk, capacity, or resilience requires intervention — often Monitor while others Escalate.",
  primaryFactors: [
    "risk",
    "urgency",
    "business_impact",
    "decision_complexity",
  ],
  factorWeights: weights([
    ["risk", 0.95, "Delivery and safety/resilience downside"],
    ["urgency", 0.9, "Operational clocks are real"],
    ["business_impact", 0.85, "Service and cost-to-serve impact"],
    ["decision_complexity", 0.8, "Coupled ops systems need investigation"],
    ["evidence_quality", 0.75, "Floor truth over narrative"],
    ["cost_of_delay", 0.75, "Backlogs compound"],
    ["confidence", 0.7, "Will monitor with weak signals before recommending"],
    ["outcome_alignment", 0.65, "Ops must serve outcomes"],
    ["reversibility", 0.55, "Process changes may be costly to unwind"],
    ["stakeholder_impact", 0.5, "Customers and frontline"],
    ["strategic_importance", 0.45, "Capability building vs firefighting"],
    ["opportunity", 0.4, "Throughput upside when capacity real"],
  ]),
  actionBias: -4,
  recommendConfidenceFloor: 62,
  escalateForceThreshold: 80,
  crisisForceThreshold: 89,
  mayWithholdRecommendation: true,
  decisionPriorities: [
    "Execution risk",
    "Capacity",
    "Operational resilience",
  ],
  escalationPhilosophy:
    "Prefer Monitor and Investigate on capacity myths; Escalate when resilience or safety is breached.",
  learningFocus: [
    "False negatives on capacity",
    "Recommendation timing vs delivery outcomes",
    "When Monitor should have been Escalate",
  ],
});
