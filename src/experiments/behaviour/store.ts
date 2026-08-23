import type { BehaviourEvent, BehaviourEventKind } from "@/experiments/framework/types";
import type { IntelligenceProfileId } from "@/profiles";

const events: BehaviourEvent[] = [];
let seq = 0;

export function resetBehaviourEvents(): void {
  events.length = 0;
  seq = 0;
}

export function recordBehaviourEvent(input: {
  tenantId: string;
  profileId: IntelligenceProfileId;
  kind: BehaviourEventKind;
  featureKey: string;
  value?: number;
  at?: string;
  experimentId?: string | null;
}): BehaviourEvent {
  seq += 1;
  const event: BehaviourEvent = {
    id: `bev-${seq}`,
    tenantId: input.tenantId,
    profileId: input.profileId,
    kind: input.kind,
    featureKey: input.featureKey,
    value: input.value ?? 1,
    at: input.at ?? new Date().toISOString(),
    experimentId: input.experimentId ?? null,
  };
  events.push(event);
  return event;
}

export function listBehaviourEvents(tenantId?: string): BehaviourEvent[] {
  const rows = tenantId
    ? events.filter((e) => e.tenantId === tenantId)
    : [...events];
  return rows.sort((a, b) => b.at.localeCompare(a.at));
}

export function countBehaviourEvents(input: {
  tenantId: string;
  kind?: BehaviourEventKind;
  featureKey?: string;
}): number {
  return events
    .filter((e) => e.tenantId === input.tenantId)
    .filter((e) => (input.kind ? e.kind === input.kind : true))
    .filter((e) =>
      input.featureKey ? e.featureKey === input.featureKey : true,
    )
    .reduce((sum, e) => sum + e.value, 0);
}
