"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  disconnectIntegrationAction,
  refreshIntegrationTokensAction,
  syncIntegrationAction,
} from "@/lib/integrations/actions";
import type { IntegrationView } from "@/lib/integrations/types";
import { SyncStatus } from "@/components/integrations/SyncStatus";

type IntegrationSettingsProps = {
  view: IntegrationView;
  canManage: boolean;
};

const secondaryButtonClassName =
  "inline-flex h-9 items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-900 transition-colors hover:border-zinc-300 hover:bg-zinc-50 disabled:opacity-60";

export function IntegrationSettings({ view, canManage }: IntegrationSettingsProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { integration, health, recentSyncJobs } = view;

  if (!integration || !health.isConnected) {
    return null;
  }

  function runAction(action: () => Promise<{ error: string | null }>) {
    setError(null);

    startTransition(async () => {
      const result = await action();

      if (result.error) {
        setError(result.error);
        return;
      }

      router.refresh();
    });
  }

  return (
    <div className="mt-6 space-y-6 border-t border-zinc-100 pt-6">
      <SyncStatus health={health} />

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {canManage ? (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={isPending || health.isSyncing}
            onClick={() =>
              runAction(() => syncIntegrationAction({ integrationId: integration.id }))
            }
            className={secondaryButtonClassName}
          >
            {health.isSyncing ? "Syncing..." : "Sync now"}
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() =>
              runAction(() =>
                refreshIntegrationTokensAction({ integrationId: integration.id }),
              )
            }
            className={secondaryButtonClassName}
          >
            Refresh tokens
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() =>
              runAction(() =>
                disconnectIntegrationAction({ integrationId: integration.id }),
              )
            }
            className="inline-flex h-9 items-center justify-center rounded-lg border border-red-200 bg-white px-4 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 disabled:opacity-60"
          >
            Disconnect
          </button>
        </div>
      ) : null}

      {recentSyncJobs.length > 0 ? (
        <div>
          <h4 className="text-sm font-medium text-zinc-900">Sync history</h4>
          <ul className="mt-3 space-y-2">
            {recentSyncJobs.map((job) => (
              <li
                key={job.id}
                className="flex items-center justify-between rounded-lg border border-zinc-100 bg-zinc-50/70 px-3 py-2 text-sm"
              >
                <span className="capitalize text-zinc-700">{job.trigger_type}</span>
                <span className="text-zinc-500">
                  {job.status} · {job.records_processed} records
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
