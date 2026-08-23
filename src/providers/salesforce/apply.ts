import type { IntelligentExecutiveSnapshot } from "@/intelligence/executive-intelligence/types";
import type { EnterpriseDigitalTwin } from "@/digital-twin";
import type { KnowledgeGraph } from "@/knowledge-graph";
import {
  buildCommercialContextBriefFromMock,
  syncSalesforceExecutiveContext,
  type SalesforceProviderOptions,
} from "@/providers/salesforce/provider";
import type { CommercialContextBrief } from "@/providers/salesforce/executive-context/types";
import { enrichCommercialGraph } from "@/providers/salesforce/relationships";
import { getSalesforceConnectionRegistry } from "@/providers/salesforce/connection";

export type ApplySalesforceOptions = SalesforceProviderOptions & {
  preferMock?: boolean;
};

/**
 * Apply Salesforce commercial context onto the intelligent snapshot.
 * Prefers live connection brief when available.
 */
export function applySalesforceExecutiveContext(input: {
  snapshot: IntelligentExecutiveSnapshot;
  twin?: EnterpriseDigitalTwin;
  graph?: KnowledgeGraph;
  options?: ApplySalesforceOptions;
}): {
  commercialContextBrief: CommercialContextBrief;
  snapshot: IntelligentExecutiveSnapshot;
} {
  const executiveosTenantId =
    input.options?.executiveosTenantId ?? "tenant-northline";
  const registry = getSalesforceConnectionRegistry();
  const liveBrief =
    !input.options?.preferMock
      ? registry.getLiveBrief(executiveosTenantId)
      : null;

  const brief =
    liveBrief ??
    buildCommercialContextBriefFromMock({
      options: input.options,
      snapshot: input.snapshot,
    });

  if (input.graph) {
    enrichCommercialGraph(input.graph, brief, []);
  }

  return {
    commercialContextBrief: brief,
    snapshot: {
      ...input.snapshot,
      commercialContextBrief: brief,
    },
  };
}

export async function applySalesforceExecutiveContextAsync(input: {
  snapshot: IntelligentExecutiveSnapshot;
  twin?: EnterpriseDigitalTwin;
  graph?: KnowledgeGraph;
  options?: ApplySalesforceOptions;
}): Promise<{
  commercialContextBrief: CommercialContextBrief;
  snapshot: IntelligentExecutiveSnapshot;
}> {
  const executiveosTenantId =
    input.options?.executiveosTenantId ?? "tenant-northline";
  const registry = getSalesforceConnectionRegistry();

  if (
    !input.options?.preferMock &&
    registry.get(executiveosTenantId)?.config.connected
  ) {
    const sync = await registry.sync({
      executiveosTenantId,
      mode: "incremental",
      snapshot: input.snapshot,
      twin: input.twin,
      graph: input.graph,
      asOf: input.options?.asOf ?? input.snapshot.asOf,
    });
    if (sync?.ok) {
      return {
        commercialContextBrief: sync.brief,
        snapshot: {
          ...input.snapshot,
          commercialContextBrief: sync.brief,
        },
      };
    }
  }

  const result = await syncSalesforceExecutiveContext(input);
  return {
    commercialContextBrief: result.brief,
    snapshot: {
      ...input.snapshot,
      commercialContextBrief: result.brief,
    },
  };
}
