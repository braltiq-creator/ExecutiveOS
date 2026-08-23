/**
 * Change Data Capture — watermarked change stream with replay recovery.
 */

export type SalesforceCdcChange = {
  entity: string;
  changeType: "CREATE" | "UPDATE" | "DELETE" | "UNDELETE";
  recordId: string;
  commitTimestamp: string;
  replayId: string;
};

export type SalesforceCdcChannel = {
  name: string;
  replayId: string | null;
  status: "active" | "gap" | "recovering" | "failed";
  lastCommitAt: string | null;
  changesReceived: number;
};

export type SalesforceCdcStore = {
  ensure(channel: string): SalesforceCdcChannel;
  apply(input: {
    channel: string;
    changes: SalesforceCdcChange[];
    asOf: string;
  }): { accepted: number; replayFrom: string | null; status: SalesforceCdcChannel["status"] };
  gap(channel: string, reason: string): void;
  recover(channel: string, replayId: string, asOf: string): SalesforceCdcChannel;
  status(): {
    channels: SalesforceCdcChannel[];
    active: number;
    gaps: number;
    lastCommitAt: string | null;
  };
  replay(channel: string): SalesforceCdcChange[];
};

export function createSalesforceCdcStore(): SalesforceCdcStore {
  const channels = new Map<string, SalesforceCdcChannel>();
  const journal = new Map<string, SalesforceCdcChange[]>();

  const ensure = (name: string): SalesforceCdcChannel => {
    const existing = channels.get(name);
    if (existing) return existing;
    const channel: SalesforceCdcChannel = {
      name,
      replayId: null,
      status: "active",
      lastCommitAt: null,
      changesReceived: 0,
    };
    channels.set(name, channel);
    journal.set(name, []);
    return channel;
  };

  return {
    ensure,
    apply(input) {
      const channel = ensure(input.channel);
      if (channel.status === "failed") {
        return { accepted: 0, replayFrom: channel.replayId, status: "failed" };
      }
      const list = journal.get(input.channel) ?? [];
      list.push(...input.changes);
      journal.set(input.channel, list);
      const last = input.changes.at(-1);
      const next: SalesforceCdcChannel = {
        ...channel,
        status: "active",
        replayId: last?.replayId ?? channel.replayId,
        lastCommitAt: last?.commitTimestamp ?? input.asOf,
        changesReceived: channel.changesReceived + input.changes.length,
      };
      channels.set(input.channel, next);
      return {
        accepted: input.changes.length,
        replayFrom: next.replayId,
        status: next.status,
      };
    },
    gap(channel, _reason) {
      void _reason;
      const current = ensure(channel);
      channels.set(channel, { ...current, status: "gap" });
    },
    recover(channel, replayId, asOf) {
      const current = ensure(channel);
      const next: SalesforceCdcChannel = {
        ...current,
        status: "recovering",
        replayId,
        lastCommitAt: asOf,
      };
      channels.set(channel, next);
      // Immediately mark active after recovery handshake
      const active: SalesforceCdcChannel = { ...next, status: "active" };
      channels.set(channel, active);
      return active;
    },
    status() {
      const all = [...channels.values()];
      return {
        channels: all,
        active: all.filter((c) => c.status === "active").length,
        gaps: all.filter((c) => c.status === "gap").length,
        lastCommitAt:
          all
            .map((c) => c.lastCommitAt)
            .filter(Boolean)
            .sort()
            .at(-1) ?? null,
      };
    },
    replay(channel) {
      return [...(journal.get(channel) ?? [])];
    },
  };
}
