import type { BusinessEvent } from "@/connectors/types";
import type { SalesforceApiClient } from "@/providers/salesforce/api";
import { mapContactsToEvents } from "@/providers/salesforce/api/mapping";

export async function syncContacts(
  client: SalesforceApiClient,
  asOf: string,
): Promise<{ events: BusinessEvent[] }> {
  const records = await client.query<Record<string, unknown>>(
    "SELECT Id, Name, Title, Account.Name, LastModifiedDate FROM Contact",
  );
  return { events: mapContactsToEvents(records as never[], asOf) };
}
