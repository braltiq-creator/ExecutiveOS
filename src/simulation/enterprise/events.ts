/**
 * Business event catalogue for Enterprise Simulation Environment.
 * Maps realistic enterprise shocks to Reality Lab scenarios.
 */

import type {
  BusinessEventDefinition,
  OperatingMode,
} from "@/simulation/enterprise/types";

export const BUSINESS_EVENTS: BusinessEventDefinition[] = [
  {
    id: "event-board-request",
    label: "Board request",
    description: "Board asks for hardened risk language before pack freeze.",
    mode: "normal",
    scenarioKind: "board_preparation",
    scenarioId: "scenario-board-prep",
    severity: "high",
  },
  {
    id: "event-market-expansion",
    label: "Market expansion",
    description: "Greenfield expansion competes for executive attention.",
    mode: "normal",
    scenarioKind: "market_expansion",
    scenarioId: "scenario-expansion",
    severity: "moderate",
  },
  {
    id: "event-budget-reduction",
    label: "Budget reduction",
    description: "Forced opex reduction mid-quarter.",
    mode: "normal",
    scenarioKind: "budget_reduction",
    scenarioId: "scenario-budget-reduction",
    severity: "high",
  },
  {
    id: "event-large-deal-won",
    label: "Large deal won",
    description: "Strategic logo closed; delivery commitments bind.",
    mode: "growth",
    scenarioKind: "large_deal_won",
    scenarioId: "scenario-large-deal-won",
    severity: "moderate",
  },
  {
    id: "event-rapid-growth",
    label: "Rapid growth",
    description: "Demand surge stresses capacity and cash.",
    mode: "growth",
    scenarioKind: "rapid_growth",
    scenarioId: "scenario-rapid-growth",
    severity: "high",
  },
  {
    id: "event-acquisition",
    label: "Acquisition",
    description: "Inbound acquisition opportunity with diligence window.",
    mode: "growth",
    scenarioKind: "acquisition_opportunity",
    scenarioId: "scenario-acquisition",
    severity: "high",
  },
  {
    id: "event-customer-lost",
    label: "Major customer lost",
    description: "Strategic logo signals churn within the quarter.",
    mode: "crisis",
    scenarioKind: "major_customer_churn",
    scenarioId: "scenario-customer-churn",
    severity: "critical",
  },
  {
    id: "event-operational-outage",
    label: "Operational outage",
    description: "Material outage with customer and SLA exposure.",
    mode: "crisis",
    scenarioKind: "operational_outage",
    scenarioId: "scenario-outage",
    severity: "critical",
  },
  {
    id: "event-safety-incident",
    label: "Safety incident",
    description: "Material safety incident requiring executive posture.",
    mode: "crisis",
    scenarioKind: "safety_incident",
    scenarioId: "scenario-safety-incident",
    severity: "critical",
  },
  {
    id: "event-cyber",
    label: "Cyber event",
    description: "Active security incident with board exposure.",
    mode: "crisis",
    scenarioKind: "cyber_incident",
    scenarioId: "scenario-cyber-incident",
    severity: "critical",
  },
  {
    id: "event-resignation",
    label: "Executive resignation",
    description: "Key lieutenant resigns in a critical window.",
    mode: "crisis",
    scenarioKind: "leadership_resignation",
    scenarioId: "scenario-resignation",
    severity: "high",
  },
  {
    id: "event-budget-overrun",
    label: "Budget overrun",
    description: "Material opex overrun against approved plan.",
    mode: "crisis",
    scenarioKind: "budget_overrun",
    scenarioId: "scenario-budget-overrun",
    severity: "high",
  },
  {
    id: "event-forecast-miss",
    label: "Forecast miss",
    description: "Material revenue forecast miss mid-quarter.",
    mode: "crisis",
    scenarioKind: "forecast_miss",
    scenarioId: "scenario-forecast-miss",
    severity: "high",
  },
  {
    id: "event-regulatory",
    label: "Regulatory issue",
    description: "Regulator opens an investigation.",
    mode: "crisis",
    scenarioKind: "regulatory_investigation",
    scenarioId: "scenario-regulatory",
    severity: "critical",
  },
  {
    id: "event-market-contraction",
    label: "Market contraction",
    description: "Demand contraction forces portfolio trade-offs.",
    mode: "crisis",
    scenarioKind: "market_contraction",
    scenarioId: "scenario-market-contraction",
    severity: "high",
  },
  {
    id: "event-supply-chain",
    label: "Supply chain disruption",
    description: "Critical supplier disruption threatens delivery.",
    mode: "crisis",
    scenarioKind: "supply_chain_disruption",
    scenarioId: "scenario-supply-chain",
    severity: "critical",
  },
];

export function getBusinessEvent(
  id: string,
): BusinessEventDefinition | undefined {
  return BUSINESS_EVENTS.find((event) => event.id === id);
}

export function listBusinessEvents(mode?: OperatingMode): BusinessEventDefinition[] {
  if (!mode) return [...BUSINESS_EVENTS];
  return BUSINESS_EVENTS.filter((event) => event.mode === mode);
}

export function modeForScenarioId(scenarioId: string): OperatingMode {
  const event = BUSINESS_EVENTS.find((item) => item.scenarioId === scenarioId);
  return event?.mode ?? "normal";
}
