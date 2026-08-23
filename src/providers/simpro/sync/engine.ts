import type { BusinessEvent } from "@/connectors/types";
import type { OperationalContextBrief } from "@/providers/simpro/executive-context/types";
import type { SimproConnectorConfiguration } from "@/providers/simpro/configuration";
import {
  createSimproCheckpointStore,
  initialSimproCheckpoint,
  type SimproCheckpointStore,
  type SimproSyncMode,
} from "@/providers/simpro/sync/checkpoints";
import { syncSimproExecutiveContext } from "@/providers/simpro/provider";
import type { IntelligentExecutiveSnapshot } from "@/intelligence/executive-intelligence/types";
import type { EnterpriseDigitalTwin } from "@/digital-twin";
import type { KnowledgeGraph } from "@/knowledge-graph";

export type SimproSyncRunResult = {
  mode: SimproSyncMode;
  connectionId: string;
  startedAt: string;
  finishedAt: string;
  events: BusinessEvent[];
  brief: OperationalContextBrief;
  checkpoints: ReturnType<SimproCheckpointStore["list"]>;
  ok: boolean;
  message: string;
};

export type SimproLiveSyncEngine = {
  run(input: {
    mode: SimproSyncMode;
    config: SimproConnectorConfiguration;
    snapshot?: IntelligentExecutiveSnapshot;
    twin?: EnterpriseDigitalTwin;
    graph?: KnowledgeGraph;
    asOf?: string;
  }): Promise<SimproSyncRunResult>;
  checkpoints(): SimproCheckpointStore;
  replay(connectionId: string): BusinessEvent[];
};

export function createSimproLiveSyncEngine(): SimproLiveSyncEngine {
  const store = createSimproCheckpointStore();
  const journal: BusinessEvent[] = [];

  return {
    checkpoints: () => store,
    replay(connectionId) {
      return journal.filter(
        (e) => e.metadata.connectorId === `simpro-${connectionId}`,
      );
    },
    async run(input) {
      const asOf = input.asOf ?? new Date().toISOString();
      const connectionId = `${input.config.executiveosTenantId}:${input.config.companyId ?? "pending"}`;
      const startedAt = asOf;

      for (const service of input.config.enabledServices) {
        const current =
          store.get(connectionId, service) ??
          initialSimproCheckpoint(connectionId, service);
        store.save({
          ...current,
          mode: input.mode,
          status: "running",
          lastAttemptAt: asOf,
        });
      }

      try {
        const result = await syncSimproExecutiveContext({
          snapshot: input.snapshot,
          twin: input.twin,
          graph: input.graph,
          options: {
            executiveosTenantId: input.config.executiveosTenantId,
            companyId: input.config.companyId ?? "northline-simpro",
            asOf,
            modifiedSince:
              input.mode === "incremental"
                ? store.list(connectionId).find((c) => c.watermark)?.watermark ??
                  undefined
                : undefined,
          },
        });

        const tagged = result.events.map((event) => ({
          ...event,
          metadata: {
            ...event.metadata,
            connectorId: `simpro-${connectionId}`,
            labels: [
              ...(event.metadata.labels ?? []),
              "live-sync",
              input.mode,
            ],
          },
        }));
        journal.push(...tagged);

        for (const service of input.config.enabledServices) {
          const current =
            store.get(connectionId, service) ??
            initialSimproCheckpoint(connectionId, service);
          store.save({
            ...current,
            mode: input.mode,
            status: "succeeded",
            watermark: asOf,
            lastSuccessAt: asOf,
            lastAttemptAt: asOf,
            eventsProduced: current.eventsProduced + tagged.length,
            lastError: null,
          });
        }

        if (input.twin) input.twin.apply(tagged);

        return {
          mode: input.mode,
          connectionId,
          startedAt,
          finishedAt: asOf,
          events: tagged,
          brief: result.brief,
          checkpoints: store.list(connectionId),
          ok: true,
          message: `${input.mode} sync produced ${tagged.length} BusinessEvents`,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Sync failed";
        for (const service of input.config.enabledServices) {
          const current =
            store.get(connectionId, service) ??
            initialSimproCheckpoint(connectionId, service);
          store.save({
            ...current,
            status: "failed",
            lastAttemptAt: asOf,
            lastError: message,
          });
        }
        return {
          mode: input.mode,
          connectionId,
          startedAt,
          finishedAt: asOf,
          events: [],
          brief: buildFailedBrief(asOf),
          checkpoints: store.list(connectionId),
          ok: false,
          message,
        };
      }
    },
  };
}

function buildFailedBrief(asOf: string): OperationalContextBrief {
  return {
    asOf,
    providerId: "simpro",
    framing: "Operational sync failed — context unavailable",
    operationalHealth: {
      level: "critical",
      label: "Unavailable",
      detail: "Live sync failed",
    },
    capacity: {
      level: "critical",
      label: "Unknown",
      utilisedPct: 0,
      availableTechnicians: 0,
      unavailableTechnicians: 0,
      detail: "Sync failed",
    },
    fieldProductivity: {
      level: "critical",
      label: "Unknown",
      utilisationPct: 0,
      overtimeHours: 0,
      detail: "Sync failed",
    },
    technicianUtilisation: {
      level: "critical",
      utilisedPct: 0,
      label: "Unknown",
      detail: "Sync failed",
    },
    serviceDelivery: {
      openJobs: 0,
      criticalJobs: 0,
      completedToday: 0,
      backlogLabel: "Unknown",
      detail: "Sync failed",
    },
    servicePerformance: {
      level: "critical",
      label: "Unknown",
      completedToday: 0,
      criticalOpen: 0,
      onTimePct: 0,
      detail: "Sync failed",
    },
    revenuePipeline: {
      acceptedQuotesValue: 0,
      openOpportunities: 0,
      label: "Unknown",
      detail: "Sync failed",
    },
    cashCollection: {
      overdueInvoices: 0,
      overdueValue: 0,
      riskLevel: "critical",
      detail: "Sync failed",
    },
    jobsAtRisk: [],
    criticalCustomers: [],
    customerRisks: [],
    bottlenecks: [],
    safetySignals: [],
    assetAvailability: {
      level: "critical",
      label: "Unknown",
      detail: "Sync failed",
    },
    operationalOpportunities: [],
    signals: [],
    recommendations: [],
    closingNote: "Recover from checkpoint and retry.",
  };
}
