import type { BusinessEvent } from "@/connectors/types";
import type { SalesforceApiClient } from "@/providers/salesforce/api";
import { mapCasesToEvents } from "@/providers/salesforce/api/mapping";

export async function syncCases(
  client: SalesforceApiClient,
  asOf: string,
): Promise<{ events: BusinessEvent[]; escalatedCases: number }> {
  const records = await client.query<Record<string, unknown>>(
    "SELECT Id, Subject, Priority, Status, Account.Name, LastModifiedDate FROM Case",
  );
  const events = mapCasesToEvents(records as never[], asOf);
  const escalatedCases = records.filter((r) =>
    /escalat|high|critical/i.test(`${r.Status ?? ""} ${r.Priority ?? ""}`),
  ).length;
  return { events, escalatedCases };
}
