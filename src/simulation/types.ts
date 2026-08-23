import type { BusinessEvent } from "@/connectors/types";
import type { EnterpriseDigitalTwin } from "@/digital-twin";
import type { ExecutiveIntentProfile } from "@/intelligence/executive-intent/types";
import type { ExecutiveMemoryStore } from "@/intelligence/executive-memory";
import type { EnterpriseDataProvider } from "@/intelligence/executive-intelligence/providers/enterprise-data-provider";
import type { KnowledgeGraph } from "@/knowledge-graph";
import type { OutcomePortfolio } from "@/lib/outcomes/types";

export type OrganisationIndustry =
  | "mining"
  | "industrial_manufacturing"
  | "enterprise_saas"
  | "utilities"
  | "healthcare"
  | "field_services";

export type SimulatedOrganisation = {
  id: string;
  name: string;
  industry: OrganisationIndustry;
  executiveName: string;
  asOf: string;
  description: string;
  /** Build an isolated stack context — never touches global singletons. */
  createContext(): SimulationContext;
};

export type SimulationContext = {
  organisationId: string;
  asOf: string;
  provider: EnterpriseDataProvider;
  graph: KnowledgeGraph;
  intent: ExecutiveIntentProfile;
  memory: ExecutiveMemoryStore;
  twin: EnterpriseDigitalTwin;
  /** Optional portfolio when provider is portfolio-backed */
  portfolio?: OutcomePortfolio;
  seedEvents: BusinessEvent[];
};

export type ScenarioKind =
  | "major_customer_churn"
  | "large_deal_won"
  | "cyber_incident"
  | "board_preparation"
  | "acquisition_opportunity"
  | "budget_reduction"
  | "budget_overrun"
  | "regulatory_investigation"
  | "operational_outage"
  | "safety_incident"
  | "leadership_resignation"
  | "market_expansion"
  | "market_contraction"
  | "rapid_growth"
  | "forecast_miss"
  | "supply_chain_disruption"
  | string;

export type ExecutiveScenario = {
  id: string;
  kind: ScenarioKind;
  name: string;
  description: string;
  /** Severity pressures evaluation attention */
  severity: "critical" | "high" | "moderate";
  /** Apply scenario overlays onto a fresh context */
  apply(context: SimulationContext): SimulationContext;
};

export type ScenarioCapture = {
  organisationId: string;
  organisationName: string;
  scenarioId: string;
  scenarioName: string;
  asOf: string;
  pulse: {
    state: string;
    label: string;
    narrative: string;
  };
  snapshotSummary: {
    decisionCount: number;
    recommendationCount: number;
    outcomeCount: number;
    reviewMinutes: number;
  };
  judgements: Array<{
    decisionId: string;
    question: string;
    optionCount: number;
    unknownCount: number;
    tradeoffCount: number;
  }>;
  recommendations: Array<{
    id: string;
    title: string;
    act: string;
    attentionValue: number;
  }>;
  alternatives: string[];
  unknowns: string[];
  reasoningPaths: string[];
};
