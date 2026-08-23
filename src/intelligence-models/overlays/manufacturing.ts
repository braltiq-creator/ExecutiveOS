/**
 * Manufacturing industry overlays — adapt observations/thresholds only.
 * Do not redefine executive identity.
 */

import type { IndustryBehaviourOverlay } from "@/intelligence-models/types";

export const MANUFACTURING_OVERLAYS: IndustryBehaviourOverlay[] = [
  {
    industry: "manufacturing",
    roleId: "ceo",
    priorityEmphasis: [
      "Scarcity politics on build slots",
      "Inventory vs Organisation Health",
      "Board inventory narrative honesty",
    ],
    thresholdOverrides: [
      "Escalate when allocation conflict becomes political",
      "Escalate when inventory and share diverge materially",
    ],
    observationAdds: {
      monitors: ["Build slot scarcity", "Dealer politics", "E&O trajectory"],
      escalationTriggers: ["Board-visible inventory risk without remediation owner"],
    },
  },
  {
    industry: "manufacturing",
    roleId: "cfo",
    priorityEmphasis: [
      "CCC and inventory $",
      "E&O as deferred write-off",
      "Overtime premium as fake capacity cost",
    ],
    thresholdOverrides: [
      "Challenge build-ahead when forecast WAPE/bias outside band",
      "Clearance requires margin floor",
    ],
    observationAdds: {
      monitors: ["DIO by class", "E&O %", "Overtime cost", "Dealer DIO"],
      earlyWarningSignals: ["Inventory rising faster than revenue"],
    },
    challengeAdds: {
      challengeQuestions: [
        "Are we funding forecast denial with inventory?",
        "What is the cash path of destock vs build?",
      ],
    },
    recommendationAdds: {
      responseOptions: [
        "Destock posture with service floor",
        "Time-boxed commodity absorb/pass",
      ],
    },
  },
  {
    industry: "manufacturing",
    roleId: "coo",
    priorityEmphasis: [
      "Demonstrated capacity envelope",
      "Frozen-window discipline",
      "Overtime ≠ capacity",
    ],
    thresholdOverrides: [
      "Escalate structural overtime after policy periods",
      "Reject schedules beyond demonstrated capacity",
    ],
    observationAdds: {
      monitors: [
        "Factory utilisation band",
        "OEE",
        "Frozen-window breach rate",
        "Critical part OTIF",
        "Expedite rate",
      ],
      escalationTriggers: ["Line-down with cascading promise breaches"],
    },
    diagnosisAdds: {
      patternLibrary: ["Build slot oversell", "Hot-order spiral"],
    },
  },
  {
    industry: "manufacturing",
    roleId: "cro",
    priorityEmphasis: [
      "Sell-out over sell-in",
      "Dealer fill and allocation fairness",
      "Regional forecast honesty",
    ],
    thresholdOverrides: [
      "Reset forecast when regional bias persists outside band",
      "Allocation recommendations must cite policy",
    ],
    observationAdds: {
      monitors: [
        "Dealer fill / DIO / turn",
        "Order bank vs capacity",
        "Construction activity signals",
        "Allocation escalations",
      ],
    },
    challengeAdds: {
      challengeQuestions: [
        "What is sell-out doing by dealer/region?",
        "Which dealers earn scarce slots under policy?",
      ],
      biasesToCounter: ["Channel stuffing temptation"],
    },
  },
  {
    industry: "manufacturing",
    roleId: "cso",
    priorityEmphasis: [
      "Electrification / automation bets",
      "Strategy mix buildability",
      "Stage-gate evidence",
    ],
    thresholdOverrides: [
      "Mix shifts require COO capacity proof",
      "Capex gates fail closed",
    ],
    observationAdds: {
      monitors: ["Strategy mix %", "Automation ROI vs plan", "Electrification order bank"],
    },
  },
  {
    industry: "manufacturing",
    roleId: "cco",
    priorityEmphasis: ["Dealer satisfaction as customer proxy", "Promise integrity to channel"],
    observationAdds: {
      monitors: ["Dealer complaint themes", "Fill-rate driven churn risk"],
    },
  },
  {
    industry: "manufacturing",
    roleId: "crisk",
    priorityEmphasis: ["Product liability", "Safety stops", "Supply concentration"],
    observationAdds: {
      monitors: ["Safety incidents", "Single-source critical parts", "Quality escapes"],
      escalationTriggers: ["Safety stoppage", "Field quality escape"],
    },
  },
];
