/**
 * Microsoft Graph webhook subscriptions — change notifications.
 */

export type WebhookSubscription = {
  id: string;
  resource: string;
  changeType: string;
  notificationUrl: string;
  clientState: string;
  expirationDateTime: string;
  status: "active" | "expired" | "failed";
};

export type WebhookNotification = {
  subscriptionId: string;
  clientState: string;
  changeType: string;
  resource: string;
  resourceData?: { id?: string };
  receivedAt: string;
};

export type WebhookStore = {
  subscribe(input: {
    resource: string;
    notificationUrl: string;
    clientState: string;
    expirationDateTime: string;
    changeType?: string;
  }): WebhookSubscription;
  list(): WebhookSubscription[];
  expire(id: string): void;
  receive(notification: Omit<WebhookNotification, "receivedAt">, asOf: string): {
    accepted: boolean;
    reason: string;
    notification?: WebhookNotification;
  };
  replay(subscriptionId: string): WebhookNotification[];
  status(): {
    active: number;
    expired: number;
    failed: number;
    lastDeliveryAt: string | null;
  };
};

export function createWebhookStore(): WebhookStore {
  const subscriptions = new Map<string, WebhookSubscription>();
  const journal: WebhookNotification[] = [];
  let seq = 0;

  return {
    subscribe(input) {
      seq += 1;
      const sub: WebhookSubscription = {
        id: `sub-${seq}`,
        resource: input.resource,
        changeType: input.changeType ?? "created,updated,deleted",
        notificationUrl: input.notificationUrl,
        clientState: input.clientState,
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
    receive(notification, asOf) {
      const sub = subscriptions.get(notification.subscriptionId);
      if (!sub) {
        return { accepted: false, reason: "Unknown subscription" };
      }
      if (sub.status !== "active") {
        return { accepted: false, reason: `Subscription ${sub.status}` };
      }
      if (sub.clientState !== notification.clientState) {
        return { accepted: false, reason: "clientState mismatch" };
      }
      if (new Date(asOf).getTime() > new Date(sub.expirationDateTime).getTime()) {
        subscriptions.set(sub.id, { ...sub, status: "expired" });
        return { accepted: false, reason: "Subscription expired" };
      }
      const full: WebhookNotification = { ...notification, receivedAt: asOf };
      journal.push(full);
      return { accepted: true, reason: "Accepted", notification: full };
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
