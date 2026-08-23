/**
 * Work orders map to the same operational job stream (FSM terminology).
 * Emits vendor-independent BusinessEvents only.
 */
import type { BusinessEvent } from "@/connectors/types";
import type { SimproApiClient } from "@/providers/simpro/api";
import { syncJobs } from "@/providers/simpro/jobs";

export async function syncWorkOrders(
  client: SimproApiClient,
  asOf: string,
  modifiedSince?: string,
): Promise<{ events: BusinessEvent[] }> {
  const jobs = await syncJobs(client, asOf, modifiedSince);
  return {
    events: jobs.events.map((event) => ({
      ...event,
      metadata: {
        ...event.metadata,
        labels: [...(event.metadata.labels ?? []), "work-order"],
      },
    })),
  };
}
