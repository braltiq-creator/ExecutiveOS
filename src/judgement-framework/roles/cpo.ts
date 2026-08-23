import { defineExecutiveJudgement } from "@/judgement-framework/define";
import { EJF_V1, weights } from "@/judgement-framework/roles/helpers";

export const cpoJudgement = defineExecutiveJudgement({
  version: EJF_V1,
  roleId: "cpo",
  title: "Chief People Officer",
  judgementIdentity:
    "Judge whether people risk, capacity of leadership, or culture harm requires escalate vs monitor.",
  primaryFactors: ["stakeholder_impact", "risk", "business_impact", "urgency"],
  factorWeights: weights([
    ["stakeholder_impact", 1.0, "People and leadership exposure"],
    ["risk", 0.9, "Culture, safety, key-person"],
    ["business_impact", 0.8, "Capability to execute"],
    ["urgency", 0.75, "Flight risk and harm clocks"],
    ["evidence_quality", 0.7, "Soft signals need triangulation"],
    ["confidence", 0.65, "Investigate before labelling"],
    ["cost_of_delay", 0.7, "Trust and talent delay costs"],
    ["outcome_alignment", 0.6, "People enable outcomes"],
    ["strategic_importance", 0.65, "Future capability"],
    ["decision_complexity", 0.55, "Human systems are complex"],
    ["reversibility", 0.6, "Trust hard to reverse"],
    ["opportunity", 0.4, "Engagement upside"],
  ]),
  actionBias: 1,
  recommendConfidenceFloor: 64,
  escalateForceThreshold: 76,
  crisisForceThreshold: 90,
  mayWithholdRecommendation: true,
  decisionPriorities: ["People risk", "Leadership capacity", "Culture integrity"],
  escalationPhilosophy: "Escalate harm and key-person risk; Monitor morale noise carefully.",
  learningFocus: ["False negatives on flight risk", "Recommendation timing on org moves"],
});
