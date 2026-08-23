import type { IntegrationHealthSnapshot } from "@/lib/integrations/types";
import { formatHealthStatus, formatRelativeTime } from "@/lib/integrations/types";

type SyncStatusProps = {
  health: IntegrationHealthSnapshot;
};

function statusColor(status: IntegrationHealthSnapshot["status"]): string {
  switch (status) {
    case "connected":
      return "bg-emerald-500";
    case "syncing":
      return "bg-blue-500";
    case "error":
      return "bg-red-500";
    default:
      return "bg-zinc-300";
  }
}

export function SyncStatus({ health }: SyncStatusProps) {
  return (
    <div className="space-y-3 text-sm text-zinc-600">
      <div className="flex items-center gap-2">
        <span className={`size-2 rounded-full ${statusColor(health.status)}`} />
        <span className="font-medium text-zinc-900">
          {formatHealthStatus(health.status)}
        </span>
      </div>

      <dl className="grid grid-cols-2 gap-3">
        <div>
          <dt className="text-xs uppercase tracking-wide text-zinc-400">Last sync</dt>
          <dd className="mt-1 text-zinc-700">{formatRelativeTime(health.lastSyncAt)}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-zinc-400">Next sync</dt>
          <dd className="mt-1 text-zinc-700">
            {health.nextSyncAt
              ? new Date(health.nextSyncAt).toLocaleString()
              : "Not scheduled"}
          </dd>
        </div>
      </dl>

      {health.message ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {health.message}
        </p>
      ) : null}
    </div>
  );
}
