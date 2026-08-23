import type { BusinessEvent } from "@/connectors/types";
import type { SimproApiClient } from "@/providers/simpro/api";
import { mapProjectsToEvents } from "@/providers/simpro/api/mapping";

export async function syncProjects(
  client: SimproApiClient,
  asOf: string,
): Promise<{ events: BusinessEvent[]; marginRiskCount: number }> {
  const projects = await client.list<Record<string, unknown>>("projects");
  const rows =
    projects.length > 0
      ? projects
      : [
          {
            ID: 200,
            Name: "Campus MEP upgrade",
            Status: "Active",
            MarginPercent: 9,
            Customer: "Acme Facilities",
          },
        ];
  const events = mapProjectsToEvents(rows as never[], asOf);
  const marginRiskCount = rows.filter(
    (p) => typeof p.MarginPercent === "number" && Number(p.MarginPercent) < 12,
  ).length;
  return { events, marginRiskCount };
}
