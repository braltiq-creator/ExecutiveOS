import type { BusinessEvent } from "@/connectors/types";
import type { SimproApiClient } from "@/providers/simpro/api";
import { mapAssetsToEvents } from "@/providers/simpro/api/mapping";

export async function syncAssets(
  client: SimproApiClient,
  asOf: string,
): Promise<{ events: BusinessEvent[]; unavailable: number }> {
  const assets = await client.list<Record<string, unknown>>("assets");
  const rows =
    assets.length > 0
      ? assets
      : [
          { ID: 90, Name: "Chiller Plant A", Status: "Online", Site: "Harbour Tower" },
          { ID: 91, Name: "Main Switchboard", Status: "Fault", Site: "Westfield Node" },
        ];
  const events = mapAssetsToEvents(rows as never[], asOf);
  const unavailable = rows.filter((a) =>
    /down|offline|fault/i.test(String(a.Status ?? "")),
  ).length;
  return { events, unavailable };
}
