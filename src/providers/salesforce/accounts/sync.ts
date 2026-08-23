import type { BusinessEvent } from "@/connectors/types";
import type { SalesforceApiClient } from "@/providers/salesforce/api";
import { mapAccountsToEvents } from "@/providers/salesforce/api/mapping";

export async function syncAccounts(
  client: SalesforceApiClient,
  asOf: string,
): Promise<{
  events: BusinessEvent[];
  strategicAccountCount: number;
  strategicAccounts: Array<{
    id: string;
    name: string;
    attention: string;
    severity: "critical" | "high" | "moderate" | "low" | "healthy";
    relatedEntityIds: string[];
  }>;
}> {
  const records = await client.query<Record<string, unknown>>(
    "SELECT Id, Name, Type, AnnualRevenue, Owner.Name, LastModifiedDate FROM Account",
  );
  const events = mapAccountsToEvents(records as never[], asOf);
  const strategic = records.filter(
    (r) => Number(r.AnnualRevenue ?? 0) >= 10_000_000,
  );
  return {
    events,
    strategicAccountCount: strategic.length,
    strategicAccounts: strategic.map((r) => ({
      id: String(r.Id),
      name: String(r.Name ?? r.Id),
      attention: "Strategic account — monitor growth and risk",
      severity: Number(r.AnnualRevenue ?? 0) >= 40_000_000 ? "high" : "moderate",
      relatedEntityIds: [`account-${r.Id}`],
    })),
  };
}
