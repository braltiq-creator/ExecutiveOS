import type { CouncilRoleId } from "@/experience/executive-council/members";

/** Permanent executive operating cadences — presentation only. */

export type RhythmId =
  | "daily_brief"
  | "weekly_elt"
  | "weekly_sales"
  | "weekly_ops"
  | "monthly_business"
  | "monthly_financial"
  | "quarterly_board"
  | "quarterly_strategy"
  | "annual_planning"
  | "budget_cycle"
  | "forecast_review"
  | "risk_review";

export type RhythmCadence =
  | "daily"
  | "weekly"
  | "monthly"
  | "quarterly"
  | "annual"
  | "event";

export type RhythmDefinition = {
  id: RhythmId;
  name: string;
  cadence: RhythmCadence;
  purpose: string;
  participants: CouncilRoleId[];
  preparationRequired: string[];
  expectedDecisions: string[];
  supportingOutcomes: string[];
  supportingKnowledge: string[];
  successMeasures: string[];
  /** Default prep minutes for this rhythm. */
  prepMinutes: number;
  meetingMinutes: number;
};

export const EXECUTIVE_RHYTHMS: RhythmDefinition[] = [
  {
    id: "daily_brief",
    name: "Daily Executive Brief",
    cadence: "daily",
    purpose: "Orient the executive to overnight organisational movement.",
    participants: ["ceo", "cfo", "coo", "cro", "cso"],
    preparationRequired: [
      "Overnight signal scan",
      "Priority judgement queue",
      "Outcome health delta",
    ],
    expectedDecisions: ["Today's attention order"],
    supportingOutcomes: ["Organisation Health"],
    supportingKnowledge: ["Overnight evidence", "Council observations"],
    successMeasures: ["Time to orientation", "Judgement clarity"],
    prepMinutes: 8,
    meetingMinutes: 15,
  },
  {
    id: "weekly_elt",
    name: "Weekly Executive Leadership Team Meeting",
    cadence: "weekly",
    purpose: "Align the leadership team on decisions that move strategic outcomes.",
    participants: ["ceo", "cfo", "coo", "cro", "cso"],
    preparationRequired: [
      "Agenda",
      "Key decisions",
      "Strategic risks",
      "Outcome movement summary",
      "Discussion order",
    ],
    expectedDecisions: [
      "Priority decisions for the week",
      "Risk ownership",
      "Resource trade-offs",
    ],
    supportingOutcomes: [
      "Strategic Outcome Portfolio",
      "Organisation Health",
    ],
    supportingKnowledge: ["Council discussion", "Impact history"],
    successMeasures: ["Decision completion", "Outcome progress"],
    prepMinutes: 18,
    meetingMinutes: 60,
  },
  {
    id: "weekly_sales",
    name: "Weekly Sales Review",
    cadence: "weekly",
    purpose: "Protect revenue trajectory and customer expansion.",
    participants: ["cro", "cfo", "ceo"],
    preparationRequired: [
      "Pipeline status",
      "Deal risks",
      "Growth opportunities",
    ],
    expectedDecisions: ["Deal interventions", "Coverage actions"],
    supportingOutcomes: ["Increase Enterprise ARR", "Commercial Health"],
    supportingKnowledge: ["CRM signals", "Customer evidence"],
    successMeasures: ["Pipeline conversion", "Retention"],
    prepMinutes: 12,
    meetingMinutes: 45,
  },
  {
    id: "weekly_ops",
    name: "Weekly Operations Review",
    cadence: "weekly",
    purpose: "Protect delivery reliability and execution capacity.",
    participants: ["coo", "cfo", "ceo"],
    preparationRequired: [
      "Capacity posture",
      "Delivery risks",
      "Execution owners",
    ],
    expectedDecisions: ["Capacity rebalance", "Delivery interventions"],
    supportingOutcomes: ["Executive Capacity", "Reduce Strategic Risk"],
    supportingKnowledge: ["Operational signals", "Project status"],
    successMeasures: ["Delivery slip", "Capacity utilisation"],
    prepMinutes: 12,
    meetingMinutes: 45,
  },
  {
    id: "monthly_business",
    name: "Monthly Business Review",
    cadence: "monthly",
    purpose: "Explain organisational performance and decide corrective action.",
    participants: ["ceo", "cfo", "coo", "cro", "cso"],
    preparationRequired: [
      "Executive narrative",
      "Variances",
      "Commercial performance",
      "Recommended actions",
    ],
    expectedDecisions: ["Corrective actions", "Priority resets"],
    supportingOutcomes: ["Organisation Health", "Strategic Outcomes"],
    supportingKnowledge: ["Financials", "Council learning"],
    successMeasures: ["Variance closure", "Action completion"],
    prepMinutes: 25,
    meetingMinutes: 90,
  },
  {
    id: "monthly_financial",
    name: "Monthly Financial Review",
    cadence: "monthly",
    purpose: "Establish financial confidence and capital allocation clarity.",
    participants: ["cfo", "ceo", "cro"],
    preparationRequired: [
      "P&L narrative",
      "Cash and margin",
      "Forecast confidence",
    ],
    expectedDecisions: ["Capital allocation", "Forecast adjustments"],
    supportingOutcomes: ["Executive Value", "Commercial Health"],
    supportingKnowledge: ["Financial evidence", "Value estimates"],
    successMeasures: ["Forecast accuracy", "Capital efficiency"],
    prepMinutes: 20,
    meetingMinutes: 60,
  },
  {
    id: "quarterly_board",
    name: "Quarterly Board Review",
    cadence: "quarterly",
    purpose: "Present board-level strategic progress and unresolved risks.",
    participants: ["ceo", "cfo", "cso", "cro", "coo"],
    preparationRequired: [
      "Board-level summary",
      "Strategic progress",
      "Unresolved risks",
      "Board decision asks",
    ],
    expectedDecisions: ["Board approvals", "Strategic mandates"],
    supportingOutcomes: ["Strategic Outcome Portfolio"],
    supportingKnowledge: ["Board pack evidence", "Outcome timeline"],
    successMeasures: ["Board confidence", "Mandate clarity"],
    prepMinutes: 40,
    meetingMinutes: 120,
  },
  {
    id: "quarterly_strategy",
    name: "Quarterly Strategy Review",
    cadence: "quarterly",
    purpose: "Recalibrate outcome portfolio and strategic sequencing.",
    participants: ["cso", "ceo", "cfo", "cro", "coo"],
    preparationRequired: [
      "Outcome health",
      "Scenario options",
      "Portfolio trade-offs",
    ],
    expectedDecisions: ["Outcome priority shifts", "Initiative stops/starts"],
    supportingOutcomes: ["All strategic outcomes"],
    supportingKnowledge: ["Strategy workspace", "Council consensus"],
    successMeasures: ["Portfolio coherence", "Outcome trajectory"],
    prepMinutes: 35,
    meetingMinutes: 120,
  },
  {
    id: "annual_planning",
    name: "Annual Planning",
    cadence: "annual",
    purpose: "Set the year's strategic outcomes and investment shape.",
    participants: ["ceo", "cfo", "cso", "cro", "coo"],
    preparationRequired: [
      "Outcome targets",
      "Investment envelope",
      "Capability plan",
    ],
    expectedDecisions: ["Annual outcome set", "Budget envelope"],
    supportingOutcomes: ["Strategic Outcome Portfolio"],
    supportingKnowledge: ["Prior year learning", "Market signals"],
    successMeasures: ["Plan coherence", "Investment clarity"],
    prepMinutes: 60,
    meetingMinutes: 180,
  },
  {
    id: "budget_cycle",
    name: "Budget Cycle",
    cadence: "annual",
    purpose: "Allocate capital against strategic outcomes with confidence.",
    participants: ["cfo", "ceo", "cso"],
    preparationRequired: [
      "Budget cases",
      "ROI confidence",
      "Risk buffers",
    ],
    expectedDecisions: ["Budget approvals", "Contingency rules"],
    supportingOutcomes: ["Executive Value"],
    supportingKnowledge: ["Financial models", "Outcome impact"],
    successMeasures: ["Capital discipline", "Outcome funding"],
    prepMinutes: 45,
    meetingMinutes: 120,
  },
  {
    id: "forecast_review",
    name: "Forecast Review",
    cadence: "event",
    purpose: "Test forecast integrity before external or board commitment.",
    participants: ["cfo", "cro", "ceo"],
    preparationRequired: [
      "Forecast bridges",
      "Assumption risks",
      "Confidence bands",
    ],
    expectedDecisions: ["Forecast lock", "Assumption challenges"],
    supportingOutcomes: ["Commercial Health", "Enterprise ARR"],
    supportingKnowledge: ["Pipeline", "Financial forecasts"],
    successMeasures: ["Forecast reliability"],
    prepMinutes: 20,
    meetingMinutes: 45,
  },
  {
    id: "risk_review",
    name: "Risk Review",
    cadence: "event",
    purpose: "Surface and own material strategic and operational risks.",
    participants: ["coo", "cso", "ceo", "cfo"],
    preparationRequired: [
      "Risk register",
      "Mitigation owners",
      "Exposure narrative",
    ],
    expectedDecisions: ["Risk accept/mitigate", "Owner assignment"],
    supportingOutcomes: ["Reduce Strategic Risk"],
    supportingKnowledge: ["Risk evidence", "Council challenges"],
    successMeasures: ["Risk containment", "Owner clarity"],
    prepMinutes: 18,
    meetingMinutes: 45,
  },
];

export function getRhythm(id: RhythmId): RhythmDefinition {
  return EXECUTIVE_RHYTHMS.find((r) => r.id === id)!;
}
