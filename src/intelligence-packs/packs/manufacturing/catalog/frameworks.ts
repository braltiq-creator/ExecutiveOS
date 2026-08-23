import type { PackDecisionFramework } from "@/intelligence-packs/contract";

/** Phase 48 docs 03 + 10 — decision frameworks DF-01…04 */
export const MANUFACTURING_FRAMEWORKS: PackDecisionFramework[] = [
  {
    id: "mfg-df-01",
    name: "Scarcity arbitration",
    description:
      "Allocate scarce build slots with published policy, strategy mix, and CEO arbitration for residual politics.",
    applicableOutcomeIds: [
      "mfg-outcome-dealer",
      "mfg-outcome-share",
      "mfg-outcome-lead-time",
      "mfg-outcome-utilisation",
    ],
    steps: [
      "Quantify scarce build slots vs order bank",
      "Apply published allocation policy",
      "Overlay strategy mix constraints",
      "Surface dealer performance exceptions with expiry",
      "CEO arbitrate residual politics",
    ],
    escalationTriggers: [
      "Policy override requested",
      "Two strategic dealers conflict",
      "OTTP breach cluster",
    ],
  },
  {
    id: "mfg-df-02",
    name: "Working capital posture",
    description:
      "Choose build / hold / destock / clearance with forecast confidence, margin floor, and review trigger.",
    applicableOutcomeIds: [
      "mfg-outcome-inventory",
      "mfg-outcome-working-capital",
      "mfg-outcome-margin",
    ],
    steps: [
      "Separate service-critical stock from discretionary build",
      "State forecast confidence band",
      "Choose build / hold / destock / clearance",
      "Set margin floor and time box",
      "Assign review trigger (KPI or date)",
    ],
    escalationTriggers: [
      "E&O % above threshold",
      "CCC breach",
      "Board question on inventory",
    ],
  },
  {
    id: "mfg-df-03",
    name: "Capacity honesty",
    description:
      "Prefer re-promise / reallocate before overtime; convert recurrent OT into a capacity decision.",
    applicableOutcomeIds: [
      "mfg-outcome-utilisation",
      "mfg-outcome-lead-time",
      "mfg-outcome-margin",
    ],
    steps: [
      "State demonstrated capacity envelope",
      "Compare promises and order bank",
      "Prefer re-promise / reallocate before overtime",
      "If overtime, attach expiry and quality watch",
      "Recur → convert to capacity decision (expand/flex/freeze)",
    ],
    escalationTriggers: [
      "Overtime above cap 3 weeks",
      "Quality escape with overtime",
      "Frozen-window thrash",
    ],
  },
  {
    id: "mfg-df-04",
    name: "Transformation stage gate",
    description:
      "Fail closed on missing milestone evidence before advancing electrification/automation capital.",
    applicableOutcomeIds: ["mfg-outcome-future-fit", "mfg-outcome-working-capital"],
    steps: [
      "Evidence pack required (milestones, pilot metrics)",
      "Ops readiness (COO)",
      "Capital readiness (CFO)",
      "Strategy still true (CSO)",
      "Fail closed on missing evidence",
    ],
    escalationTriggers: [
      "Spend continues after missed gate",
      "ROI variance unexplained",
    ],
  },
];

/**
 * Decision catalogue IDs (mfg-d-01…12) — content for recommendations / RL questions.
 * Core Decision Engine unchanged; pack supplies explainable decision frames.
 */
export const MANUFACTURING_DECISION_CATALOGUE = [
  {
    id: "mfg-d-01",
    title: "Factory schedule (frozen window)",
    owner: "coo",
    outcomes: ["mfg-outcome-utilisation", "mfg-outcome-forecast", "mfg-outcome-lead-time"],
  },
  {
    id: "mfg-d-02",
    title: "Build slot / dealer allocation",
    owner: "cro",
    outcomes: ["mfg-outcome-dealer", "mfg-outcome-share", "mfg-outcome-lead-time"],
  },
  {
    id: "mfg-d-03",
    title: "Inventory balancing posture",
    owner: "cfo",
    outcomes: ["mfg-outcome-inventory", "mfg-outcome-working-capital"],
  },
  {
    id: "mfg-d-04",
    title: "Overtime vs promise",
    owner: "coo",
    outcomes: ["mfg-outcome-utilisation", "mfg-outcome-margin", "mfg-outcome-lead-time"],
  },
  {
    id: "mfg-d-05",
    title: "Supply chain resilience (dual-source/buffer)",
    owner: "coo",
    outcomes: ["mfg-outcome-supply-resilience", "mfg-outcome-working-capital"],
  },
  {
    id: "mfg-d-06",
    title: "Demand response / forecast reset",
    owner: "cro",
    outcomes: ["mfg-outcome-forecast", "mfg-outcome-inventory", "mfg-outcome-utilisation"],
  },
  {
    id: "mfg-d-07",
    title: "Dealer replenishment / clearance",
    owner: "cro",
    outcomes: ["mfg-outcome-dealer", "mfg-outcome-margin", "mfg-outcome-inventory"],
  },
  {
    id: "mfg-d-08",
    title: "Commodity response",
    owner: "cfo",
    outcomes: ["mfg-outcome-margin", "mfg-outcome-working-capital", "mfg-outcome-share"],
  },
  {
    id: "mfg-d-09",
    title: "Product mix shift",
    owner: "cso",
    outcomes: ["mfg-outcome-share", "mfg-outcome-margin", "mfg-outcome-future-fit"],
  },
  {
    id: "mfg-d-10",
    title: "Capex / transformation gate",
    owner: "cso",
    outcomes: ["mfg-outcome-future-fit", "mfg-outcome-working-capital"],
  },
  {
    id: "mfg-d-11",
    title: "Capacity planning (expand/flex/freeze)",
    owner: "ceo",
    outcomes: [
      "mfg-outcome-utilisation",
      "mfg-outcome-future-fit",
      "mfg-outcome-working-capital",
    ],
  },
  {
    id: "mfg-d-12",
    title: "Board risk narrative (supply/inventory)",
    owner: "ceo",
    outcomes: ["mfg-outcome-working-capital", "mfg-outcome-supply-resilience"],
  },
] as const;
