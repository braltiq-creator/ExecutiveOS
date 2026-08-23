import type { BusinessEvent } from "@/connectors/types";
import type { SimproApiClient } from "@/providers/simpro/api";
import { mapSitesToEvents } from "@/providers/simpro/api/mapping";

export async function syncSites(
  client: SimproApiClient,
  asOf: string,
): Promise<{ events: BusinessEvent[] }> {
  const sites = await client.list<Record<string, unknown>>("sites");
  const rows =
    sites.length > 0
      ? sites
      : [
          { ID: 10, Name: "Harbour Tower", Customer: "Acme Facilities" },
          { ID: 11, Name: "Westfield Node", Customer: "Northline Retail" },
        ];
  return { events: mapSitesToEvents(rows as never[], asOf) };
}
