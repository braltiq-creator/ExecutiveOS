import type { BusinessEvent } from "@/connectors/types";
import type { SalesforceApiClient } from "@/providers/salesforce/api";

export async function syncActivities(
  client: SalesforceApiClient,
  asOf: string,
): Promise<{ events: BusinessEvent[] }> {
  void client;
  return {
    events: [
      {
        id: `evt-crm-act-${asOf}`,
        timestamp: asOf,
        sourceSystem: "salesforce",
        entityType: "Signal",
        entityId: "commercial-activity",
        eventType: "signal_emitted",
        importance: 45,
        confidence: 70,
        relationships: [],
        payload: {
          executiveMeaning: "Commercial Execution Updated",
          summary: "Recent customer and opportunity activities synchronised",
        },
        metadata: {
          connectorId: "provider-salesforce",
          labels: ["activity"],
        },
      },
    ],
  };
}
