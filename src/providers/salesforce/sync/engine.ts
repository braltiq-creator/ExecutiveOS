import type { BusinessEvent } from "@/connectors/types";
import type { CommercialContextBrief } from "@/providers/salesforce/executive-context/types";
import type { SalesforceConnectorConfiguration } from "@/providers/salesforce/configuration";
import {
  createSalesforceCheckpointStore,
  initialSalesforceCheckpoint,
  type SalesforceCheckpointStore,
  type SalesforceSyncMode,
} from "@/providers/salesforce/sync/checkpoints";
import { syncSalesforceExecutiveContext } from "@/providers/salesforce/provider";
import type { IntelligentExecutiveSnapshot } from "@/intelligence/executive-intelligence/types";
import type { EnterpriseDigitalTwin } from "@/digital-twin";
import type { KnowledgeGraph } from "@/knowledge-graph";

export type SalesforceSyncRunResult = {
  mode: SalesforceSyncMode;
  connectionId: string;
  startedAt: string;
  finishedAt: string;
  events: BusinessEvent[];
  brief: CommercialContextBrief;
  checkpoints: ReturnType<SalesforceCheckpointStore["list"]>;
  ok: boolean;
  message: string;
};

export type SalesforceLiveSyncEngine = {
  run(input: {
    mode: SalesforceSyncMode;
    config: SalesforceConnectorConfiguration;
    snapshot?: IntelligentExecutiveSnapshot;
    twin?: EnterpriseDigitalTwin;
    graph?: KnowledgeGraph;
    asOf?: string;
  }): Promise<SalesforceSyncRunResult>;
  checkpoints(): SalesforceCheckpointStore;
  replay(connectionId: string): BusinessEvent[];
};

export function createSalesforceLiveSyncEngine(): SalesforceLiveSyncEngine {
  const store = createSalesforceCheckpointStore();
  const journal: BusinessEvent[] = [];

  return {
    checkpoints: () => store,
    replay(connectionId) {
      return journal.filter(
        (e) => e.metadata.connectorId === `salesforce-${connectionId}`,
      );
    },
    async run(input) {
      const asOf = input.asOf ?? new Date().toISOString();
      const connectionId = `${input.config.executiveosTenantId}:${input.config.orgId ?? "pending"}`;
      const startedAt = asOf;

      for (const service of input.config.enabledServices) {
        const current =
          store.get(connectionId, service) ??
          initialSalesforceCheckpoint(connectionId, service);
        store.save({
          ...current,
          mode: input.mode,
          status: "running",
          lastAttemptAt: asOf,
        });
      }

      try {
        const result = await syncSalesforceExecutiveContext({
          snapshot: input.snapshot,
          twin: input.twin,
          graph: input.graph,
          options: {
            executiveosTenantId: input.config.executiveosTenantId,
            orgId: input.config.orgId ?? "northline-sf",
            asOf,
            modifiedSince:
              input.mode === "incremental" || input.mode === "cdc"
                ? store.list(connectionId).find((c) => c.watermark)?.watermark ??
                  undefined
                : undefined,
          },
        });

        const tagged = result.events.map((event) => ({
          ...event,
          metadata: {
            ...event.metadata,
            connectorId: `salesforce-${connectionId}`,
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
            initialSalesforceCheckpoint(connectionId, service);
          store.save({
            ...current,
            mode: input.mode,
            status: "succeeded",
            watermark: asOf,
            replayId: `replay-${asOf}`,
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
            initialSalesforceCheckpoint(connectionId, service);
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

function buildFailedBrief(asOf: string): CommercialContextBrief {
  return {
    asOf,
    providerId: "salesforce",
    framing: "Commercial sync failed — context unavailable",
    commercialHealth: {
      level: "critical",
      label: "Unavailable",
      detail: "Live sync failed",
    },
    pipelineHealth: {
      level: "critical",
      label: "Unknown",
      openPipelineValue: 0,
      openDeals: 0,
      weightedForecast: 0,
      detail: "Sync failed",
    },
    revenueForecast: {
      level: "critical",
      label: "Unknown",
      forecastValue: 0,
      accuracyPct: 0,
      detail: "Sync failed",
    },
    commercialMomentum: {
      level: "critical",
      label: "Unknown",
      detail: "Sync failed",
    },
    strategicAccounts: [],
    commercialRisks: [],
    renewalRisks: [],
    largeDealsAtRisk: [],
    customerHealth: {
      level: "critical",
      label: "Unknown",
      detail: "Sync failed",
    },
    salesMomentum: {
      level: "critical",
      label: "Unknown",
      detail: "Sync failed",
    },
    signals: [],
    recommendations: [],
    closingNote: "Recover from checkpoint and retry.",
  };
}
