import type { BusinessEvent } from "@/connectors/types";
import type { SimproApiClient } from "@/providers/simpro/api";
import { mapQuotesToEvents } from "@/providers/simpro/api/mapping";

export async function syncQuotes(
  client: SimproApiClient,
  asOf: string,
  modifiedSince?: string,
): Promise<{
  events: BusinessEvent[];
  acceptedValue: number;
  openOpportunities: number;
}> {
  const quotes = await client.list<Record<string, unknown>>("quotes", {
    modifiedSince,
  });
  const events = mapQuotesToEvents(quotes as never[], asOf);
  const acceptedValue = quotes
    .filter((q) => /accept/i.test(String(q.Stage ?? "")))
    .reduce((sum, q) => sum + Number(q.Total ?? 0), 0);
  const openOpportunities = quotes.filter(
    (q) => !/accept|lost|declin/i.test(String(q.Stage ?? "")),
  ).length;
  return { events, acceptedValue, openOpportunities };
}
