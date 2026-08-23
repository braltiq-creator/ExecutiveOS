/**
 * SDK example connectors — thin wrappers proving minimal custom code.
 * Each reuses Core/Platform connectors under the ManagedConnector lifecycle.
 */

import {
  createMockJiraConnector,
  createMockMicrosoft365Connector,
  createMockSalesforceConnector,
} from "@/connectors";
import {
  createMockMaximoConnector,
  createMockSapConnector,
  createSimproPlatformConnector,
} from "@/platform/extensions";
import { manageConnector, type ManagedConnector } from "@/connectivity/connectors";
import { defineConnector } from "@/connectivity/sdk/define-connector";
import type { MappingDefinition } from "@/connectivity/mapping";

export function createSdkMicrosoft365Connector(asOf?: string): ManagedConnector {
  return manageConnector(createMockMicrosoft365Connector(asOf));
}

export function createSdkSalesforceConnector(asOf?: string): ManagedConnector {
  return manageConnector(createMockSalesforceConnector(asOf));
}

export function createSdkJiraConnector(asOf?: string): ManagedConnector {
  return manageConnector(createMockJiraConnector(asOf));
}

export function createSdkSapConnector(): ManagedConnector {
  return manageConnector(createMockSapConnector());
}

export function createSdkMaximoConnector(): ManagedConnector {
  return manageConnector(createMockMaximoConnector());
}

export function createSdkSimproConnector(): ManagedConnector {
  return manageConnector(createSimproPlatformConnector());
}

/** Example: brand-new connector via defineConnector (mapping-only custom code). */
const EXAMPLE_MAPPING: MappingDefinition = {
  id: "example-workorder",
  vendorObjectType: "WorkOrder",
  entityType: "Project",
  eventType: "status_changed",
  fields: [
    { from: "name", to: "label", transform: "string", required: true },
    { from: "status", to: "status", transform: "lower", required: true },
    { from: "priority", to: "importance", transform: "number", defaultValue: 50 },
  ],
  relationshipMaps: [
    { from: "assetId", type: "affects", targetEntityType: "System" },
  ],
};

export function createExampleMappedConnector(): ManagedConnector {
  return defineConnector({
    id: "connector-example-mapped",
    system: "mock",
    label: "Example Mapped Connector",
    preferredAuth: "api_key",
    mappings: [EXAMPLE_MAPPING],
    fetchVendorObjects: () => [
      {
        system: "mock",
        objectType: "WorkOrder",
        id: "wo-1001",
        fields: {
          name: "Replace pump seal",
          status: "Open",
          priority: 80,
          assetId: "asset-pump-1",
        },
      },
    ],
  });
}

export function createAllSdkExampleConnectors(asOf?: string): ManagedConnector[] {
  return [
    createSdkMicrosoft365Connector(asOf),
    createSdkSalesforceConnector(asOf),
    createSdkJiraConnector(asOf),
    createSdkSapConnector(),
    createSdkMaximoConnector(),
    createSdkSimproConnector(),
    createExampleMappedConnector(),
  ];
}
