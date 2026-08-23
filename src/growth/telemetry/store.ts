import type { GrowthTelemetryEvent } from "@/growth/framework/types";
import { assertGrowthPayload } from "@/growth/framework/isolation";

const events: GrowthTelemetryEvent[] = [];
let seq = 0;

export function resetGrowthTelemetry(): void {
  events.length = 0;
  seq = 0;
}

export function recordGrowthTelemetry(input: {
  organizationId: string;
  name: string;
  properties?: Record<string, string | number | boolean>;
}): GrowthTelemetryEvent {
  assertGrowthPayload(input.properties ?? {});
  seq += 1;
  const event: GrowthTelemetryEvent = {
    id: `gtel-${seq}`,
    organizationId: input.organizationId,
    name: input.name,
    properties: input.properties ?? {},
    at: new Date().toISOString(),
  };
  events.push(event);
  return event;
}

export function listGrowthTelemetry(
  organizationId?: string,
): GrowthTelemetryEvent[] {
  return events
    .filter((e) =>
      organizationId ? e.organizationId === organizationId : true,
    )
    .sort((a, b) => b.at.localeCompare(a.at));
}
