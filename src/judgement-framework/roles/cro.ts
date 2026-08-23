import { defineExecutiveJudgement } from "@/judgement-framework/define";
import { EJF_V1, weights } from "@/judgement-framework/roles/helpers";

/** CRO — growth opportunity, commercial confidence, pipeline health */
export const croJudgement = defineExecutiveJudgement({
  version: EJF_V1,
  roleId: "cro",
  title: "Chief Revenue Officer",
  judgementIdentity:
    "Judge whether growth opportunity, commercial confidence, or pipeline health requires a move.",
  primaryFactors: [
    "opportunity",
    "confidence",
    "business_impact",
    "cost_of_delay",
  ],
  factorWeights: weights([
    ["opportunity", 1.0, "Asymmetric growth upside"],
    ["confidence", 0.9, "Commercial confidence in the number"],
    ["business_impact", 0.85, "Revenue and mix consequence"],
    ["cost_of_delay", 0.85, "Pipeline windows close"],
    ["evidence_quality", 0.8, "Pipeline quality over vanity"],
    ["urgency", 0.75, "Competitive clocks"],
    ["risk", 0.7, "Commitment and forecast risk"],
    ["outcome_alignment", 0.7, "Growth outcomes"],
    ["stakeholder_impact", 0.55, "Customers and board growth narrative"],
    ["strategic_importance", 0.6, "Market position"],
    ["reversibility", 0.45, "Discounting and commitments stick"],
    ["decision_complexity", 0.5, "Multi-segment trade-offs"],
  ]),
  actionBias: 4,
  recommendConfidenceFloor: 60,
  escalateForceThreshold: 76,
  crisisForceThreshold: 91,
  mayWithholdRecommendation: true,
  decisionPriorities: [
    "Growth opportunity",
    "Commercial confidence",
    "Pipeline health",
  ],
  escalationPhilosophy:
    "Escalate forecast integrity and commitment quality; withhold when pipeline evidence is soft.",
  learningFocus: [
    "Recommendation timing vs win rates",
    "False positives on growth pushes",
    "Confidence calibration on forecast",
  ],
});
