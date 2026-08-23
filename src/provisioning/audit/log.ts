/**
 * Provisioning audit — wraps runtime audit store per tenant.
 */

import { createAuditStore, type AuditEvent, type AuditStore } from "@/runtime/audit/store";

const stores = new Map<string, AuditStore>();
const globalEvents: AuditEvent[] = [];

export function resetProvisioningAudit(): void {
  stores.clear();
  globalEvents.length = 0;
}

function storeFor(tenantId: string): AuditStore {
  let store = stores.get(tenantId);
  if (!store) {
    store = createAuditStore(tenantId);
    stores.set(tenantId, store);
  }
  return store;
}

export function appendProvisioningAudit(input: {
  tenantId: string;
  actorUserId: string;
  summary: string;
  resourceType: string;
  resourceId: string;
  asOf: string;
  metadata?: Record<string, string | number | boolean>;
}): AuditEvent {
  const event = storeFor(input.tenantId).append({
    tenantId: input.tenantId,
    actorUserId: input.actorUserId,
    action: "configuration",
    resourceType: input.resourceType,
    resourceId: input.resourceId,
    summary: input.summary,
    metadata: input.metadata ?? {},
    at: input.asOf,
  });
  globalEvents.push(event);
  return event;
}

export function listProvisioningAudit(tenantId?: string): AuditEvent[] {
  if (!tenantId) return [...globalEvents];
  return storeFor(tenantId).list();
}
