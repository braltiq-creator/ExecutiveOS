import type { PackReasoningRule } from "@/intelligence-packs/contract";

/** Phase 48 doc 10 — mfg-rr-01…12 */
export const MANUFACTURING_REASONING_RULES: PackReasoningRule[] = [
  {
    id: "mfg-rr-01",
    title: "No build on bad forecast",
    description:
      "Block aggressive build-ahead when forecast bias/WAPE outside band without CFO+CRO joint note.",
    evaluateKey: "no_build_on_bad_forecast",
    relatedOutcomeIds: [
      "mfg-outcome-forecast",
      "mfg-outcome-inventory",
      "mfg-outcome-working-capital",
    ],
    relatedOntologyTermIds: ["mfg-term-order-bank"],
  },
  {
    id: "mfg-rr-02",
    title: "Overtime is not capacity",
    description:
      "Flag overtime as exception; recurrent OT must open a capacity decision.",
    evaluateKey: "overtime_not_capacity",
    relatedOutcomeIds: [
      "mfg-outcome-utilisation",
      "mfg-outcome-margin",
      "mfg-outcome-lead-time",
    ],
    relatedOntologyTermIds: ["mfg-term-capacity-envelope", "mfg-term-build-slot"],
  },
  {
    id: "mfg-rr-03",
    title: "Allocation needs policy",
    description: "Scarcity recommendations must cite allocation rules.",
    evaluateKey: "allocation_needs_policy",
    relatedOutcomeIds: ["mfg-outcome-dealer", "mfg-outcome-share"],
    relatedOntologyTermIds: ["mfg-term-allocation", "mfg-term-dealer"],
  },
  {
    id: "mfg-rr-04",
    title: "Service floor on destock",
    description: "Destock options must preserve A-class fill-rate floor.",
    evaluateKey: "service_floor_destock",
    relatedOutcomeIds: ["mfg-outcome-inventory", "mfg-outcome-dealer"],
    relatedOntologyTermIds: ["mfg-term-inventory", "mfg-term-safety-stock"],
  },
  {
    id: "mfg-rr-05",
    title: "Dual-source critical path",
    description: "Single-source critical parts require a resilience option set.",
    evaluateKey: "dual_source_critical",
    relatedOutcomeIds: ["mfg-outcome-supply-resilience"],
    relatedOntologyTermIds: ["mfg-term-part", "mfg-term-supplier"],
  },
  {
    id: "mfg-rr-06",
    title: "Clearance has margin floor",
    description:
      "Incentives/clearance require margin floor + factory signal protection.",
    evaluateKey: "clearance_margin_floor",
    relatedOutcomeIds: [
      "mfg-outcome-margin",
      "mfg-outcome-dealer",
      "mfg-outcome-inventory",
    ],
    relatedOntologyTermIds: ["mfg-term-dealer", "mfg-term-model"],
  },
  {
    id: "mfg-rr-07",
    title: "Mix needs capacity proof",
    description: "Strategy mix shifts must be manufacturable on named lines.",
    evaluateKey: "mix_needs_capacity",
    relatedOutcomeIds: [
      "mfg-outcome-share",
      "mfg-outcome-utilisation",
      "mfg-outcome-future-fit",
    ],
    relatedOntologyTermIds: ["mfg-term-model", "mfg-term-line", "mfg-term-build-slot"],
  },
  {
    id: "mfg-rr-08",
    title: "Commodity posture time-boxed",
    description: "Price absorb/pass decisions require explicit end date/review.",
    evaluateKey: "commodity_timebox",
    relatedOutcomeIds: ["mfg-outcome-margin", "mfg-outcome-share"],
    relatedOntologyTermIds: ["mfg-term-commodity"],
  },
  {
    id: "mfg-rr-09",
    title: "Board honesty on inventory",
    description:
      "Material CCC/E&O exposure must offer a board narrative option.",
    evaluateKey: "board_honesty_inventory",
    relatedOutcomeIds: ["mfg-outcome-working-capital"],
    relatedOntologyTermIds: ["mfg-term-working-capital", "mfg-term-eo"],
  },
  {
    id: "mfg-rr-10",
    title: "Gate fails closed",
    description:
      "Transformation capital cannot recommend advance without milestone evidence.",
    evaluateKey: "gate_fails_closed",
    relatedOutcomeIds: ["mfg-outcome-future-fit"],
    relatedOntologyTermIds: ["mfg-term-automation", "mfg-term-electrification"],
  },
  {
    id: "mfg-rr-11",
    title: "Sell-out over sell-in",
    description:
      "Prefer dealer sell-out signals over factory sell-in when they diverge.",
    evaluateKey: "sellout_over_sellin",
    relatedOutcomeIds: ["mfg-outcome-forecast", "mfg-outcome-dealer"],
    relatedOntologyTermIds: ["mfg-term-dealer", "mfg-term-order-bank"],
  },
  {
    id: "mfg-rr-12",
    title: "Construction as leading indicator",
    description:
      "Regional resets should consider construction activity when relevant.",
    evaluateKey: "construction_leading",
    relatedOutcomeIds: ["mfg-outcome-forecast", "mfg-outcome-dealer"],
    relatedOntologyTermIds: ["mfg-term-construction", "mfg-term-region"],
  },
];
