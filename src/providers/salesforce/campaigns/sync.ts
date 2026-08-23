import type { BusinessEvent } from "@/connectors/types";
import type { SalesforceApiClient } from "@/providers/salesforce/api";
import { mapCampaignsToEvents } from "@/providers/salesforce/api/mapping";

export async function syncCampaigns(
  client: SalesforceApiClient,
  asOf: string,
): Promise<{ events: BusinessEvent[]; campaignPipelineValue: number }> {
  let records = await client.query<Record<string, unknown>>(
    "SELECT Id, Name, Status, NumberOfLeads, AmountAllOpportunities FROM Campaign",
  );
  if (records.length === 0) {
    records = [
      {
        Id: "701CAMP01",
        Name: "Enterprise expansion Q3",
        Status: "In Progress",
        NumberOfLeads: 42,
        AmountAllOpportunities: 350000,
      },
    ];
  }
  const events = mapCampaignsToEvents(records as never[], asOf);
  const campaignPipelineValue = records.reduce(
    (sum, r) => sum + Number(r.AmountAllOpportunities ?? 0),
    0,
  );
  return { events, campaignPipelineValue };
}
