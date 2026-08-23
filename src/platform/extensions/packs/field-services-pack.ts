import type { ExecutiveKnowledgePack } from "@/platform/contracts/knowledge-pack";
import {
  toPackKpis,
  toPackRules,
} from "@/platform/contracts/knowledge-pack";
import { createManifest, defaultCompatibility } from "@/platform/sdk";
import {
  FIELD_SERVICE_BENCHMARKS,
  FIELD_SERVICE_JUDGEMENT_RULES,
  FIELD_SERVICE_KPI_LIBRARY,
  FIELD_SERVICES_SCENARIOS,
  HEALTH_DIMENSION_IDS,
  HEALTH_DIMENSION_LABELS,
  SIMPRO_EVENT_MAPPINGS,
  createSimproDomainAdapter,
} from "@/industry/field-services/simpro";
import type { BusinessEventMapper } from "@/platform/contracts/business-event";

/**
 * Field Services Knowledge Pack — wraps existing Simpro industry pack.
 * Registers as an extension; does not modify Core.
 */
export function createFieldServicesKnowledgePack(): ExecutiveKnowledgePack {
  const adapter = createSimproDomainAdapter();

  const mapper: BusinessEventMapper = {
    id: "mapper-simpro-domain",
    sourceSystem: "simpro",
    map(input: unknown) {
      const event = input as Parameters<typeof adapter.toBusinessEvents>[0];
      return adapter.toBusinessEvents(event);
    },
    describe(event) {
      return String(event.payload.executiveMeaning ?? event.eventType);
    },
  };

  const manifest = createManifest({
    id: "pack-field-services-simpro",
    name: "Field Services (Simpro) Knowledge Pack",
    kind: "knowledge_pack",
    version: { major: 1, minor: 0, patch: 0 },
    description:
      "Executive intelligence for field service organisations. Works with any BusinessEvent-producing connector (Simpro affinity).",
    compatibility: defaultCompatibility(),
    provides: [
      "field-services",
      "kpis",
      "health-model",
      "judgement-rules",
      "benchmarks",
      "scenarios",
      "vocabulary",
    ],
    author: "ExecutiveOS",
  });

  return {
    manifest,
    identity: () => manifest,
    supportedDomains: () => [
      "field_services",
      "maintenance",
      "projects",
      "service_agreements",
      "workforce",
    ],
    vocabulary: () =>
      SIMPRO_EVENT_MAPPINGS.map((mapping) => ({
        term: mapping.simproEvent,
        executiveMeaning: mapping.executiveMeaning,
        aliases: [mapping.eventType],
      })),
    executiveKpis: () => toPackKpis(FIELD_SERVICE_KPI_LIBRARY),
    healthModels: () => [
      {
        id: "fs-executive-health",
        label: "Field Services Executive Health",
        dimensions: HEALTH_DIMENSION_IDS.map(
          (id) => HEALTH_DIMENSION_LABELS[id],
        ),
        description:
          "Revenue, operational, people, customer, cash, execution, growth health.",
      },
    ],
    judgementRules: () => toPackRules(FIELD_SERVICE_JUDGEMENT_RULES),
    benchmarks: () => FIELD_SERVICE_BENCHMARKS,
    realityLabScenarios: () => FIELD_SERVICES_SCENARIOS,
    narrativeTemplates: () => [
      {
        id: "fs-util-constrains-growth",
        situation: "high_utilisation",
        template:
          "Technician utilisation is constraining revenue growth.",
        placeholders: [],
      },
      {
        id: "fs-margin-primary-risk",
        situation: "margin_erosion",
        template: "Gross margin erosion is now the primary strategic risk.",
        placeholders: [],
      },
      {
        id: "fs-cash-after-projects",
        situation: "cash_lag",
        template:
          "Cash collection has weakened after project completion.",
        placeholders: [],
      },
    ],
    supportedConnectors: () => [
      "connector-simpro",
      "adapter-simpro",
      "connector-maximo-mock",
      "connector-sap-mock",
    ],
    businessEventMapper: () => mapper,
  };
}
