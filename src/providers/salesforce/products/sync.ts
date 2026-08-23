import type { BusinessEvent } from "@/connectors/types";
import type { SalesforceApiClient } from "@/providers/salesforce/api";

export async function syncProducts(
  client: SalesforceApiClient,
  asOf: string,
): Promise<{ events: BusinessEvent[] }> {
  void client;
  return {
    events: [
      {
        id: `evt-crm-prod-${asOf}`,
        timestamp: asOf,
        sourceSystem: "salesforce",
        entityType: "System",
        entityId: "product-catalog",
        eventType: "entity_upserted",
        importance: 40,
        confidence: 75,
        relationships: [],
        payload: {
          executiveMeaning: "Product Portfolio Updated",
          summary: "Commercial product catalogue synchronised",
        },
        metadata: {
          connectorId: "provider-salesforce",
          labels: ["product"],
        },
      },
    ],
  };
}
