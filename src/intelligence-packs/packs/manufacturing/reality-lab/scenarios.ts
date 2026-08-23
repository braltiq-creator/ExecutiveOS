import type { PackRealityLabDefinition } from "@/intelligence-packs/contract";
import { defineManufacturingScenario } from "@/intelligence-packs/packs/manufacturing/reality-lab/scenario-apply";

/** Phase 48 doc 08 — RL-MFG-01…12 */
export function buildManufacturingRealityLab(): PackRealityLabDefinition {
  const scenarios = [
    defineManufacturingScenario({
      id: "RL-MFG-01",
      kind: "demand_shock",
      name: "Regional demand collapse",
      description:
        "Construction activity drop + dealer cancel/push spike in two regions.",
      severity: "critical",
      packOutcomeId: "mfg-outcome-forecast",
      healthDelta: -18,
      decisionQuestion: "Reset the plan now, or ride it out?",
      packEventId: "mfg-evt-demand-collapse",
      relatedOutcomeIds: [
        "mfg-outcome-forecast",
        "mfg-outcome-inventory",
        "mfg-outcome-utilisation",
      ],
    }),
    defineManufacturingScenario({
      id: "RL-MFG-02",
      kind: "demand_shock",
      name: "Demand surge / scarcity",
      description: "Order bank exceeds capacity envelope for 6+ weeks.",
      severity: "high",
      packOutcomeId: "mfg-outcome-utilisation",
      healthDelta: -14,
      decisionQuestion: "Which dealers and models get scarce slots?",
      packEventId: "mfg-evt-demand-surge",
      relatedOutcomeIds: [
        "mfg-outcome-dealer",
        "mfg-outcome-utilisation",
        "mfg-outcome-lead-time",
      ],
    }),
    defineManufacturingScenario({
      id: "RL-MFG-03",
      kind: "supply_chain_disruption",
      name: "Critical supplier outage",
      description: "Single-source part OTIF collapse; line stop risk in 10 days.",
      severity: "critical",
      packOutcomeId: "mfg-outcome-supply-resilience",
      healthDelta: -20,
      decisionQuestion: "Dual-source, buffer, or stop selling?",
      packEventId: "mfg-evt-supplier-outage",
      relatedOutcomeIds: [
        "mfg-outcome-supply-resilience",
        "mfg-outcome-utilisation",
        "mfg-outcome-lead-time",
      ],
    }),
    defineManufacturingScenario({
      id: "RL-MFG-04",
      kind: "cost_shock",
      name: "Commodity spike",
      description: "Input cost +12% sustained; competitor mixed response.",
      severity: "high",
      packOutcomeId: "mfg-outcome-margin",
      healthDelta: -12,
      decisionQuestion: "Pass through, absorb, or hybrid?",
      packEventId: "mfg-evt-commodity-spike",
      relatedOutcomeIds: ["mfg-outcome-margin", "mfg-outcome-share"],
    }),
    defineManufacturingScenario({
      id: "RL-MFG-05",
      kind: "working_capital",
      name: "Inventory bloat & E&O",
      description: "DIO above band; E&O % rising; dealer DIO swollen.",
      severity: "high",
      packOutcomeId: "mfg-outcome-inventory",
      healthDelta: -15,
      decisionQuestion: "Destock how deep, how fast?",
      packEventId: "mfg-evt-inventory-bloat",
      relatedOutcomeIds: [
        "mfg-outcome-inventory",
        "mfg-outcome-working-capital",
        "mfg-outcome-dealer",
      ],
    }),
    defineManufacturingScenario({
      id: "RL-MFG-06",
      kind: "capacity_stress",
      name: "Overtime spiral",
      description: "Overtime > cap three weeks; OTTP held only via hot orders.",
      severity: "high",
      packOutcomeId: "mfg-outcome-utilisation",
      healthDelta: -13,
      decisionQuestion: "Reject overtime and slip, or accept structural cost?",
      packEventId: "mfg-evt-overtime-spiral",
      relatedOutcomeIds: [
        "mfg-outcome-utilisation",
        "mfg-outcome-margin",
        "mfg-outcome-lead-time",
      ],
    }),
    defineManufacturingScenario({
      id: "RL-MFG-07",
      kind: "channel_conflict",
      name: "Allocation conflict",
      description:
        "Top strategic dealer vs high-turn dealer fighting same slots.",
      severity: "high",
      packOutcomeId: "mfg-outcome-dealer",
      healthDelta: -11,
      decisionQuestion: "Whose scarcity rules win?",
      packEventId: "mfg-evt-allocation-conflict",
      relatedOutcomeIds: [
        "mfg-outcome-dealer",
        "mfg-outcome-share",
        "mfg-outcome-lead-time",
      ],
    }),
    defineManufacturingScenario({
      id: "RL-MFG-08",
      kind: "strategic_shift",
      name: "Electrification mix shift",
      description:
        "Strategy model order bank jumps; legacy model dealers resist.",
      severity: "high",
      packOutcomeId: "mfg-outcome-future-fit",
      healthDelta: -10,
      decisionQuestion: "Rebalance mix and capex gates this quarter?",
      packEventId: "mfg-evt-electrification-shift",
      relatedOutcomeIds: [
        "mfg-outcome-future-fit",
        "mfg-outcome-share",
        "mfg-outcome-inventory",
      ],
    }),
    defineManufacturingScenario({
      id: "RL-MFG-09",
      kind: "operational_outage",
      name: "Line down / safety stop",
      description: "Major line unavailable; promise breaches cascading.",
      severity: "critical",
      packOutcomeId: "mfg-outcome-utilisation",
      healthDelta: -22,
      decisionQuestion: "Reallocate, declare channel impact, restart criteria?",
      packEventId: "mfg-evt-line-down",
      relatedOutcomeIds: [
        "mfg-outcome-utilisation",
        "mfg-outcome-lead-time",
        "mfg-outcome-supply-resilience",
      ],
    }),
    defineManufacturingScenario({
      id: "RL-MFG-10",
      kind: "governance",
      name: "Board inventory challenge",
      description: "Board asks for inventory remediation before pack freeze.",
      severity: "high",
      packOutcomeId: "mfg-outcome-working-capital",
      healthDelta: -12,
      decisionQuestion: "What honest narrative and remediation do we take?",
      packEventId: "mfg-evt-board-inventory",
      relatedOutcomeIds: [
        "mfg-outcome-working-capital",
        "mfg-outcome-inventory",
      ],
    }),
    defineManufacturingScenario({
      id: "RL-MFG-11",
      kind: "competitive",
      name: "Capacity expansion temptation",
      description: "Competitor announces capacity; local utilisation hot.",
      severity: "moderate",
      packOutcomeId: "mfg-outcome-utilisation",
      healthDelta: -8,
      decisionQuestion: "Expand, flex, or freeze?",
      packEventId: "mfg-evt-competitor-capacity",
      relatedOutcomeIds: [
        "mfg-outcome-utilisation",
        "mfg-outcome-future-fit",
        "mfg-outcome-working-capital",
      ],
    }),
    defineManufacturingScenario({
      id: "RL-MFG-12",
      kind: "baseline",
      name: "Normal operations baseline",
      description: "KPIs mostly in band; minor variances — quiet excellence test.",
      severity: "moderate",
      packOutcomeId: "mfg-outcome-utilisation",
      healthDelta: -2,
      decisionQuestion: "What deserves attention when nothing is on fire?",
      packEventId: "mfg-evt-construction-down",
      relatedOutcomeIds: ["mfg-outcome-forecast", "mfg-outcome-utilisation"],
    }),
  ];

  return {
    scenarios,
    validationDatasets: [
      {
        id: "mfg-ds-demand-shock",
        label: "Demand shocks",
        description: "Collapse and surge",
        scenarioIds: ["RL-MFG-01", "RL-MFG-02"],
      },
      {
        id: "mfg-ds-scarcity",
        label: "Scarcity & allocation",
        description: "Slot politics",
        scenarioIds: ["RL-MFG-02", "RL-MFG-07"],
      },
      {
        id: "mfg-ds-supply",
        label: "Supply resilience",
        description: "Supplier failure",
        scenarioIds: ["RL-MFG-03"],
      },
      {
        id: "mfg-ds-cost",
        label: "Cost shocks",
        description: "Commodity",
        scenarioIds: ["RL-MFG-04"],
      },
      {
        id: "mfg-ds-inventory",
        label: "Working capital",
        description: "Bloat and board",
        scenarioIds: ["RL-MFG-05", "RL-MFG-10"],
      },
      {
        id: "mfg-ds-capacity",
        label: "Capacity stress",
        description: "OT and expansion",
        scenarioIds: ["RL-MFG-06", "RL-MFG-11"],
      },
      {
        id: "mfg-ds-strategy",
        label: "Future-fit",
        description: "Electrification",
        scenarioIds: ["RL-MFG-08"],
      },
      {
        id: "mfg-ds-disruption",
        label: "Ops disruption",
        description: "Line/safety",
        scenarioIds: ["RL-MFG-09"],
      },
      {
        id: "mfg-ds-governance",
        label: "Board readiness",
        description: "Disclosure",
        scenarioIds: ["RL-MFG-10"],
      },
      {
        id: "mfg-ds-baseline",
        label: "Normal ops",
        description: "Quiet excellence",
        scenarioIds: ["RL-MFG-12"],
      },
    ],
    successMeasures: [
      "Every critical event produces Council opinions from all five roles",
      "Operating loop stages complete without manual bridging",
      "Recommendations name alternatives, unknowns, and cash/service trade-offs",
      "Forecast honesty beats optimism in scored judgement quality",
      "Allocation decisions cite policy, not politics alone",
      "Overtime is challenged when structural",
      "Board narrative scenarios surface exposure ranges",
    ],
    failureConditions: [
      "Pack recommends build-ahead without forecast confidence band",
      "Council CRO and COO never disagree under scarcity",
      "Inventory destock ignores fill-rate floor",
      "Capex gate passes without milestone evidence",
      "Ontology terms leak as Core entity requirements",
      "Scenario completes with empty judgement artefacts",
    ],
    executiveQuestions: [
      "Where should scarce build slots go this month?",
      "Is inventory protecting service — or funding denial?",
      "Can we keep promises without overtime becoming strategy?",
      "Which regional forecast is no longer believable?",
      "What must the board hear about working capital this quarter?",
      "Is electrification demand a mix shift we can actually build?",
      "Which critical parts are one failure away from line-down?",
    ],
    expectedOutcomes: [
      {
        scenarioId: "RL-MFG-01",
        expectation:
          "Forecast reset decision surfaced; inventory destock options; no silent build-ahead",
      },
      {
        scenarioId: "RL-MFG-02",
        expectation:
          "Allocation decision with policy; COO capacity truth; CEO arbitration path",
      },
      {
        scenarioId: "RL-MFG-03",
        expectation:
          "Resilience decision; cash cost of buffer; board materiality check",
      },
      {
        scenarioId: "RL-MFG-04",
        expectation: "Price/margin options with elasticity; time-boxed posture",
      },
      {
        scenarioId: "RL-MFG-05",
        expectation:
          "Destock vs clearance options; margin floor; factory signal protection",
      },
      {
        scenarioId: "RL-MFG-06",
        expectation:
          "COO challenge to OT; CFO cost; CRO promise trade-off; schedule recommit",
      },
      {
        scenarioId: "RL-MFG-07",
        expectation:
          "Policy-cited allocation; share vs performance trade-off explicit",
      },
      {
        scenarioId: "RL-MFG-08",
        expectation:
          "Mix decision with capacity proof; inventory risk on legacy; stage-gate implication",
      },
      {
        scenarioId: "RL-MFG-09",
        expectation:
          "Disruption huddle; OTTP triage; safety-first restart criteria",
      },
      {
        scenarioId: "RL-MFG-10",
        expectation:
          "Exposure range; remediation owners; no optimistic language; CCC path",
      },
      {
        scenarioId: "RL-MFG-11",
        expectation:
          "Scenario-based capacity posture; forecast confidence gate; stranded capital risk named",
      },
      {
        scenarioId: "RL-MFG-12",
        expectation:
          "Quiet Command Centre; Council watches not alarms; no false urgency",
      },
    ],
  };
}
