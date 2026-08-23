import type { IntelligentExecutiveSnapshot } from "@/intelligence/executive-intelligence/types";
import type { EnterpriseDigitalTwin } from "@/digital-twin";
import type { KnowledgeGraph } from "@/knowledge-graph";
import {
  buildOperationalContextBriefFromMock,
  syncSimproExecutiveContext,
  type SimproProviderOptions,
} from "@/providers/simpro/provider";
import type { OperationalContextBrief } from "@/providers/simpro/executive-context/types";
import { enrichOperationalGraph } from "@/providers/simpro/relationships";
import { getSimproConnectionRegistry } from "@/providers/simpro/connection";

export type ApplySimproOptions = SimproProviderOptions & {
  preferMock?: boolean;
};

/**
 * Apply Simpro operational context onto the intelligent snapshot.
 * Prefers live connection brief when available.
 */
export function applySimproExecutiveContext(input: {
  snapshot: IntelligentExecutiveSnapshot;
  twin?: EnterpriseDigitalTwin;
  graph?: KnowledgeGraph;
  options?: ApplySimproOptions;
}): {
  operationalContextBrief: OperationalContextBrief;
  snapshot: IntelligentExecutiveSnapshot;
} {
  const executiveosTenantId =
    input.options?.executiveosTenantId ?? "tenant-northline";
  const registry = getSimproConnectionRegistry();
  const liveBrief =
    !input.options?.preferMock
      ? registry.getLiveBrief(executiveosTenantId)
      : null;

  const brief =
    liveBrief ??
    buildOperationalContextBriefFromMock({
      options: input.options,
      snapshot: input.snapshot,
    });

  if (input.graph) {
    enrichOperationalGraph(input.graph, brief, []);
  }

  return {
    operationalContextBrief: brief,
    snapshot: {
      ...input.snapshot,
      operationalContextBrief: brief,
    },
  };
}

export async function applySimproExecutiveContextAsync(input: {
  snapshot: IntelligentExecutiveSnapshot;
  twin?: EnterpriseDigitalTwin;
  graph?: KnowledgeGraph;
  options?: ApplySimproOptions;
}): Promise<{
  operationalContextBrief: OperationalContextBrief;
  snapshot: IntelligentExecutiveSnapshot;
}> {
  const executiveosTenantId =
    input.options?.executiveosTenantId ?? "tenant-northline";
  const registry = getSimproConnectionRegistry();

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
        operationalContextBrief: sync.brief,
        snapshot: {
          ...input.snapshot,
          operationalContextBrief: sync.brief,
        },
      };
    }
  }

  const result = await syncSimproExecutiveContext(input);
  return {
    operationalContextBrief: result.brief,
    snapshot: {
      ...input.snapshot,
      operationalContextBrief: result.brief,
    },
  };
}
