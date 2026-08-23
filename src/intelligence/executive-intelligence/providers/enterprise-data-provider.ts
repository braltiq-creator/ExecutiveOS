/**
 * Enterprise data provider contract.
 * Intelligence engines never know whether signals come from
 * mock data, Salesforce, M365, Jira, SAP, Snowflake, etc.
 */

import type { EnterpriseSignals } from "@/intelligence/executive-intelligence/types";

export type EnterpriseDataProvider = {
  readonly id: string;
  readonly label: string;
  getSignals(): EnterpriseSignals;
};

export type EnterpriseProviderFactory = () => EnterpriseDataProvider;
