import type { IntelligentExecutiveSnapshot } from "@/intelligence/executive-intelligence/types";
import type { EnterpriseDigitalTwin } from "@/digital-twin";
import type { KnowledgeGraph } from "@/knowledge-graph";
import {
  buildExecutiveContextBriefFromMock,
  syncMicrosoft365ExecutiveContext,
  type Microsoft365ProviderOptions,
} from "@/providers/microsoft365/provider";
import type { ExecutiveContextBrief } from "@/providers/microsoft365/executive-context/types";
import { enrichRelationshipGraph } from "@/providers/microsoft365/relationships";
import { getM365ConnectionRegistry } from "@/providers/microsoft365/connection";

export type ApplyMicrosoft365Options = Microsoft365ProviderOptions & {
  /** ExecutiveOS tenant — when connected, prefer live brief over mock. */
  executiveosTenantId?: string;
  /** Force mock even if a live connection exists. */
  preferMock?: boolean;
};

/**
 * Apply Microsoft 365 executive context onto the intelligent snapshot.
 * Uses live connection brief when available; otherwise deterministic mock Graph.
 */
export function applyMicrosoft365ExecutiveContext(input: {
  snapshot: IntelligentExecutiveSnapshot;
  twin?: EnterpriseDigitalTwin;
  graph?: KnowledgeGraph;
  options?: ApplyMicrosoft365Options;
}): {
  executiveContextBrief: ExecutiveContextBrief;
  snapshot: IntelligentExecutiveSnapshot;
} {
  const executiveosTenantId =
    input.options?.executiveosTenantId ?? input.options?.tenantId;
  const registry = getM365ConnectionRegistry();
  const liveBrief =
    !input.options?.preferMock && executiveosTenantId
      ? registry.getLiveBrief(executiveosTenantId)
      : null;

  const result = liveBrief
    ? { brief: liveBrief, events: [] as const }
    : buildExecutiveContextBriefFromMock({
        options: input.options,
        snapshot: input.snapshot,
      });

  if (input.twin && "events" in result && result.events.length > 0) {
    input.twin.apply([...result.events]);
  }
  if (input.graph) {
    enrichRelationshipGraph(input.graph, result.brief);
  }

  return {
    executiveContextBrief: result.brief,
    snapshot: {
      ...input.snapshot,
      executiveContextBrief: result.brief,
    },
  };
}

export async function applyMicrosoft365ExecutiveContextAsync(input: {
  snapshot: IntelligentExecutiveSnapshot;
  twin?: EnterpriseDigitalTwin;
  graph?: KnowledgeGraph;
  options?: ApplyMicrosoft365Options;
}): Promise<{
  executiveContextBrief: ExecutiveContextBrief;
  snapshot: IntelligentExecutiveSnapshot;
}> {
  const executiveosTenantId =
    input.options?.executiveosTenantId ?? input.options?.tenantId;
  const registry = getM365ConnectionRegistry();

  if (
    !input.options?.preferMock &&
    executiveosTenantId &&
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
        executiveContextBrief: sync.brief,
        snapshot: {
          ...input.snapshot,
          executiveContextBrief: sync.brief,
        },
      };
    }
  }

  const result = await syncMicrosoft365ExecutiveContext(input);
  return {
    executiveContextBrief: result.brief,
    snapshot: {
      ...input.snapshot,
      executiveContextBrief: result.brief,
    },
  };
}
