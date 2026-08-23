/**
 * Reusable Simpro API client — OAuth/API key, paging, filter, rate limit, retry, telemetry.
 */

import {
  validateSimproCredentials,
  refreshSimproOAuth,
  type SimproCredentials,
  type SimproOAuthCredentials,
} from "@/providers/simpro/auth";

export type SimproApiVersion = "v1.0" | "v1.1" | "v2.0";

export type SimproTelemetryEvent = {
  name: string;
  path: string;
  status: number;
  durationMs: number;
  throttled: boolean;
  retries: number;
  at: string;
};

export type SimproHttpTransport = {
  fetch(input: {
    url: string;
    method: string;
    headers: Record<string, string>;
    body?: string;
  }): Promise<{ status: number; headers: Record<string, string>; body: string }>;
};

export type SimproApiClientOptions = {
  baseUrl?: string;
  companyId: string;
  version?: SimproApiVersion;
  getCredentials: () => SimproCredentials;
  setCredentials?: (credentials: SimproCredentials) => void;
  transport?: SimproHttpTransport;
  maxRetries?: number;
  onTelemetry?: (event: SimproTelemetryEvent) => void;
  asOf?: string;
};

export type SimproListParams = {
  page?: number;
  pageSize?: number;
  modifiedSince?: string;
  filter?: Record<string, string>;
};

export type SimproApiClient = {
  readonly companyId: string;
  readonly version: SimproApiVersion;
  list<T>(resource: string, params?: SimproListParams): Promise<T[]>;
  get<T>(resource: string, id: string): Promise<T>;
  paginateAll<T>(resource: string, params?: SimproListParams, maxPages?: number): Promise<T[]>;
  telemetry(): SimproTelemetryEvent[];
};

export function createSimproApiClient(
  options: SimproApiClientOptions,
): SimproApiClient {
  const version = options.version ?? "v1.1";
  const baseUrl =
    options.baseUrl ??
    `https://api.simpro.co/${version}/companies/${options.companyId}`;
  const transport = options.transport ?? createMockSimproHttpTransport();
  const maxRetries = options.maxRetries ?? 5;
  const events: SimproTelemetryEvent[] = [];

  const authHeaders = async (): Promise<Record<string, string>> => {
    let credentials = options.getCredentials();
    const validity = validateSimproCredentials(credentials, options.asOf);
    if (!validity.ok && credentials.strategy === "oauth2") {
      credentials = await refreshSimproOAuth({
        credentials,
        asOf: options.asOf,
      });
      options.setCredentials?.(credentials);
    } else if (!validity.ok) {
      throw new Error(validity.reason);
    }

    if (credentials.strategy === "oauth2") {
      return { Authorization: `Bearer ${credentials.accessToken}` };
    }
    const key = credentials.apiKey ?? credentials.apiKeyRef;
    return { Authorization: `Bearer ${key}` };
  };

  const request = async <T>(
    path: string,
    method: string,
    query?: Record<string, string>,
  ): Promise<T> => {
    let retries = 0;
    while (true) {
      const headers = await authHeaders();
      const url = `${baseUrl}${path.startsWith("/") ? path : `/${path}`}${
        query ? `?${new URLSearchParams(query).toString()}` : ""
      }`;
      const started = Date.now();
      const response = await transport.fetch({
        url,
        method,
        headers: { Accept: "application/json", ...headers },
      });
      const durationMs = Date.now() - started;
      const throttled = response.status === 429;
      const event: SimproTelemetryEvent = {
        name: "simpro.request",
        path,
        status: response.status,
        durationMs,
        throttled,
        retries,
        at: options.asOf ?? new Date().toISOString(),
      };
      events.push(event);
      options.onTelemetry?.(event);

      if (response.status === 429 || response.status >= 500) {
        retries += 1;
        if (retries > maxRetries) {
          throw new Error(`Simpro ${response.status} after ${retries} retries`);
        }
        continue;
      }
      if (response.status === 401 && retries < maxRetries) {
        const credentials = options.getCredentials();
        if (credentials.strategy === "oauth2") {
          const refreshed = await refreshSimproOAuth({
            credentials,
            asOf: options.asOf,
          });
          options.setCredentials?.(refreshed);
          retries += 1;
          continue;
        }
      }
      if (response.status >= 400) {
        throw new Error(`Simpro error ${response.status}: ${response.body}`);
      }
      if (!response.body) return {} as T;
      return JSON.parse(response.body) as T;
    }
  };

  return {
    companyId: options.companyId,
    version,
    async list(resource, params) {
      const query: Record<string, string> = {
        page: String(params?.page ?? 1),
        pageSize: String(params?.pageSize ?? 50),
        ...(params?.modifiedSince
          ? { modifiedSince: params.modifiedSince }
          : {}),
        ...(params?.filter ?? {}),
      };
      const page = await request<{ result?: unknown[] } | unknown[]>(
        `/${resource}/`,
        "GET",
        query,
      );
      if (Array.isArray(page)) return page as never[];
      return ((page as { result?: unknown[] }).result ?? []) as never[];
    },
    async get(resource, id) {
      return request(`/${resource}/${id}`, "GET");
    },
    async paginateAll(resource, params, maxPages = 10) {
      const items: unknown[] = [];
      for (let page = 1; page <= maxPages; page += 1) {
        const batch = await this.list(resource, { ...params, page });
        items.push(...batch);
        if (batch.length < (params?.pageSize ?? 50)) break;
      }
      return items as never[];
    },
    telemetry: () => [...events],
  };
}

