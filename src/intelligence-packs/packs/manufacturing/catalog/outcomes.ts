import type { PackOutcomeModel } from "@/intelligence-packs/contract";

/** Phase 48 doc 01 — ten Focus Outcomes */
export const MANUFACTURING_OUTCOMES: PackOutcomeModel[] = [
  {
    id: "mfg-outcome-inventory",
    name: "Inventory optimisation",
    description:
      "Reduce excess and obsolete inventory while protecting fill rate and production continuity.",
    ownerRole: "cfo",
    successMeasures: [
      "Days of inventory on hand within target band by class (A/B/C)",
      "E&O as % of inventory falling quarter-on-quarter",
      "Stockouts on A-class parts below threshold",
      "Inventory $ aligned to demand plan within agreed variance",
    ],
    supportingKpiIds: [
      "mfg-kpi-dio",
      "mfg-kpi-eo-pct",
      "mfg-kpi-fill-rate",
      "mfg-kpi-wip-turns",
    ],
    strategicImportance: "critical",
    ontologyTerms: ["Inventory", "Safety Stock", "Allocation", "Order Bank", "Model", "Variant"],
  },
  {
    id: "mfg-outcome-forecast",
    name: "Forecast accuracy",
    description:
      "Make regional and dealer demand forecasts accurate enough to commit capacity and inventory.",
    ownerRole: "cro",
    successMeasures: [
      "WAPE / forecast bias within band at model and region",
      "Schedule stability (frozen-window changes) declining",
      "Order-bank vs plan variance explained within SLA",
    ],
    supportingKpiIds: [
      "mfg-kpi-forecast-wape",
      "mfg-kpi-forecast-bias",
      "mfg-kpi-schedule-stability",
    ],
    strategicImportance: "critical",
    ontologyTerms: ["Dealer", "Region", "Order Bank", "Model", "Variant", "Commodity"],
  },
  {
    id: "mfg-outcome-utilisation",
    name: "Factory utilisation",
    description:
      "Run factories at economically sound utilisation — neither chronic underload nor overtime dependency.",
    ownerRole: "coo",
    successMeasures: [
      "OEE / utilisation in target band by plant",
      "Overtime hours as % of standard within cap",
      "Changeover loss trending down on constrained lines",
    ],
    supportingKpiIds: [
      "mfg-kpi-utilisation",
      "mfg-kpi-oee",
      "mfg-kpi-overtime-pct",
      "mfg-kpi-changeover-loss",
    ],
    strategicImportance: "critical",
    ontologyTerms: ["Factory", "Build Slot", "Line", "Lead Time", "Capacity Envelope"],
  },
  {
    id: "mfg-outcome-dealer",
    name: "Dealer performance",
    description:
      "Dealers convert demand into profitable, timely retail without channel conflict or inventory dumping.",
    ownerRole: "cro",
    successMeasures: [
      "Dealer fill rate and days inventory in healthy band",
      "Dealer turn by region improving",
      "Lost sales / backorder aging declining",
    ],
    supportingKpiIds: [
      "mfg-kpi-dealer-fill",
      "mfg-kpi-dealer-dio",
      "mfg-kpi-dealer-turn",
      "mfg-kpi-lost-sales",
    ],
    strategicImportance: "high",
    ontologyTerms: ["Dealer", "Region", "Allocation", "Order Bank"],
  },
  {
    id: "mfg-outcome-working-capital",
    name: "Working capital discipline",
    description: "Keep cash conversion cycle under control across inventory, receivables, and payables.",
    ownerRole: "cfo",
    successMeasures: [
      "CCC within target band",
      "Inventory $ trajectory intentional and explained",
      "No board surprise on working capital",
    ],
    supportingKpiIds: [
      "mfg-kpi-ccc",
      "mfg-kpi-inventory-dollars",
      "mfg-kpi-dso",
      "mfg-kpi-dpo",
    ],
    strategicImportance: "critical",
    ontologyTerms: ["Working Capital", "Inventory", "E&O"],
  },
  {
    id: "mfg-outcome-lead-time",
    name: "Customer lead-time reliability",
    description: "Quoted lead times kept; order bank credible with dealers and customers.",
    ownerRole: "coo",
    successMeasures: [
      "On-time-to-promise improving",
      "Quoted lead time honest vs demonstrated",
      "Expedite rate declining",
    ],
    supportingKpiIds: [
      "mfg-kpi-ottp",
      "mfg-kpi-quoted-lead-time",
      "mfg-kpi-expedite-rate",
    ],
    strategicImportance: "high",
    ontologyTerms: ["Lead Time", "Order Bank", "Build Slot", "Expedite"],
  },
  {
    id: "mfg-outcome-supply-resilience",
    name: "Supply-chain resilience",
    description: "Critical parts dual-sourced or buffered with intent; recovery time controlled.",
    ownerRole: "coo",
    successMeasures: [
      "Critical dual-source / buffer coverage rising",
      "Supplier OTIF in band",
      "Disruption recovery days declining",
    ],
    supportingKpiIds: [
      "mfg-kpi-dual-source-pct",
      "mfg-kpi-supplier-otif",
      "mfg-kpi-recovery-days",
    ],
    strategicImportance: "high",
    ontologyTerms: ["Supplier", "Part", "Safety Stock", "Commodity"],
  },
  {
    id: "mfg-outcome-margin",
    name: "Factory & product margin",
    description: "Contribution margin protected under mix, overtime, and clearance pressure.",
    ownerRole: "cfo",
    successMeasures: [
      "Contribution margin explained by mix and cost",
      "Overtime premium controlled",
      "Discount / clearance leakage within floor",
    ],
    supportingKpiIds: [
      "mfg-kpi-contribution-margin",
      "mfg-kpi-overtime-cost",
      "mfg-kpi-discount-leakage",
    ],
    strategicImportance: "high",
    ontologyTerms: ["Mix", "Model", "Variant", "Commodity", "Factory"],
  },
  {
    id: "mfg-outcome-share",
    name: "Strategic market position",
    description: "Share and segment position defended or grown deliberately under scarcity.",
    ownerRole: "cso",
    successMeasures: [
      "Priority segment share held or grown",
      "Strategic bid win rate improving",
      "Allocation supports strategy, not only politics",
    ],
    supportingKpiIds: ["mfg-kpi-segment-share", "mfg-kpi-strategic-win-rate", "mfg-kpi-lost-sales"],
    strategicImportance: "moderate",
    ontologyTerms: ["Region", "Model", "Allocation", "Dealer", "Mix"],
  },
  {
    id: "mfg-outcome-future-fit",
    name: "Future manufacturing posture",
    description:
      "Electrification, automation, and platform bets funded with stage-gate discipline.",
    ownerRole: "cso",
    successMeasures: [
      "Transformation milestones hit",
      "Automation ROI vs plan explained",
      "Gates fail closed without evidence",
    ],
    supportingKpiIds: [
      "mfg-kpi-transformation-milestones",
      "mfg-kpi-automation-roi",
    ],
    strategicImportance: "moderate",
    ontologyTerms: ["Electrification", "Automation", "Mix", "Factory"],
  },
];
