import type { BusinessEvent } from "@/connectors/types";
import type { SimproApiClient } from "@/providers/simpro/api";
import { mapInvoicesToEvents } from "@/providers/simpro/api/mapping";

export async function syncInvoices(
  client: SimproApiClient,
  asOf: string,
): Promise<{
  events: BusinessEvent[];
  overdueCount: number;
  overdueValue: number;
}> {
  const invoices = await client.list<Record<string, unknown>>("invoices");
  const events = mapInvoicesToEvents(invoices as never[], asOf);
  const overdue = invoices.filter((i) =>
    /overdue/i.test(String(i.Status ?? "")),
  );
  return {
    events,
    overdueCount: overdue.length,
    overdueValue: overdue.reduce((sum, i) => sum + Number(i.Total ?? 0), 0),
  };
}
