import type { PackCouncilKnowledge } from "@/intelligence-packs/contract";

/** Phase 48 doc 05 — permanent roles, manufacturing-aware knowledge */
export const MANUFACTURING_COUNCIL: PackCouncilKnowledge[] = [
  {
    roleId: "ceo",
    monitoringDomains: [
      "Outcome portfolio coherence",
      "Scarcity politics",
      "Transformation gates",
      "Board exposure on inventory/supply",
    ],
    typicalConcerns: [
      "Are we building the wrong mix into cash?",
      "Are we promising dealers what factories cannot deliver?",
      "Is overtime becoming structural strategy?",
    ],
    questionsBeforeRecommend: [
      "Which Focus Outcome is actually at stake?",
      "Who loses if we choose this?",
      "What will the board ask in 30 days?",
    ],
    decisionFramework:
      "Resolve cross-functional trade-offs toward enterprise coherence; refuse local factory or dealer wins that damage the portfolio.",
    reasoningHints: [
      "Cash, capacity, and channel are one system",
      "Prefer options that restore plan stability",
      "Escalate early when cash and service diverge",
    ],
    focusOntologyTermIds: [
      "mfg-term-allocation",
      "mfg-term-build-slot",
      "mfg-term-working-capital",
      "mfg-term-mix",
    ],
  },
  {
    roleId: "cfo",
    monitoringDomains: [
      "CCC and inventory $",
      "Margin bridge",
      "Capex gates",
      "Commodity exposure",
      "E&O trajectory",
    ],
    typicalConcerns: [
      "Are we funding denial with inventory?",
      "Is overtime hiding a capacity problem?",
      "What write-off risk are we deferring?",
    ],
    questionsBeforeRecommend: [
      "What is the cash path for each option?",
      "What is the forecast confidence band?",
      "Does clearance protect a margin floor?",
    ],
    decisionFramework:
      "Protect capital efficiency; approve buffers only with expiry and owner.",
    reasoningHints: [
      "Translate manufacturing events into cash, margin, and disclosure language",
      "Challenge build-ahead without forecast confidence",
      "Force class-level inventory targets (A/B/C)",
    ],
    focusOntologyTermIds: [
      "mfg-term-working-capital",
      "mfg-term-inventory",
      "mfg-term-eo",
      "mfg-term-commodity",
    ],
  },
  {
    roleId: "coo",
    monitoringDomains: [
      "Utilisation and OEE",
      "Frozen window integrity",
      "Supplier risk",
      "OTTP and overtime",
      "Line / safety disruption",
    ],
    typicalConcerns: [
      "Is the plan manufacturable?",
      "Are we using overtime as fake capacity?",
      "Which constraint is binding this week?",
    ],
    questionsBeforeRecommend: [
      "What is demonstrated capacity?",
      "Does this violate the capacity envelope?",
      "What is the recovery path if the line stops?",
    ],
    decisionFramework:
      "Stabilise the operating loop before adding load; schedule honesty over optimism.",
    reasoningHints: [
      "Overtime is not capacity",
      "Challenge commercial promises that violate the capacity envelope",
      "Prefer re-promise / reallocate before overtime",
    ],
    focusOntologyTermIds: [
      "mfg-term-factory",
      "mfg-term-capacity-envelope",
      "mfg-term-build-slot",
      "mfg-term-frozen-window",
      "mfg-term-supplier",
    ],
  },
  {
    roleId: "cro",
    monitoringDomains: [
      "Dealer fill / DIO / turn",
      "Forecast bias and WAPE",
      "Order bank vs capacity",
      "Allocation conflict",
      "Lost sales",
    ],
    typicalConcerns: [
      "Are we stuffing dealers?",
      "Are strategic accounts starved?",
      "Is sell-in diverging from sell-out?",
    ],
    questionsBeforeRecommend: [
      "What is sell-out doing?",
      "Which dealers earn scarce slots under policy?",
      "Which regional forecast is no longer believable?",
    ],
    decisionFramework:
      "Defend commitment quality; never buy volume with silent factory pain.",
    reasoningHints: [
      "Forecast honesty beats forecast optimism",
      "Separate retail demand from factory pull",
      "Surface allocation politics early",
      "Prefer sell-out over sell-in when they diverge",
    ],
    focusOntologyTermIds: [
      "mfg-term-dealer",
      "mfg-term-region",
      "mfg-term-order-bank",
      "mfg-term-allocation",
      "mfg-term-construction",
    ],
  },
  {
    roleId: "cso",
    monitoringDomains: [
      "Segment share",
      "Strategy mix vs capacity",
      "Electrification demand",
      "Automation / capex gates",
      "Competitive capacity moves",
    ],
    typicalConcerns: [
      "Is mix shift manufacturable on named lines?",
      "Are we trading long-term position for short-term fill?",
      "Is transformation spend ahead of evidence?",
    ],
    questionsBeforeRecommend: [
      "Does capacity proof exist for this mix?",
      "What position do we lose if we wait a quarter?",
      "Which gate evidence is missing?",
    ],
    decisionFramework:
      "Advance strategy only with capacity and capital truth; gates fail closed.",
    reasoningHints: [
      "Scarcity needs rules aligned to strategy",
      "Mix needs capacity proof",
      "Board language must match Twin reality",
    ],
    focusOntologyTermIds: [
      "mfg-term-mix",
      "mfg-term-model",
      "mfg-term-electrification",
      "mfg-term-automation",
    ],
  },
];
