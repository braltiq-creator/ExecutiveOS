/**
 * Unified connector catalog — Core Northline + Platform ERP + managed wrappers.
 */

import {
  createMockJiraConnector,
  createMockMicrosoft365Connector,
  createMockSalesforceConnector,
  type EnterpriseConnector,
} from "@/connectors";
import {
  createMockMaximoConnector,
  createMockSapConnector,
  createSimproPlatformConnector,
} from "@/platform/extensions";
import {
  manageConnector,
  platformToEnterprise,
  type ManagedConnector,
} from "@/connectivity/connectors/managed";

export type CatalogEntry = {
  id: string;
  system: string;
  label: string;
  source: "core" | "platform";
  managed: ManagedConnector;
};

export function createEnterpriseConnectivityCatalog(asOf?: string): {
  entries: CatalogEntry[];
  managed: ManagedConnector[];
  enterprise: EnterpriseConnector[];
  get(id: string): ManagedConnector | undefined;
} {
  const core: EnterpriseConnector[] = [
    createMockMicrosoft365Connector(asOf),
    createMockSalesforceConnector(asOf),
    createMockJiraConnector(asOf),
  ];

  const platform = [
    createSimproPlatformConnector(),
    createMockSapConnector(),
    createMockMaximoConnector(),
  ];

  const entries: CatalogEntry[] = [
    ...core.map((connector) => ({
      id: connector.id,
      system: connector.system,
      label: connector.label,
      source: "core" as const,
      managed: manageConnector(connector),
    })),
    ...platform.map((connector) => ({
      id: connector.manifest.id,
      system: connector.system,
      label: connector.manifest.name,
      source: "platform" as const,
      managed: manageConnector(connector),
    })),
  ];

  const managed = entries.map((e) => e.managed);
  const enterprise = [
    ...core,
    ...platform.map((p) => platformToEnterprise(p)),
  ];

  return {
    entries,
    managed,
    enterprise,
    get(id: string) {
      return entries.find((e) => e.id === id)?.managed;
    },
  };
}
