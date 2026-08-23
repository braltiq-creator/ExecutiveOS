import type {
  PackRecommendationTemplate,
  PackReportTemplate,
} from "@/intelligence-packs/contract";

export const MANUFACTURING_REPORTS: PackReportTemplate[] = [
  {
    id: "mfg-report-board",
    name: "Board operating narrative",
    audience: "Board / CEO",
    sections: [
      "Pulse",
      "Focus Outcomes",
      "Inventory & CCC exposure range",
      "Supply & capacity risks",
      "Capital & gates",
      "Outlook",
    ],
    linkedOutcomeIds: [
      "mfg-outcome-working-capital",
      "mfg-outcome-inventory",
      "mfg-outcome-supply-resilience",
      "mfg-outcome-future-fit",
    ],
  },
  {
    id: "mfg-report-monthly-ops",
    name: "Monthly operating review",
    audience: "ELT",
    sections: [
      "Pulse",
      "Outcome portfolio",
      "Factory & supply",
      "Demand & dealers",
      "Cash & margin",
      "Decisions & owners",
    ],
    linkedOutcomeIds: [
      "mfg-outcome-utilisation",
      "mfg-outcome-forecast",
      "mfg-outcome-dealer",
      "mfg-outcome-working-capital",
      "mfg-outcome-margin",
    ],
  },
];

export const MANUFACTURING_RECOMMENDATIONS: PackRecommendationTemplate[] = [
  {
    id: "mfg-rec-factory-allocation",
    situation: "demand_shock_scarcity",
    title: "Allocate scarce build slots under published policy",
    rationale:
      "Order bank exceeds capacity envelope — allocation must cite policy, strategy mix, and manufacturability.",
    linkedOutcomeIds: [
      "mfg-outcome-dealer",
      "mfg-outcome-utilisation",
      "mfg-outcome-share",
    ],
    placeholders: ["scarce_slots", "policy_id", "strategic_dealers", "capacity_envelope"],
  },
  {
    id: "mfg-rec-inventory-balance",
    situation: "working_capital_bloat",
    title: "Set destock posture with service floor",
    rationale:
      "DIO/E&O pressure requires intentional destock without starving A-class fill rate.",
    linkedOutcomeIds: [
      "mfg-outcome-inventory",
      "mfg-outcome-working-capital",
      "mfg-outcome-dealer",
    ],
    placeholders: ["dio", "eo_pct", "fill_rate_floor", "forecast_band"],
  },
  {
    id: "mfg-rec-dealer-replenish",
    situation: "channel_conflict",
    title: "Rebalance dealer replenishment",
    rationale:
      "Prefer sell-out and policy over political sell-in; protect factory signal.",
    linkedOutcomeIds: ["mfg-outcome-dealer", "mfg-outcome-forecast"],
    placeholders: ["dealer_id", "sell_out", "sell_in", "allocation_rule"],
  },
  {
    id: "mfg-rec-build-slot",
    situation: "capacity_stress",
    title: "Optimise build slots before overtime",
    rationale: "Overtime is not capacity — reallocate or re-promise first.",
    linkedOutcomeIds: [
      "mfg-outcome-utilisation",
      "mfg-outcome-lead-time",
      "mfg-outcome-margin",
    ],
    placeholders: ["overtime_pct", "ottp", "demonstrated_capacity"],
  },
  {
    id: "mfg-rec-capacity-plan",
    situation: "competitive_capacity",
    title: "Capacity posture: expand, flex, or freeze",
    rationale:
      "Competitor moves and hot utilisation require scenario-based capacity judgement with forecast gate.",
    linkedOutcomeIds: [
      "mfg-outcome-utilisation",
      "mfg-outcome-future-fit",
      "mfg-outcome-working-capital",
    ],
    placeholders: ["utilisation", "forecast_confidence", "stranded_capital_risk"],
  },
  {
    id: "mfg-rec-working-capital",
    situation: "governance_inventory",
    title: "Working capital remediation with board-honest range",
    rationale: "Board material inventory narrative must show exposure range and owners.",
    linkedOutcomeIds: ["mfg-outcome-working-capital", "mfg-outcome-inventory"],
    placeholders: ["ccc", "inventory_dollars", "eo_pct", "remediation_owner"],
  },
  {
    id: "mfg-rec-demand-response",
    situation: "demand_shock_collapse",
    title: "Demand response — reset plan before silent build-ahead",
    rationale:
      "Regional collapse requires forecast reset options; factories punish denial.",
    linkedOutcomeIds: [
      "mfg-outcome-forecast",
      "mfg-outcome-inventory",
      "mfg-outcome-utilisation",
    ],
    placeholders: ["regions", "cancel_push_rate", "construction_signal"],
  },
  {
    id: "mfg-rec-commodity",
    situation: "cost_shock",
    title: "Commodity response — time-boxed posture",
    rationale: "Pass / absorb / hybrid must name end date and volume risk.",
    linkedOutcomeIds: ["mfg-outcome-margin", "mfg-outcome-share"],
    placeholders: ["cost_delta_pct", "elasticity", "review_date"],
  },
  {
    id: "mfg-rec-supply-resilience",
    situation: "supply_disruption",
    title: "Supply-chain resilience options",
    rationale: "Single-source critical path needs dual-source, buffer, or stop-sell options.",
    linkedOutcomeIds: [
      "mfg-outcome-supply-resilience",
      "mfg-outcome-utilisation",
      "mfg-outcome-lead-time",
    ],
    placeholders: ["part_id", "days_to_line_stop", "buffer_cash_cost"],
  },
  {
    id: "mfg-rec-regional-allocation",
    situation: "channel_conflict",
    title: "Regional allocation under scarcity",
    rationale: "Regional fairness and strategic share must be explicit under scarcity.",
    linkedOutcomeIds: [
      "mfg-outcome-share",
      "mfg-outcome-dealer",
      "mfg-outcome-lead-time",
    ],
    placeholders: ["regions", "policy_id", "strategic_accounts"],
  },
];