/** Deterministic mock Simpro HTTP for CI / Reality Lab. */
export function createMockSimproHttpTransport(): SimproHttpTransport {
  return {
    async fetch({ url }) {
      const asOf = "2026-07-26T07:00:00.000Z";
      if (url.includes("/jobs/")) {
        return {
          status: 200,
          headers: {},
          body: JSON.stringify({
            result: [
              {
                ID: 501,
                Name: "HVAC plant service — Harbour Tower",
                Stage: "Scheduled",
                Customer: "Acme Facilities",
                Site: "Harbour Tower",
                DateModified: asOf,
                Technician: "Jordan Lee",
              },
              {
                ID: 502,
                Name: "Emergency chiller repair",
                Stage: "InProgress",
                Customer: "Northline Retail",
                Site: "Westfield Node",
                DateModified: asOf,
                Priority: "Critical",
              },
            ],
          }),
        };
      }
      if (url.includes("/quotes/")) {
        return {
          status: 200,
          headers: {},
          body: JSON.stringify({
            result: [
              {
                ID: 1042,
                Name: "Annual maintenance agreement",
                Stage: "Accepted",
                Total: 240000,
                Customer: "Acme Facilities",
                DateModified: asOf,
              },
            ],
          }),
        };
      }
      if (url.includes("/invoices/")) {
        return {
          status: 200,
          headers: {},
          body: JSON.stringify({
            result: [
              {
                ID: 8801,
                Name: "Invoice INV-8801",
                Status: "Overdue",
                Total: 48000,
                Customer: "Northline Retail",
                DueDate: "2026-07-10",
              },
            ],
          }),
        };
      }
      if (url.includes("/employees/") || url.includes("/staff/")) {
        return {
          status: 200,
          headers: {},
          body: JSON.stringify({
            result: [
              {
                ID: 12,
                Name: "Jordan Lee",
                Availability: "Available",
                Trade: "HVAC",
              },
              {
                ID: 13,
                Name: "Sam Okonkwo",
                Availability: "Unavailable",
                Trade: "Electrical",
                Reason: "Sick",
              },
            ],
          }),
        };
      }
      if (url.includes("/timesheets/")) {
        return {
          status: 200,
          headers: {},
          body: JSON.stringify({
            result: [
              {
                ID: 9001,
                Technician: "Jordan Lee",
                Hours: 9.5,
                OvertimeHours: 1.5,
                Date: "2026-07-26",
                Job: "HVAC plant service — Harbour Tower",
              },
            ],
          }),
        };
      }
      return {
        status: 200,
        headers: {},
        body: JSON.stringify({ result: [] }),
      };
    },
  };
}

export function createRateLimitTransport(
  base: SimproHttpTransport,
  failFirst = 1,
): SimproHttpTransport {
  let failures = 0;
  return {
    async fetch(input) {
      if (failures < failFirst) {
        failures += 1;
        return {
          status: 429,
          headers: { "retry-after": "0" },
          body: "rate limited",
        };
      }
      return base.fetch(input);
    },
  };
}
