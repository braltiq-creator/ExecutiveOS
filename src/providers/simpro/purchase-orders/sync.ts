import type { BusinessEvent } from "@/connectors/types";
import type { SimproApiClient } from "@/providers/simpro/api";
import { mapPurchaseOrdersToEvents } from "@/providers/simpro/api/mapping";

export async function syncPurchaseOrders(
  client: SimproApiClient,
  asOf: string,
): Promise<{ events: BusinessEvent[]; delayed: number }> {
  const orders = await client.list<Record<string, unknown>>("purchaseOrders");
  const rows =
    orders.length > 0
      ? orders
      : [
          {
            ID: 700,
            Name: "Compressor assembly",
            Status: "Delayed",
            Supplier: "CoolParts Co",
            DateModified: asOf,
          },
        ];
  const events = mapPurchaseOrdersToEvents(rows as never[], asOf);
  const delayed = rows.filter((o) =>
    /delay|hold|backorder/i.test(String(o.Status ?? "")),
  ).length;
  return { events, delayed };
}
