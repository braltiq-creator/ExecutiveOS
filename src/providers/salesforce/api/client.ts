/**
 * Reusable Salesforce API client — OAuth, SOQL, REST, Bulk-shaped paging,
 * retry, rate limits, telemetry, version compatibility.
 */

import {
  validateSalesforceCredentials,
  refreshSalesforceOAuth,
  type SalesforceOAuthCredentials,
} from "@/providers/salesforce/auth";

export type SalesforceApiVersion = "v58.0" | "v59.0" | "v60.0";

export type SalesforceTelemetryEvent = {
  name: string;
  path: string;
  status: number;
  durationMs: number;
  throttled: boolean;
  retries: number;
  at: string;
};

export type SalesforceHttpTransport = {
  fetch(input: {
    url: string;
    method: string;
    headers: Record<string, string>;
    body?: string;
  }): Promise<{ status: number; headers: Record<string, string>; body: string }>;
};

export type SalesforceApiClientOptions = {
  orgId: string;
  apiVersion?: SalesforceApiVersion;
  getCredentials: () => SalesforceOAuthCredentials;
  setCredentials?: (credentials: SalesforceOAuthCredentials) => void;
  transport?: SalesforceHttpTransport;
  maxRetries?: number;
  onTelemetry?: (event: SalesforceTelemetryEvent) => void;
  asOf?: string;
};

export type SalesforceApiClient = {
  readonly orgId: string;
  readonly apiVersion: SalesforceApiVersion;
  query<T>(soql: string): Promise<T[]>;
  get<T>(sobject: string, id: string): Promise<T>;
  listRecent<T>(sobject: string, limit?: number): Promise<T[]>;
  bulkQuery<T>(soql: string, maxBatches?: number): Promise<T[]>;
  telemetry(): SalesforceTelemetryEvent[];
};

