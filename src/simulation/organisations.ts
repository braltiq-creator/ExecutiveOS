import { EnterpriseDigitalTwin } from "@/digital-twin";
import type { BusinessEvent } from "@/connectors/types";
import { createMockEnterpriseDataProvider } from "@/intelligence/executive-intelligence";
import {
  CEO_INTENT_PROFILE,
  CFO_INTENT_PROFILE,
  COO_INTENT_PROFILE,
  type ExecutiveIntentProfile,
} from "@/intelligence/executive-intent";
import {
  InMemoryExecutiveMemoryStore,
  createSeededExecutiveMemoryStore,
} from "@/intelligence/executive-memory";
import { GraphBuilder, buildNorthlineKnowledgeGraph } from "@/knowledge-graph";
import type { KnowledgeGraph } from "@/knowledge-graph";
import { MOCK_OUTCOME_PORTFOLIO } from "@/lib/outcomes/mock-portfolio";
import type { OutcomePortfolio } from "@/lib/outcomes/types";
import type {
  SimulatedOrganisation,
  SimulationContext,
} from "@/simulation/types";
import { ORG_APEX_FIELD_SERVICES } from "@/industry/field-services/simpro/organisation";

export { ORG_APEX_FIELD_SERVICES };

const AS_OF = "2026-07-20T06:15:00+10:00";

function clonePortfolio(
  portfolio: OutcomePortfolio,
  patch: Partial<OutcomePortfolio> & {
    executiveName?: string;
  },
): OutcomePortfolio {
  return {
    ...portfolio,
    ...patch,
    outcomes: portfolio.outcomes.map((outcome) => ({
      ...outcome,
      overnightSignals: [...outcome.overnightSignals],
      blockers: [...outcome.blockers],
      pendingActions: [...outcome.pendingActions],
      calendarContext: [...outcome.calendarContext],
    })),
    decisions: portfolio.decisions.map((decision) => ({ ...decision })),
  };
}

function seedTwin(events: BusinessEvent[]): EnterpriseDigitalTwin {
  const twin = new EnterpriseDigitalTwin({
    asOf: AS_OF,
    source: "reality-lab-simulation",
  });
  twin.apply(events);
  return twin;
}

function baseSeedEvents(orgId: string, prefix: string): BusinessEvent[] {
  return [
    {
      id: `${prefix}-evt-outcome-arr`,
      timestamp: AS_OF,
      sourceSystem: "manual",
      entityType: "Outcome",
      entityId: "outcome-enterprise-arr",
      eventType: "entity_upserted",
      importance: 90,
      confidence: 85,
      relationships: [],
      payload: { name: "Enterprise ARR" },
      metadata: { connectorId: "simulation", labels: [orgId] },
    },
    {
      id: `${prefix}-evt-decision`,
      timestamp: AS_OF,
      sourceSystem: "manual",
      entityType: "Decision",
      entityId: "decision-residency",
      eventType: "decision_required",
      importance: 92,
      confidence: 80,
      relationships: [
        {
          type: "affects",
          targetEntityId: "outcome-enterprise-arr",
          targetEntityType: "Outcome",
        },
      ],
      payload: { question: "Material executive Decision required" },
      metadata: { connectorId: "simulation", labels: [orgId] },
    },
  ];
}

function buildLightGraph(label: string): KnowledgeGraph {
  return new GraphBuilder()
    .withMeta({ asOf: AS_OF, source: `sim-${label}` })
    .entity({
      id: "outcome-enterprise-arr",
      type: "Outcome",
      label: "Enterprise ARR",
    })
    .entity({
      id: "decision-primary",
      type: "Decision",
      label: `${label} primary Decision`,
    })
    .entity({
      id: "risk-primary",
      type: "Risk",
      label: `${label} material risk`,
    })
    .entity({
      id: "person-exec",
      type: "Person",
      label: "Executive",
    })
    .relate({
      type: "affects",
      from: "decision-primary",
      to: "outcome-enterprise-arr",
    })
    .relate({
      type: "increases",
      from: "risk-primary",
      to: "outcome-enterprise-arr",
    })
    .relate({
      type: "owned_by",
      from: "decision-primary",
      to: "person-exec",
    })
    .build();
}

