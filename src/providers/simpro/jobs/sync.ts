import type { BusinessEvent } from "@/connectors/types";
import type { SimproApiClient } from "@/providers/simpro/api";
import { mapJobsToEvents } from "@/providers/simpro/api/mapping";
import type { JobAtRiskItem } from "@/providers/simpro/executive-context/types";

export async function syncJobs(
  client: SimproApiClient,
  asOf: string,
  modifiedSince?: string,
): Promise<{
  events: BusinessEvent[];
  openJobs: number;
  criticalJobs: number;
  delayedJobs: number;
  jobsAtRisk: JobAtRiskItem[];
}> {
  const jobs = await client.list<Record<string, unknown>>("jobs", {
    modifiedSince,
  });
  const events = mapJobsToEvents(jobs as never[], asOf);
  const openJobs = jobs.filter((j) => {
    const stage = String(j.Stage ?? "").toLowerCase();
    return !stage.includes("complete") && !stage.includes("cancel");
  }).length;
  const criticalJobs = jobs.filter(
    (j) =>
      /critical|emergency/i.test(String(j.Priority ?? "")) ||
      /critical|emergency/i.test(String(j.Name ?? "")),
  ).length;
  const delayedJobs = jobs.filter((j) =>
    /delay|hold/i.test(String(j.Stage ?? "")),
  ).length;
  const jobsAtRisk: JobAtRiskItem[] = jobs
    .filter((j) => {
      const stage = String(j.Stage ?? "").toLowerCase();
      const critical =
        /critical|emergency/i.test(String(j.Priority ?? "")) ||
        /critical|emergency/i.test(String(j.Name ?? ""));
      const delayed = /delay|hold/i.test(stage);
      return (critical || delayed) && !stage.includes("complete");
    })
    .map((j) => ({
      id: String(j.ID),
      title: String(j.Name ?? `Job ${j.ID}`),
      customerName: String(j.Customer ?? "Customer"),
      reason: /delay|hold/i.test(String(j.Stage ?? ""))
        ? "Delivery delayed"
        : "Critical commitment at risk",
      severity: "high" as const,
    }));
  return { events, openJobs, criticalJobs, delayedJobs, jobsAtRisk };
}
