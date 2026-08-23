import { buildIntelligentExecutiveSnapshot } from "@/intelligence/executive-intelligence";
import type { EnterpriseDataProvider } from "@/intelligence/executive-intelligence/providers/enterprise-data-provider";
import type { KnowledgeGraph } from "@/knowledge-graph";
import type { ExecutiveIntentProfile } from "@/intelligence/executive-intent";
import type { ExecutiveMemoryStore } from "@/intelligence/executive-memory";
import type { EnterpriseDigitalTwin } from "@/digital-twin";
import type { IntelligentExecutiveSnapshot } from "@/intelligence/executive-intelligence/types";

/** Today / snapshot entry with Field Services industry language enabled. */
export function buildFieldServicesExecutiveSnapshot(
  provider: EnterpriseDataProvider,
  graph?: KnowledgeGraph,
  intent?: ExecutiveIntentProfile,
  memory?: ExecutiveMemoryStore,
  twin?: EnterpriseDigitalTwin,
): IntelligentExecutiveSnapshot {
  return buildIntelligentExecutiveSnapshot(
    provider,
    graph,
    intent,
    memory,
    twin,
    { industryPack: "field-services-simpro" },
  );
}