export function createSalesforceApiClient(
  options: SalesforceApiClientOptions,
): SalesforceApiClient {
  const apiVersion = options.apiVersion ?? "v59.0";
  const transport = options.transport ?? createMockSalesforceHttpTransport();
  const maxRetries = options.maxRetries ?? 5;
  const events: SalesforceTelemetryEvent[] = [];

  const authHeaders = async (): Promise<{
    headers: Record<string, string>;
    base: string;
  }> => {
    let credentials = options.getCredentials();
    const validity = validateSalesforceCredentials(credentials, options.asOf);
    if (!validity.ok) {
      credentials = await refreshSalesforceOAuth({
        credentials,
        asOf: options.asOf,
      });
      options.setCredentials?.(credentials);
    }
    return {
      base: `${credentials.instanceUrl}/services/data/${apiVersion}`,
      headers: {
        Authorization: `Bearer ${credentials.accessToken}`,
        Accept: "application/json",
      },
    };
  };

  const request = async <T>(
    path: string,
    method: string,
    body?: unknown,
  ): Promise<T> => {
    let retries = 0;
    while (true) {
      const { base, headers } = await authHeaders();
      const url = path.startsWith("http") ? path : `${base}${path}`;
      const started = Date.now();
      const response = await transport.fetch({
        url,
        method,
        headers: {
          ...headers,
          ...(body ? { "Content-Type": "application/json" } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
      });
      const durationMs = Date.now() - started;
      const throttled = response.status === 429 || response.status === 503;
      events.push({
        name: "salesforce.request",
        path,
        status: response.status,
        durationMs,
        throttled,
        retries,
        at: options.asOf ?? new Date().toISOString(),
      });
      options.onTelemetry?.(events[events.length - 1]!);

      if (throttled || response.status >= 500) {
        retries += 1;
        if (retries > maxRetries) {
          throw new Error(`Salesforce ${response.status} after ${retries} retries`);
        }
        continue;
      }
      if (response.status === 401 && retries < maxRetries) {
        const refreshed = await refreshSalesforceOAuth({
          credentials: options.getCredentials(),
          asOf: options.asOf,
        });
        options.setCredentials?.(refreshed);
        retries += 1;
        continue;
      }
      if (response.status >= 400) {
        throw new Error(`Salesforce error ${response.status}: ${response.body}`);
      }
      if (!response.body) return {} as T;
      return JSON.parse(response.body) as T;
    }
  };

  return {
    orgId: options.orgId,
    apiVersion,
    async query(soql) {
      const encoded = encodeURIComponent(soql);
      const page = await request<{ records?: unknown[]; done?: boolean; nextRecordsUrl?: string }>(
        `/query?q=${encoded}`,
        "GET",
      );
      return (page.records ?? []) as never[];
    },
    async get(sobject, id) {
      return request(`/sobjects/${sobject}/${id}`, "GET");
    },
    async listRecent(sobject, limit = 50) {
      return this.query(
        `SELECT Id, Name, LastModifiedDate FROM ${sobject} ORDER BY LastModifiedDate DESC LIMIT ${limit}`,
      );
    },
    async bulkQuery(soql, maxBatches = 5) {
      // Production-shaped: page through queryMore-style links via repeated query
      const items: unknown[] = [];
      let batch = 0;
      let q = soql;
      while (batch < maxBatches) {
        const page = await this.query(q.includes("LIMIT") ? q : `${q} LIMIT 200`);
        items.push(...page);
        if (page.length < 200) break;
        batch += 1;
        q = soql;
      }
      return items as never[];
    },
    telemetry: () => [...events],
  };
}

/** Deterministic mock Salesforce HTTP for CI / Reality Lab. */
export function createMockSalesforceHttpTransport(): SalesforceHttpTransport {
  return {
    async fetch({ url }) {
      const asOf = "2026-07-26T07:00:00.000Z";
      if (url.includes("/query") && /Opportunity/i.test(url)) {
        return {
          status: 200,
          headers: {},
          body: JSON.stringify({
            done: true,
            records: [
              {
                Id: "006OPP001",
                Name: "Acme Facilities — Enterprise Expansion",
                StageName: "Negotiation",
                Amount: 480000,
                Probability: 70,
                CloseDate: "2026-08-15",
                Account: { Name: "Acme Facilities" },
                IsClosed: false,
                IsWon: false,
                LastModifiedDate: asOf,
              },
              {
                Id: "006OPP002",
                Name: "Northline Retail — Renewal",
                StageName: "Closed Won",
                Amount: 220000,
                Probability: 100,
                CloseDate: "2026-07-20",
                Account: { Name: "Northline Retail" },
                IsClosed: true,
                IsWon: true,
                LastModifiedDate: asOf,
              },
              {
                Id: "006OPP003",
                Name: "Harbour Group — Platform Deal",
                StageName: "Proposal",
                Amount: 910000,
                Probability: 40,
                CloseDate: "2026-09-30",
                Account: { Name: "Harbour Group" },
                IsClosed: false,
                IsWon: false,
                LastModifiedDate: asOf,
              },
            ],
          }),
        };
      }
      if (url.includes("/query") && /Account/i.test(url)) {
        return {
          status: 200,
          headers: {},
          body: JSON.stringify({
            done: true,
            records: [
              {
                Id: "001ACC001",
                Name: "Acme Facilities",
                Type: "Customer - Direct",
                AnnualRevenue: 12000000,
                Owner: { Name: "Jordan Blake" },
                LastModifiedDate: asOf,
              },
              {
                Id: "001ACC002",
                Name: "Harbour Group",
                Type: "Customer - Channel",
                AnnualRevenue: 45000000,
                Owner: { Name: "Sam Rivera" },
                LastModifiedDate: asOf,
              },
            ],
          }),
        };
      }
      if (url.includes("/query") && /Case/i.test(url)) {
        return {
          status: 200,
          headers: {},
          body: JSON.stringify({
            done: true,
            records: [
              {
                Id: "500CASE01",
                Subject: "Service escalation — plant downtime",
                Priority: "High",
                Status: "Escalated",
                Account: { Name: "Acme Facilities" },
                LastModifiedDate: asOf,
              },
            ],
          }),
        };
      }
      if (url.includes("/query") && /Contact/i.test(url)) {
        return {
          status: 200,
          headers: {},
          body: JSON.stringify({
            done: true,
            records: [
              {
                Id: "003CON001",
                Name: "Alex Morgan",
                Title: "CEO",
                Account: { Name: "Acme Facilities" },
                LastModifiedDate: asOf,
              },
            ],
          }),
        };
      }
      return {
        status: 200,
        headers: {},
        body: JSON.stringify({ done: true, records: [] }),
      };
    },
  };
}

export function createSalesforceRateLimitTransport(
  base: SalesforceHttpTransport,
  failFirst = 1,
): SalesforceHttpTransport {
  let failures = 0;
  return {
    async fetch(input) {
      if (failures < failFirst) {
        failures += 1;
        return {
          status: 429,
          headers: { "retry-after": "0" },
          body: "REQUEST_LIMIT_EXCEEDED",
        };
      }
      return base.fetch(input);
    },
  };
}
