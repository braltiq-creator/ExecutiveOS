import type { BusinessEvent } from "@/connectors/types";
import type { SimproApiClient } from "@/providers/simpro/api";
import { mapStaffToEvents } from "@/providers/simpro/api/mapping";

export async function syncTechnicians(
  client: SimproApiClient,
  asOf: string,
): Promise<{
  events: BusinessEvent[];
  available: number;
  unavailable: number;
}> {
  let staff = await client.list<Record<string, unknown>>("employees");
  if (staff.length === 0) {
    staff = await client.list<Record<string, unknown>>("staff");
  }
  const events = mapStaffToEvents(staff as never[], asOf);
  const unavailable = staff.filter(
    (p) =>
      /unavail|sick|leave/i.test(String(p.Availability ?? "")) ||
      /sick/i.test(String(p.Reason ?? "")),
  ).length;
  return {
    events,
    available: Math.max(0, staff.length - unavailable),
    unavailable,
  };
}
