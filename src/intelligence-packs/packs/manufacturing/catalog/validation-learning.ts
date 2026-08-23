import type {
  PackLearningRule,
  PackValidationRule,
} from "@/intelligence-packs/contract";

/** Phase 48 doc 11 */
export const MANUFACTURING_VALIDATION_RULES: PackValidationRule[] = [
  {
    id: "mfg-val-outcomes-linked",
    description: "Every recommendation links ≥1 manufacturing Focus Outcome",
    evaluateKey: "outcomes_linked",
    severity: "blocker",
  },
  {
    id: "mfg-val-council-complete",
    description: "Under critical severity, all five Council roles produce opinions",
    evaluateKey: "council_complete",
    severity: "blocker",
  },
  {
    id: "mfg-val-alternatives",
    description: "Judgement includes ≥2 options in play",
    evaluateKey: "has_alternatives",
    severity: "blocker",
  },
  {
    id: "mfg-val-unknowns",
    description: "Unknowns explicitly listed when confidence < 70",
    evaluateKey: "has_unknowns",
    severity: "warning",
  },
  {
    id: "mfg-val-tradeoff-cash-service",
    description: "Inventory/capacity decisions state cash vs service trade-off",
    evaluateKey: "cash_service_tradeoff",
    severity: "blocker",
  },
  {
    id: "mfg-val-forecast-band",
    description: "Build/destock cites forecast confidence band",
    evaluateKey: "forecast_band_cited",
    severity: "warning",
  },
  {
    id: "mfg-val-allocation-policy",
    description: "Scarcity allocation cites policy",
    evaluateKey: "allocation_policy_cited",
    severity: "blocker",
  },
  {
    id: "mfg-val-overtime-expiry",
    description: "Overtime approval includes expiry/review date",
    evaluateKey: "overtime_expiry",
    severity: "warning",
  },
  {
    id: "mfg-val-ontology-opaque",
    description: "Pack does not require Core manufacturing entity types",
    evaluateKey: "ontology_opaque",
    severity: "blocker",
  },
  {
    id: "mfg-val-loop-intact",
    description: "Operating loop stages pass in Enterprise Simulation",
    evaluateKey: "loop_intact",
    severity: "blocker",
  },
  {
    id: "mfg-val-benchmark-context",
    description: "Material KPI calls reference benchmark or internal target",
    evaluateKey: "benchmark_context",
    severity: "info",
  },
  {
    id: "mfg-val-board-range",
    description:
      "Board-material inventory/supply narrative includes range not point",
    evaluateKey: "board_range",
    severity: "warning",
  },
];

export const MANUFACTURING_LEARNING_RULES: PackLearningRule[] = [
  {
    id: "mfg-learn-01",
    description:
      "Compare predicted vs actual outcome movement (utilisation, CCC, fill, OTTP)",
    trigger: "decision_closed",
    retentionHint: "Store prediction delta + owning roles",
  },
  {
    id: "mfg-learn-02",
    description:
      "When mid-cycle forecast reset was delayed, measure inventory/OTTP damage",
    trigger: "forecast_reset_after_miss",
    retentionHint: "Store time-to-reset and cost",
  },
  {
    id: "mfg-learn-03",
    description:
      "If overtime reappears after exception, escalate learning to capacity thesis",
    trigger: "overtime_recurrence",
    retentionHint: "Store recurrence count",
  },
  {
    id: "mfg-learn-04",
    description: "Policy overrides that later hurt share or fill",
    trigger: "allocation_override",
    retentionHint: "Store override rationale vs result",
  },
  {
    id: "mfg-learn-05",
    description: "Clearance ROI and factory hangover",
    trigger: "clearance_postmortem",
    retentionHint: "Store margin floor breaches",
  },
  {
    id: "mfg-learn-06",
    description: "When a dissenting Council role was later proven right",
    trigger: "council_challenge_correct",
    retentionHint: "Reinforce that role’s reasoning hint",
  },
  {
    id: "mfg-learn-07",
    description: "Any board surprise on inventory/supply",
    trigger: "board_surprise",
    retentionHint: "Force narrative learning item",
  },
  {
    id: "mfg-learn-08",
    description: "Capex continued after missed gate",
    trigger: "gate_miss_with_spend",
    retentionHint: "Fail-closed reinforcement",
  },
];
