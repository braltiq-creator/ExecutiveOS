import type { BusinessEvent } from "@/connectors/types";
import type { SalesforceApiClient } from "@/providers/salesforce/api";
import { mapOpportunitiesToEvents } from "@/providers/salesforce/api/mapping";

export async function syncOpportunities(
  client: SalesforceApiClient,
  asOf: string,
): Promise<{
  events: BusinessEvent[];
  openPipelineValue: number;
  openDeals: number;
  weightedForecast: number;
  wonValue: number;
  lostValue: number;
  atRiskDealCount: number;
  atRiskDealValue: number;
  renewalCount: number;
  largeDealsAtRisk: Array<{
    id: string;
    title: string;
    amount: number;
    reason: string;
  }>;
}> {
  const records = await client.query<Record<string, unknown>>(
    "SELECT Id, Name, StageName, Amount, Probability, CloseDate, Account.Name, IsClosed, IsWon, LastModifiedDate FROM Opportunity",
  );
  const events = mapOpportunitiesToEvents(records as never[], asOf);

  let openPipelineValue = 0;
  let openDeals = 0;
  let weightedForecast = 0;
  let wonValue = 0;
  let lostValue = 0;
  let atRiskDealCount = 0;
  let atRiskDealValue = 0;
  let renewalCount = 0;
  const largeDealsAtRisk: Array<{
    id: string;
    title: string;
    amount: number;
    reason: string;
  }> = [];

  for (const row of records) {
    const amount = Number(row.Amount ?? 0);
    const probability = Number(row.Probability ?? 0);
    const name = String(row.Name ?? row.Id);
    if (row.IsWon) {
      wonValue += amount;
      continue;
    }
    if (row.IsClosed && !row.IsWon) {
      lostValue += amount;
      continue;
    }
    openDeals += 1;
    openPipelineValue += amount;
    weightedForecast += amount * (probability / 100);
    if (/renew/i.test(name)) renewalCount += 1;
    if (probability < 50 && amount >= 400000) {
      atRiskDealCount += 1;
      atRiskDealValue += amount;
      largeDealsAtRisk.push({
        id: String(row.Id),
        title: name,
        amount,
        reason: `Probability ${probability}% on a large pursuit`,
      });
    }
  }

  return {
    events,
    openPipelineValue,
    openDeals,
    weightedForecast: Math.round(weightedForecast),
    wonValue,
    lostValue,
    atRiskDealCount,
    atRiskDealValue,
    renewalCount,
    largeDealsAtRisk,
  };
}
