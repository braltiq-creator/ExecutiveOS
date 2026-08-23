/**
 * Live synchronisation orchestrator — full, incremental, delta, webhook, replay.
 */

import type { BusinessEvent } from "@/connectors/types";
import type { ExecutiveContextBrief } from "@/providers/microsoft365/executive-context/types";
import type { M365ConnectorConfiguration } from "@/providers/microsoft365/configuration";
import {
  createCheckpointStore,
  initialCheckpoint,
  type CheckpointStore,
  type SyncMode,
} from "@/providers/microsoft365/sync/checkpoints";
import { syncMicrosoft365ExecutiveContext } from "@/providers/microsoft365/provider";
import type { IntelligentExecutiveSnapshot } from "@/intelligence/executive-intelligence/types";
import type { EnterpriseDigitalTwin } from "@/digital-twin";
import type { KnowledgeGraph } from "@/knowledge-graph";

export type SyncRunResult = {
  mode: SyncMode;
  connectionId: string;
  startedAt: string;
  finishedAt: string;
  events: BusinessEvent[];
  brief: ExecutiveContextBrief;
  checkpoints: ReturnType<CheckpointStore["list"]>;
  ok: boolean;
  message: string;
};

export type LiveSyncEngine = {
  run(input: {
    mode: SyncMode;
    config: M365ConnectorConfiguration;
    snapshot?: IntelligentExecutiveSnapshot;
    twin?: EnterpriseDigitalTwin;
    graph?: KnowledgeGraph;
    asOf?: string;
  }): Promise<SyncRunResult>;
  checkpoints(): CheckpointStore;
  replay(connectionId: string): BusinessEvent[];
};

export function createLiveSyncEngine(): LiveSyncEngine {
  const store = createCheckpointStore();
  const journal: BusinessEvent[] = [];

  return {
    checkpoints: () => store,
    replay(connectionId) {
      return journal.filter(
        (e) => e.metadata.connectorId === `m365-${connectionId}`,
      );
    },
    async run(input) {
      const asOf = input.asOf ?? new Date().toISOString();
      const connectionId = `${input.config.executiveosTenantId}:${input.config.microsoftTenantId ?? "pending"}`;
      const startedAt = asOf;

      for (const service of input.config.enabledServices) {
        const current =
          store.get(connectionId, service) ??
          initialCheckpoint(connectionId, service);
        store.save({
          ...current,
          mode: input.mode,
          status: "running",
          lastAttemptAt: asOf,
        });
      }

      try {
        const result = await syncMicrosoft365ExecutiveContext({
          snapshot: input.snapshot,
          twin: input.twin,
          graph: input.graph,
          options: {
            tenantId: input.config.microsoftTenantId ?? "northline-tenant",
            asOf,
          },
        });

        const tagged = result.events.map((event) => ({
          ...event,
          metadata: {
            ...event.metadata,
            connectorId: `m365-${connectionId}`,
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
            initialCheckpoint(connectionId, service);
          store.save({
            ...current,
            mode: input.mode,
            status: "succeeded",
            watermark: asOf,
            deltaToken:
              input.mode === "delta" ? `delta:${service}:${asOf}` : current.deltaToken,
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
            initialCheckpoint(connectionId, service);
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
          brief: resultBriefFallback(asOf),
          checkpoints: store.list(connectionId),
          ok: false,
          message,
        };
      }
    },
  };
}

function resultBriefFallback(asOf: string): ExecutiveContextBrief {
  return {
    asOf,
    providerId: "microsoft365",
    framing: "Sync failed — executive context unavailable",
    commitments: [],
    signals: [],
    stakeholders: [],
    documents: [],
    conversations: [],
    communications: [],
    initiativeProgress: [],
    boardReadiness: {
      level: "not_ready",
      label: "Unavailable",
      detail: "Live sync failed",
    },
    upcomingDecisionIds: [],
    closingNote: "Recover from checkpoint and retry.",
  };
}
