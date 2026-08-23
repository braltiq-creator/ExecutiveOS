/**
 * Simpro webhook subscriptions — change notifications with replay.
 */

export type SimproWebhookSubscription = {
  id: string;
  resource: string;
  notificationUrl: string;
  secret: string;
  expirationDateTime: string;
  status: "active" | "expired" | "failed";
};

export type SimproWebhookNotification = {
  subscriptionId: string;
  resource: string;
  changeType: string;
  receivedAt: string;
  payloadRef: string;
};

export type SimproWebhookStore = {
  subscribe(input: {
    resource: string;
    notificationUrl: string;
    secret: string;
    expirationDateTime: string;
  }): SimproWebhookSubscription;
  list(): SimproWebhookSubscription[];
  expire(id: string): void;
  receive(input: {
    subscriptionId: string;
    secret: string;
    resource: string;
    changeType: string;
    payloadRef: string;
    asOf: string;
  }): { accepted: boolean; reason: string; notification?: SimproWebhookNotification };
  replay(subscriptionId: string): SimproWebhookNotification[];
  status(): {
    active: number;
    expired: number;
    failed: number;
    lastDeliveryAt: string | null;
  };
};

export function createSimproWebhookStore(): SimproWebhookStore {
  const subscriptions = new Map<string, SimproWebhookSubscription>();
  const journal: SimproWebhookNotification[] = [];
  let seq = 0;

  return {
    subscribe(input) {
      seq += 1;
      const sub: SimproWebhookSubscription = {
        id: `simpro-sub-${seq}`,
        resource: input.resource,
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
      const notification: SimproWebhookNotification = {
        subscriptionId: input.subscriptionId,
        resource: input.resource,
        changeType: input.changeType,
        receivedAt: input.asOf,
        payloadRef: input.payloadRef,
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
