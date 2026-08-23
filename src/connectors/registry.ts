import type { EnterpriseConnector } from "@/connectors/connector";
import { createMockJiraConnector } from "@/connectors/mock/jira";
import { createMockMicrosoft365Connector } from "@/connectors/mock/microsoft365";
import { createMockSalesforceConnector } from "@/connectors/mock/salesforce";

export type ConnectorRegistry = {
  list(): EnterpriseConnector[];
  get(id: string): EnterpriseConnector | undefined;
  register(connector: EnterpriseConnector): void;
};

export function createConnectorRegistry(
  connectors: EnterpriseConnector[] = [],
): ConnectorRegistry {
  const map = new Map<string, EnterpriseConnector>();
  for (const connector of connectors) map.set(connector.id, connector);

  return {
    list: () => [...map.values()],
    get: (id) => map.get(id),
    register: (connector) => {
      map.set(connector.id, connector);
    },
  };
}

/** Northline mock suite — M365 + Salesforce + Jira. */
export function createNorthlineConnectorSuite(
  asOf = "2026-07-20T06:15:00+10:00",
): EnterpriseConnector[] {
  return [
    createMockMicrosoft365Connector(asOf),
    createMockSalesforceConnector(asOf),
    createMockJiraConnector(asOf),
  ];
}

export function createDefaultConnectorRegistry(
  asOf?: string,
): ConnectorRegistry {
  return createConnectorRegistry(createNorthlineConnectorSuite(asOf));
}
