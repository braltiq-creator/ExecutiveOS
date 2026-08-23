/**
 * Synchronisation modes — how connectors pull or receive enterprise data.
 */

export const SYNC_MODES = [
  "realtime",
  "scheduled",
  "incremental",
  "full_refresh",
  "webhook",
  "event_driven",
  "replay",
  "backfill",
] as const;

export type SyncMode = (typeof SYNC_MODES)[number];

export type SyncRequest = {
  mode: SyncMode;
  connectorId: string;
  since?: string;
  until?: string;
  limit?: number;
  dryRun?: boolean;
  cursor?: string;
};

export type SyncModePlan = {
  mode: SyncMode;
  description: string;
  usesCursor: boolean;
  emitsBusinessEvents: boolean;
};

export const SYNC_MODE_PLANS: Record<SyncMode, SyncModePlan> = {
  realtime: {
    mode: "realtime",
    description: "Near-real-time pull or stream ingestion",
    usesCursor: true,
    emitsBusinessEvents: true,
  },
  scheduled: {
    mode: "scheduled",
    description: "Cron / interval based synchronisation",
    usesCursor: true,
    emitsBusinessEvents: true,
  },
  incremental: {
    mode: "incremental",
    description: "Sync changes since last successful watermark",
    usesCursor: true,
    emitsBusinessEvents: true,
  },
  full_refresh: {
    mode: "full_refresh",
    description: "Full catalogue refresh — expensive, intentional",
    usesCursor: false,
    emitsBusinessEvents: true,
  },
  webhook: {
    mode: "webhook",
    description: "Inbound webhook triggers event publication",
    usesCursor: false,
    emitsBusinessEvents: true,
  },
  event_driven: {
    mode: "event_driven",
    description: "Upstream event bus drives connector sync",
    usesCursor: true,
    emitsBusinessEvents: true,
  },
  replay: {
    mode: "replay",
    description: "Replay journaled BusinessEvents without vendor refetch",
    usesCursor: false,
    emitsBusinessEvents: true,
  },
  backfill: {
    mode: "backfill",
    description: "Historical window backfill for Twin rebuild",
    usesCursor: true,
    emitsBusinessEvents: true,
  },
};

export function planSync(mode: SyncMode): SyncModePlan {
  return SYNC_MODE_PLANS[mode];
}
