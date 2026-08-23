/**
 * Connector Framework
 *
 * Translates enterprise SaaS systems into the canonical BusinessEvent model.
 * Vendor-specific shapes never escape the connector boundary.
 */

export type * from "@/connectors/types";
export type { EnterpriseConnector } from "@/connectors/connector";
export { BaseEnterpriseConnector } from "@/connectors/base-connector";

export {
  MockMicrosoft365Connector,
  createMockMicrosoft365Connector,
} from "@/connectors/mock/microsoft365";
export {
  MockSalesforceConnector,
  createMockSalesforceConnector,
} from "@/connectors/mock/salesforce";
export {
  MockJiraConnector,
  createMockJiraConnector,
} from "@/connectors/mock/jira";

export {
  createConnectorRegistry,
  createNorthlineConnectorSuite,
  createDefaultConnectorRegistry,
} from "@/connectors/registry";
export type { ConnectorRegistry } from "@/connectors/registry";

export {
  runEnterpriseSyncPipeline,
} from "@/connectors/pipeline";
export type { PipelineOptions, PipelineResult } from "@/connectors/pipeline";
