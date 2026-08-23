import type { IntelligenceProfile } from "@/profiles/framework/types";

/**
 * Operations Executive — outcome-first packaging for operating leaders.
 * Providers (M365 + Simpro) are invisible implementation details.
 */
export const OPERATIONS_EXECUTIVE_PROFILE: IntelligenceProfile = {
  id: "operations_executive",
  name: "Operations Executive",
  tagline: "Know overnight operational health before the day starts.",
  summary:
    "Purpose-built for leaders who run the business through field delivery, capacity, and customer commitments.",
  targetExecutives: [
    "Managing Director",
    "Owner",
    "COO",
    "Operations Manager",
  ],
  targetIndustries: [
    "Field Services",
    "Facilities Management",
    "Trades",
    "Asset Services",
  ],
  recommendedProviders: ["microsoft365", "simpro"],
  requiredProviders: ["microsoft365", "simpro"],
  executiveKpis: [
    "Operational Health",
    "Capacity",
    "Technician Utilisation",
    "Jobs at Risk",
    "Customer Delivery",
    "Cash Collection",
    "Safety Signals",
    "Asset Availability",
  ],
  executiveQuestions: [
    "What changed overnight?",
    "What is our operational health?",
    "Do we have capacity?",
    "Which customers are at delivery risk?",
    "Which jobs are at risk?",
    "Where is cash collection pressure?",
    "How utilised are technicians?",
    "Are there safety or asset issues?",
  ],
  executiveContext: {
    primary: ["operational", "activity"],
    secondary: ["commercial"],
  },
  knowledgeGraphExtensions: [
    "Customers",
    "Sites",
    "Assets",
    "Jobs",
    "Projects",
    "Technicians",
    "Suppliers",
    "Purchase Orders",
    "Invoices",
    "Operational Risks",
    "Operational Opportunities",
  ],
  councilWeighting: {
    coo: 1,
    cfo: 0.85,
    ceo: 0.8,
    cro: 0.55,
    cso: 0.5,
  },
  foresightWeighting: {
    operational: 1,
    commercial: 0.45,
    strategic: 0.55,
  },
  briefLayout: [
    "pulse",
    "compass",
    "outcomes",
    "metrics",
    "operational_context",
    "since_yesterday",
    "decisions",
    "actions",
    "executive_context",
    "agenda",
    "council",
    "futures",
    "commercial_context",
  ],
  validationScenarioIds: [
    "ops-bottlenecks",
    "ops-delivery-risk",
    "ops-technician-constraints",
  ],
  recommendedDashboards: [
    "Operational Health",
    "Capacity & Utilisation",
    "Critical Customers",
    "Cash Collection",
    "Safety & Assets",
  ],
};
