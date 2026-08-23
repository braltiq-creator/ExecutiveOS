import type { IntelligenceProfile } from "@/profiles/framework/types";

/**
 * Commercial Executive — outcome-first packaging for growth leaders.
 * Providers (M365 + Salesforce) are invisible implementation details.
 */
export const COMMERCIAL_EXECUTIVE_PROFILE: IntelligenceProfile = {
  id: "commercial_executive",
  name: "Commercial Executive",
  tagline: "See forecast, pipeline, and account risk before the bind.",
  summary:
    "Purpose-built for leaders who run the business through revenue, pipeline quality, and strategic customer relationships.",
  targetExecutives: [
    "CEO",
    "Chief Revenue Officer",
    "VP Sales",
    "Managing Director",
  ],
  targetIndustries: [
    "B2B Services",
    "Technology",
    "Professional Services",
    "Industrial",
  ],
  recommendedProviders: ["microsoft365", "salesforce"],
  requiredProviders: ["microsoft365", "salesforce"],
  executiveKpis: [
    "Commercial Health",
    "Revenue Forecast",
    "Forecast Confidence",
    "Pipeline Health",
    "Strategic Accounts",
    "Renewal Risk",
    "Commercial Momentum",
    "Executive Relationships",
  ],
  executiveQuestions: [
    "What is the revenue forecast?",
    "How healthy is the pipeline?",
    "Which strategic accounts need attention?",
    "Where are executive relationships soft?",
    "What renewals are at risk?",
    "Is commercial momentum building or strained?",
    "How confident is the forecast?",
  ],
  executiveContext: {
    primary: ["commercial", "activity"],
    secondary: ["operational"],
  },
  knowledgeGraphExtensions: [
    "Accounts",
    "Customers",
    "Contacts",
    "Opportunities",
    "Revenue Streams",
    "Commercial Relationships",
    "Products",
    "Sales Teams",
    "Forecasts",
    "Executive Sponsors",
    "Commercial Risks",
    "Commercial Opportunities",
  ],
  councilWeighting: {
    cro: 1,
    cfo: 0.95,
    ceo: 0.9,
    cso: 0.8,
    coo: 0.45,
  },
  foresightWeighting: {
    operational: 0.4,
    commercial: 1,
    strategic: 0.85,
  },
  briefLayout: [
    "pulse",
    "compass",
    "outcomes",
    "metrics",
    "commercial_context",
    "executive_context",
    "since_yesterday",
    "decisions",
    "actions",
    "agenda",
    "council",
    "futures",
    "operational_context",
  ],
  validationScenarioIds: [
    "commercial-forecast-risk",
    "commercial-strategic-accounts",
    "commercial-executive-intervention",
  ],
  recommendedDashboards: [
    "Commercial Health",
    "Revenue Forecast",
    "Strategic Accounts",
    "Pipeline Quality",
    "Executive Relationships",
  ],
};