function adaptIntent(
  base: ExecutiveIntentProfile,
  name: string,
  title: string,
): ExecutiveIntentProfile {
  return {
    ...base,
    id: `intent-${name.toLowerCase().replace(/\s+/g, "-")}`,
    executiveName: name,
    title,
    asOf: AS_OF,
  };
}

function createPortfolioOrg(input: {
  id: string;
  name: string;
  industry: SimulatedOrganisation["industry"];
  executiveName: string;
  description: string;
  intent: ExecutiveIntentProfile;
  portfolioPatch?: Partial<OutcomePortfolio>;
  useNorthlineGraph?: boolean;
}): SimulatedOrganisation {
  return {
    id: input.id,
    name: input.name,
    industry: input.industry,
    executiveName: input.executiveName,
    asOf: AS_OF,
    description: input.description,
    createContext(): SimulationContext {
      const portfolio = clonePortfolio(MOCK_OUTCOME_PORTFOLIO, {
        executiveName: input.executiveName,
        refreshedAt: AS_OF,
        ...input.portfolioPatch,
      });
      const seedEvents = baseSeedEvents(input.id, input.id);
      return {
        organisationId: input.id,
        asOf: AS_OF,
        provider: createMockEnterpriseDataProvider(portfolio),
        graph: input.useNorthlineGraph
          ? buildNorthlineKnowledgeGraph()
          : buildLightGraph(input.name),
        intent: adaptIntent(
          input.intent,
          input.executiveName,
          input.intent.title,
        ),
        memory:
          input.id === "org-northline"
            ? createSeededExecutiveMemoryStore()
            : new InMemoryExecutiveMemoryStore({
                asOf: AS_OF,
                source: `sim-memory-${input.id}`,
              }),
        twin: seedTwin(seedEvents),
        portfolio,
        seedEvents,
      };
    },
  };
}

/** Northline Mining — full fidelity mock. */
export const ORG_NORTHLINE_MINING: SimulatedOrganisation = createPortfolioOrg({
  id: "org-northline",
  name: "Northline Mining",
  industry: "mining",
  executiveName: "Alex",
  description: "Flagship Northline portfolio with Helix commercial pressure.",
  intent: CEO_INTENT_PROFILE,
  useNorthlineGraph: true,
});

export const ORG_INDUSTRIAL_MANUFACTURER: SimulatedOrganisation =
  createPortfolioOrg({
    id: "org-forgeworks",
    name: "Forgeworks Industrial",
    industry: "industrial_manufacturing",
    executiveName: "Morgan",
    description: "Discrete manufacturer under supply-chain and margin pressure.",
    intent: COO_INTENT_PROFILE,
  });

export const ORG_ENTERPRISE_SAAS: SimulatedOrganisation = createPortfolioOrg({
  id: "org-clearpath",
  name: "Clearpath SaaS",
  industry: "enterprise_saas",
  executiveName: "Riley",
  description: "B2B SaaS platform facing expansion and retention trade-offs.",
  intent: CEO_INTENT_PROFILE,
});

export const ORG_UTILITIES_OPERATOR: SimulatedOrganisation = createPortfolioOrg({
  id: "org-gridline",
  name: "Gridline Utilities",
  industry: "utilities",
  executiveName: "Sam",
  description: "Regulated utility balancing reliability, capex, and board oversight.",
  intent: CFO_INTENT_PROFILE,
});

export const ORG_HEALTHCARE_PROVIDER: SimulatedOrganisation = createPortfolioOrg({
  id: "org-careaxis",
  name: "CareAxis Health",
  industry: "healthcare",
  executiveName: "Jordan",
  description: "Healthcare provider under clinical risk and capacity constraints.",
  intent: COO_INTENT_PROFILE,
});

export const SIMULATED_ORGANISATIONS: SimulatedOrganisation[] = [
  ORG_NORTHLINE_MINING,
  ORG_INDUSTRIAL_MANUFACTURER,
  ORG_ENTERPRISE_SAAS,
  ORG_UTILITIES_OPERATOR,
  ORG_HEALTHCARE_PROVIDER,
  ORG_APEX_FIELD_SERVICES,
];

export function getSimulatedOrganisation(
  id: string,
): SimulatedOrganisation | undefined {
  return SIMULATED_ORGANISATIONS.find((org) => org.id === id);
}
