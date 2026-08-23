/**
 * Immutable, searchable audit log.
 */

export type AuditAction =
  | "authentication"
  | "connector_activity"
  | "executive_decision"
  | "council_review"
  | "strategic_initiative"
  | "configuration"
  | "knowledge_graph_change"
  | "security_event"
  | "workspace_access"
  | "policy_change"
  | "feature_flag"
  | "license_change";

export type AuditEvent = {
  id: string;
  tenantId: string;
  workspaceId?: string;
  actorUserId: string;
  action: AuditAction;
  resourceType: string;
  resourceId: string;
  summary: string;
  metadata: Record<string, string | number | boolean>;
  at: string;
  /** Content hash stand-in for immutability chain */
  prevHash: string;
  hash: string;
};

export type AuditStore = {
  append(event: Omit<AuditEvent, "id" | "prevHash" | "hash">): AuditEvent;
  list(query?: {
    action?: AuditAction;
    actorUserId?: string;
    since?: string;
    limit?: number;
  }): AuditEvent[];
  verifyIntegrity(): { ok: boolean; brokenAt?: string };
};

function simpleHash(input: string): string {
  let h = 0;
  for (let i = 0; i < input.length; i += 1) {
    h = (h * 31 + input.charCodeAt(i)) >>> 0;
  }
  return `h${h.toString(16)}`;
}

export function createAuditStore(tenantId: string): AuditStore {
  const events: AuditEvent[] = [];

  return {
    append(input) {
      if (input.tenantId !== tenantId) {
        throw new Error("Audit tenant isolation violation");
      }
      const prevHash =
        events.length === 0 ? "genesis" : events[events.length - 1].hash;
      const id = `audit-${tenantId}-${events.length + 1}`;
      const payload = JSON.stringify({ ...input, id, prevHash });
      const event: AuditEvent = {
        ...input,
        id,
        prevHash,
        hash: simpleHash(payload),
      };
      events.push(event);
      return event;
    },
    list(query) {
      let result = [...events];
      if (query?.action) {
        result = result.filter((e) => e.action === query.action);
      }
      if (query?.actorUserId) {
        result = result.filter((e) => e.actorUserId === query.actorUserId);
      }
      if (query?.since) {
        const since = new Date(query.since).getTime();
        result = result.filter((e) => new Date(e.at).getTime() >= since);
      }
      if (typeof query?.limit === "number") {
        result = result.slice(-query.limit);
      }
      return result;
    },
    verifyIntegrity() {
      let prev = "genesis";
      for (const event of events) {
        if (event.prevHash !== prev) {
          return { ok: false, brokenAt: event.id };
        }
        const payload = JSON.stringify({
          tenantId: event.tenantId,
          workspaceId: event.workspaceId,
          actorUserId: event.actorUserId,
          action: event.action,
          resourceType: event.resourceType,
          resourceId: event.resourceId,
          summary: event.summary,
          metadata: event.metadata,
          at: event.at,
          id: event.id,
          prevHash: event.prevHash,
        });
        if (event.hash !== simpleHash(payload)) {
          return { ok: false, brokenAt: event.id };
        }
        prev = event.hash;
      }
      return { ok: true };
    },
  };
}
