import { createMockEnterpriseDataProvider } from "@/intelligence/executive-intelligence";
import { CEO_INTENT_PROFILE } from "@/intelligence/executive-intent";
import { InMemoryExecutiveMemoryStore } from "@/intelligence/executive-memory";
import { GraphBuilder } from "@/knowledge-graph";
import { EnterpriseDigitalTwin } from "@/digital-twin";
import { MOCK_OUTCOME_PORTFOLIO } from "@/lib/outcomes/mock-portfolio";
import type { SimulatedOrganisation, SimulationContext } from "@/simulation/types";
import {
  createMockSimproDomainEvents,
  createSimproDomainAdapter,
} from "@/industry/field-services/simpro/adapter";
import { MOCK_FIELD_SERVICE_KPIS } from "@/industry/field-services/simpro/kpis";

const AS_OF = "2026-07-20T06:15:00+10:00";

/**
 * Apex Field Services — Simpro-backed simulated organisation.
 */
export const ORG_APEX_FIELD_SERVICES: SimulatedOrganisation = {
  id: "org-apex-field-services",
  name: "Apex Field Services",
  industry: "field_services",
  executiveName: "Casey",
  asOf: AS_OF,
  description:
    "Multi-trade field services contractor operating on Simpro — HVAC, electrical, mechanical.",
  createContext(): SimulationContext {
    const portfolio = {
      ...MOCK_OUTCOME_PORTFOLIO,
      executiveName: "Casey",
      refreshedAt: AS_OF,
    };
    const adapter = createSimproDomainAdapter();
    const simproEvents = createMockSimproDomainEvents(AS_OF);
    const businessEvents = adapter.toBusinessEventsMany(simproEvents);

    // Seed focus outcomes for field services
    const seed = [
      {
        id: "evt-fs-outcome-revenue",
        timestamp: AS_OF,
        sourceSystem: "manual" as const,
        entityType: "Outcome" as const,
        entityId: "outcome-fs-revenue",
        eventType: "entity_upserted",
        importance: 95,
        confidence: 90,
        relationships: [],
        payload: { name: "Field Service Revenue" },
        metadata: { connectorId: "seed", labels: ["field-services"] },
      },
      ...businessEvents,
      ...Object.entries(MOCK_FIELD_SERVICE_KPIS.values).map(([kpiId, value]) => ({
        id: `evt-fs-kpi-${kpiId}`,
        timestamp: AS_OF,
        sourceSystem: "simpro" as const,
        entityType: "Metric" as const,
        entityId: `kpi-${kpiId}`,
        eventType: "entity_upserted",
        importance: 55,
        confidence: 85,
        relationships: [],
        payload: {
          name: kpiId,
          value,
          fieldServiceKpis: MOCK_FIELD_SERVICE_KPIS.values,
        },
        metadata: {
          connectorId: "adapter-simpro",
          labels: ["field-services", "kpi"],
        },
      })),
    ];

    const twin = new EnterpriseDigitalTwin({
      asOf: AS_OF,
      source: "apex-field-services",
    });
    twin.apply(seed);

    const graph = new GraphBuilder()
      .withMeta({ asOf: AS_OF, source: "apex-field-services" })
      .entity({
        id: "outcome-enterprise-arr",
        type: "Outcome",
        label: "Enterprise Revenue",
      })
      .entity({
        id: "outcome-fs-revenue",
        type: "Outcome",
        label: "Field Service Revenue",
      })
      .entity({
        id: "outcome-efficiency",
        type: "Outcome",
        label: "Field Operations Efficiency",
      })
      .entity({
        id: "person-casey",
        type: "Person",
        label: "Casey",
      })
      .entity({
        id: "system-simpro",
        type: "System",
        label: "Simpro",
      })
      .relate({
        type: "affects",
        from: "outcome-fs-revenue",
        to: "outcome-enterprise-arr",
      })
      .relate({
        type: "owned_by",
        from: "outcome-fs-revenue",
        to: "person-casey",
      })
      .build();

    return {
      organisationId: "org-apex-field-services",
      asOf: AS_OF,
      provider: createMockEnterpriseDataProvider(portfolio),
      graph,
      intent: {
        ...CEO_INTENT_PROFILE,
        id: "intent-apex-fs",
        executiveName: "Casey",
        title: "Chief Executive Officer — Field Services",
        asOf: AS_OF,
      },
      memory: new InMemoryExecutiveMemoryStore({
        asOf: AS_OF,
        source: "apex-fs-memory",
      }),
      twin,
      portfolio,
      seedEvents: seed,
    };
  },
};
