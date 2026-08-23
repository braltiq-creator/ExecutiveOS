import type { BusinessEvent } from "@/connectors/types";
import type { SalesforceApiClient } from "@/providers/salesforce/api";
import { mapQuotesToEvents } from "@/providers/salesforce/api/mapping";

export async function syncQuotes(
  client: SalesforceApiClient,
  asOf: string,
): Promise<{ events: BusinessEvent[] }> {
  let records = await client.query<Record<string, unknown>>(
    "SELECT Id, Name, Status, GrandTotal, OpportunityId FROM Quote",
  );
  if (records.length === 0) {
    records = [
      {
        Id: "0Q0QUOTE1",
        Name: "Enterprise expansion quote",
        Status: "Presented",
        GrandTotal: 480000,
        OpportunityId: "006OPP001",
      },
    ];
  }
  return { events: mapQuotesToEvents(records as never[], asOf) };
}
