/**
 * Executive KPI Library — field services.
 * Definitions only; values come from Twin / adapter metrics.
 */

export const FIELD_SERVICE_KPI_IDS = [
  "technician_utilisation",
  "first_time_fix_rate",
  "revenue_per_technician",
  "gross_margin",
  "quote_conversion",
  "average_response_time",
  "sla_compliance",
  "preventive_vs_reactive",
  "job_backlog",
  "work_in_progress",
  "cash_collection",
  "recurring_revenue",
  "customer_concentration",
  "schedule_efficiency",
  "travel_time",
  "labour_recovery",
  "variation_recovery",
  "project_profitability",
] as const;

export type FieldServiceKpiId = (typeof FIELD_SERVICE_KPI_IDS)[number];

export type FieldServiceKpiDefinition = {
  id: FieldServiceKpiId;
  label: string;
  unit: "%" | "$" | "hours" | "ratio" | "count" | "minutes";
  /** Higher is better unless inverted */
  polarity: "higher_better" | "lower_better";
  executiveMeaning: string;
  healthLinks: Array<
    "revenue" | "operational" | "people" | "customer" | "cash" | "execution" | "growth"
  >;
};

export const FIELD_SERVICE_KPI_LIBRARY: FieldServiceKpiDefinition[] = [
  {
    id: "technician_utilisation",
    label: "Technician Utilisation",
    unit: "%",
    polarity: "higher_better",
    executiveMeaning: "How fully skilled labour is deployed against available capacity.",
    healthLinks: ["people", "operational", "growth"],
  },
  {
    id: "first_time_fix_rate",
    label: "First-Time Fix Rate",
    unit: "%",
    polarity: "higher_better",
    executiveMeaning: "Quality of first-visit resolution — drives cost and customer trust.",
    healthLinks: ["operational", "customer", "execution"],
  },
  {
    id: "revenue_per_technician",
    label: "Revenue per Technician",
    unit: "$",
    polarity: "higher_better",
    executiveMeaning: "Productivity of the field workforce in commercial terms.",
    healthLinks: ["revenue", "people", "growth"],
  },
  {
    id: "gross_margin",
    label: "Gross Margin",
    unit: "%",
    polarity: "higher_better",
    executiveMeaning: "Whether growth is converting into economic value.",
    healthLinks: ["revenue", "execution", "growth"],
  },
  {
    id: "quote_conversion",
    label: "Quote Conversion",
    unit: "%",
    polarity: "higher_better",
    executiveMeaning: "Commercial effectiveness from quote to accepted work.",
    healthLinks: ["revenue", "growth"],
  },
  {
    id: "average_response_time",
    label: "Average Response Time",
    unit: "hours",
    polarity: "lower_better",
    executiveMeaning: "Speed of response to customer demand.",
    healthLinks: ["customer", "operational"],
  },
  {
    id: "sla_compliance",
    label: "SLA Compliance",
    unit: "%",
    polarity: "higher_better",
    executiveMeaning: "Reliability against contracted commitments.",
    healthLinks: ["customer", "operational", "execution"],
  },
  {
    id: "preventive_vs_reactive",
    label: "Preventive vs Reactive Work",
    unit: "ratio",
    polarity: "higher_better",
    executiveMeaning: "Mix quality — preventive work stabilises margin and SLA.",
    healthLinks: ["operational", "growth"],
  },
  {
    id: "job_backlog",
    label: "Job Backlog",
    unit: "count",
    polarity: "lower_better",
    executiveMeaning: "Unfinished demand sitting in the operating system.",
    healthLinks: ["operational", "execution", "customer"],
  },
  {
    id: "work_in_progress",
    label: "Work In Progress",
    unit: "$",
    polarity: "lower_better",
    executiveMeaning: "Capital and attention locked in unfinished jobs/projects.",
    healthLinks: ["cash", "execution"],
  },
  {
    id: "cash_collection",
    label: "Cash Collection",
    unit: "%",
    polarity: "higher_better",
    executiveMeaning: "Speed and completeness of converting invoices to cash.",
    healthLinks: ["cash", "revenue"],
  },
  {
    id: "recurring_revenue",
    label: "Recurring Revenue",
    unit: "$",
    polarity: "higher_better",
    executiveMeaning: "Contracted service base that stabilises the P&L.",
    healthLinks: ["revenue", "growth", "customer"],
  },
  {
    id: "customer_concentration",
    label: "Customer Concentration",
    unit: "%",
    polarity: "lower_better",
    executiveMeaning: "Dependency on a small set of logos.",
    healthLinks: ["customer", "growth", "revenue"],
  },
  {
    id: "schedule_efficiency",
    label: "Schedule Efficiency",
    unit: "%",
    polarity: "higher_better",
    executiveMeaning: "How well the roster converts into productive field time.",
    healthLinks: ["operational", "people"],
  },
  {
    id: "travel_time",
    label: "Travel Time",
    unit: "minutes",
    polarity: "lower_better",
    executiveMeaning: "Non-productive time consumed by movement between sites.",
    healthLinks: ["operational", "people"],
  },
  {
    id: "labour_recovery",
    label: "Labour Recovery",
    unit: "%",
    polarity: "higher_better",
    executiveMeaning: "Share of labour cost recovered through billable work.",
    healthLinks: ["revenue", "people", "execution"],
  },
  {
    id: "variation_recovery",
    label: "Variation Recovery",
    unit: "%",
    polarity: "higher_better",
    executiveMeaning: "Ability to convert scope change into recognised value.",
    healthLinks: ["revenue", "execution"],
  },
  {
    id: "project_profitability",
    label: "Project Profitability",
    unit: "%",
    polarity: "higher_better",
    executiveMeaning: "Whether major projects create or destroy margin.",
    healthLinks: ["revenue", "execution", "growth"],
  },
];

export type FieldServiceKpiSnapshot = {
  asOf: string;
  values: Partial<Record<FieldServiceKpiId, number>>;
};

/** Northline-style mock field-service KPI snapshot. */
export const MOCK_FIELD_SERVICE_KPIS: FieldServiceKpiSnapshot = {
  asOf: "2026-07-20T06:15:00+10:00",
  values: {
    technician_utilisation: 92,
    first_time_fix_rate: 68,
    revenue_per_technician: 185000,
    gross_margin: 22,
    quote_conversion: 41,
    average_response_time: 6.5,
    sla_compliance: 94,
    preventive_vs_reactive: 0.35,
    job_backlog: 148,
    work_in_progress: 920000,
    cash_collection: 78,
    recurring_revenue: 4100000,
    customer_concentration: 38,
    schedule_efficiency: 71,
    travel_time: 54,
    labour_recovery: 83,
    variation_recovery: 61,
    project_profitability: 14,
  },
};
