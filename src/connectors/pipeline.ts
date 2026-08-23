import type { EnterpriseConnector } from "@/connectors/connector";
import type { SyncObservability, SyncOptions } from "@/connectors/types";
import { updateKnowledgeGraphFromTwin } from "@/digital-twin/graph-bridge";
import { createTwinEnterpriseDataProvider } from "@/digital-twin/signals-bridge";
import type { EnterpriseDigitalTwin } from "@/digital-twin/twin";
import type { TwinApplyResult } from "@/digital-twin/types";
import { buildIntelligentExecutiveSnapshot } from "@/intelligence/executive-intelligence";
import type { IntelligentExecutiveSnapshot } from "@/intelligence/executive-intelligence/types";
import type { KnowledgeGraph } from "@/knowledge-graph";
import { getKnowledgeGraph } from "@/knowledge-graph";

export type PipelineOptions = SyncOptions & {
  /** When true, build IntelligentExecutiveSnapshot from Twin signals */
  runIntelligence?: boolean;
  graph?: KnowledgeGraph;
  snapshotLabel?: string;
};

export type PipelineResult = {
  connectorObservability: SyncObservability[];
  twinApply: TwinApplyResult;
  graphBridge: {
    entitiesUpserted: number;
    relationshipsUpserted: number;
    skippedRelationships: number;
  };
  twinSnapshotId: string;
  intelligence?: IntelligentExecutiveSnapshot;
  totals: {
    recordsProcessed: number;
    eventsCreated: number;
    latencyMs: number;
    errors: number;
    warnings: number;
  };
};

/**
 * Sync pipeline:
 * Connector → Validation → Normalisation → BusinessEvent
 * → Digital Twin → Knowledge Graph → (optional) Executive Intelligence
 */
export function runEnterpriseSyncPipeline(
  connectors: EnterpriseConnector[],
  twin: EnterpriseDigitalTwin,
  options: PipelineOptions = {},
): PipelineResult {
  const started = Date.now();
  const connectorObservability: SyncObservability[] = [];
  const allEvents: import("@/connectors/types").BusinessEvent[] = [];

  for (const connector of connectors) {
    const result = connector.sync(options);
    connectorObservability.push(result.observability);
    allEvents.push(...result.events);
  }

  const twinApply = twin.apply(allEvents);
  const twinSnapshot = twin.snapshot(options.snapshotLabel ?? "sync");
  const graph = options.graph ?? getKnowledgeGraph();
  const graphBridge = updateKnowledgeGraphFromTwin(twin, graph);

  let intelligence: IntelligentExecutiveSnapshot | undefined;
  if (options.runIntelligence) {
    const provider = createTwinEnterpriseDataProvider(twin);
    intelligence = buildIntelligentExecutiveSnapshot(provider, graph);
  }

  const totals = {
    recordsProcessed: connectorObservability.reduce(
      (sum, item) => sum + item.recordsProcessed,
      0,
    ),
    eventsCreated: connectorObservability.reduce(
      (sum, item) => sum + item.eventsCreated,
      0,
    ),
    latencyMs: Math.max(0, Date.now() - started),
    errors: connectorObservability.reduce(
      (sum, item) => sum + item.errors.length,
      0,
    ),
    warnings: connectorObservability.reduce(
      (sum, item) => sum + item.warnings.length,
      0,
    ),
  };

  return {
    connectorObservability,
    twinApply,
    graphBridge,
    twinSnapshotId: twinSnapshot.id,
    intelligence,
    totals,
  };
}
