import type { BusinessEvent } from "@/connectors/types";
import type { SimproApiClient } from "@/providers/simpro/api";

/**
 * Scheduling sync — capacity allocation signals from the schedule board.
 */
export async function syncScheduling(
  client: SimproApiClient,
  asOf: string,
): Promise<{ events: BusinessEvent[]; overloadedDays: number }> {
  const schedules = await client.list<Record<string, unknown>>("schedules");
  const overloadedDays = schedules.length === 0 ? 1 : 0;
  const events: BusinessEvent[] = [
    {
      id: `evt-op-sched-${asOf}`,
      timestamp: asOf,
      sourceSystem: "simpro",
      entityType: "Signal",
      entityId: "scheduling-capacity",
      eventType: "signal_emitted",
      importance: overloadedDays > 0 ? 72 : 40,
      confidence: 78,
      relationships: [],
      payload: {
        executiveMeaning:
          overloadedDays > 0
            ? "Operational Bottleneck Detected"
            : "Schedule Within Capacity",
        overloadedDays,
      },
      metadata: {
        connectorId: "provider-simpro",
        labels: ["scheduling", "capacity"],
      },
    },
  ];
  return { events, overloadedDays };
}
