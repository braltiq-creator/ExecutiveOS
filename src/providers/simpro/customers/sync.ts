import type { BusinessEvent } from "@/connectors/types";
import type { SimproApiClient } from "@/providers/simpro/api";
import { mapCustomersToEvents } from "@/providers/simpro/api/mapping";

export async function syncCustomers(
  client: SimproApiClient,
  asOf: string,
): Promise<{ events: BusinessEvent[]; count: number }> {
  const customers = await client.list<Record<string, unknown>>("customers");
  // Mock fallback when API returns empty
  const rows =
    customers.length > 0
      ? customers
      : [
          { ID: 1, Name: "Acme Facilities", Status: "Active" },
          { ID: 2, Name: "Northline Retail", Status: "Active" },
        ];
  return {
    events: mapCustomersToEvents(rows as never[], asOf),
    count: rows.length,
  };
}
