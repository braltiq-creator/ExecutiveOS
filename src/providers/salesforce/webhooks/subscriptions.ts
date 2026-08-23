/**
 * Platform Events + webhook-shaped change notifications with replay.
 */

export type SalesforceWebhookSubscription = {
  id: string;
  channel: string;
  notificationUrl: string;
  secret: string;
  expirationDateTime: string;
  status: "active" | "expired" | "failed";
};

export type SalesforceWebhookNotification = {
  subscriptionId: string;
  channel: string;
  changeType: string;
  receivedAt: string;
  payloadRef: string;
  replayId: string;
};

export type SalesforceWebhookStore = {
  subscribe(input: {
    channel: string;
    notificationUrl: string;
    secret: string;
    expirationDateTime: string;
  }): SalesforceWebhookSubscription;
  list(): SalesforceWebhookSubscription[];
  expire(id: string): void;
  receive(input: {
    subscriptionId: string;
    secret: string;
    channel: string;
    changeType: string;
    payloadRef: string;
    asOf: string;
    replayId?: string;
  }): {
    accepted: boolean;
    reason: string;
    notification?: SalesforceWebhookNotification;
  };
  replay(subscriptionId: string): SalesforceWebhookNotification[];
  status(): {
    active: number;
    expired: number;
    failed: number;
    lastDeliveryAt: string | null;
  };
};

export function createSalesforceWebhookStore(): SalesforceWebhookStore {
  const subscriptions = new Map<string, SalesforceWebhookSubscription>();
  const journal: SalesforceWebhookNotification[] = [];
  let seq = 0;

  return {
    subscribe(input) {
      seq += 1;
      const sub: SalesforceWebhookSubscription = {
        id: `sf-sub-${seq}`,
        channel: input.channel,
        notificationUrl: input.notificationUrl,
        secret: input.secret,
        expirationDateTime: input.expirationDateTime,
        status: "active",
      };
      subscriptions.set(sub.id, sub);
      return sub;
    },
    list: () => [...subscriptions.values()],
    expire(id) {
      const sub = subscriptions.get(id);
      if (sub) subscriptions.set(id, { ...sub, status: "expired" });
    },
    receive(input) {
      const sub = subscriptions.get(input.subscriptionId);
      if (!sub) return { accepted: false, reason: "Unknown subscription" };
      if (sub.status !== "active") {
        return { accepted: false, reason: `Subscription ${sub.status}` };
      }
      if (sub.secret !== input.secret) {
        return { accepted: false, reason: "Secret mismatch" };
      }
      if (
        new Date(input.asOf).getTime() >
        new Date(sub.expirationDateTime).getTime()
      ) {
        subscriptions.set(sub.id, { ...sub, status: "expired" });
        return { accepted: false, reason: "Subscription expired" };
      }
      const notification: SalesforceWebhookNotification = {
        subscriptionId: input.subscriptionId,
        channel: input.channel,
        changeType: input.changeType,
        receivedAt: input.asOf,
        payloadRef: input.payloadRef,
        replayId: input.replayId ?? `replay-${journal.length + 1}`,
      };
      journal.push(notification);
      return { accepted: true, reason: "Accepted", notification };
    },
    replay(subscriptionId) {
      return journal.filter((n) => n.subscriptionId === subscriptionId);
    },
    status() {
      const all = [...subscriptions.values()];
      return {
        active: all.filter((s) => s.status === "active").length,
        expired: all.filter((s) => s.status === "expired").length,
        failed: all.filter((s) => s.status === "failed").length,
        lastDeliveryAt: journal.at(-1)?.receivedAt ?? null,
      };
    },
  };
}
