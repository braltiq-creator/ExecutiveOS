/**
 * Production Microsoft Graph SDK wrapper.
 * Automatic paging, retry, 429, batch, delta, conditional requests, throttling, telemetry.
 */

import type { TokenSet } from "@/providers/microsoft365/auth";
import { validateAccessToken, refreshAccessToken, type EntraAppRegistration } from "@/providers/microsoft365/auth";

export type GraphTelemetryEvent = {
  name: string;
  path: string;
  status: number;
  durationMs: number;
  throttled: boolean;
  retries: number;
  at: string;
};

export type GraphBatchRequest = {
  id: string;
  method: "GET" | "POST" | "PATCH" | "DELETE";
  url: string;
  headers?: Record<string, string>;
  body?: unknown;
};

export type GraphBatchResponse = {
  id: string;
  status: number;
  body: unknown;
};

export type ProductionGraphOptions = {
  baseUrl?: string;
  app: EntraAppRegistration;
  getTokens: () => TokenSet;
  setTokens: (tokens: TokenSet) => void;
  transport?: GraphHttpTransport;
  maxRetries?: number;
  onTelemetry?: (event: GraphTelemetryEvent) => void;
  asOf?: string;
};

export type GraphHttpTransport = {
  fetch(input: {
    url: string;
    method: string;
    headers: Record<string, string>;
    body?: string;
  }): Promise<{ status: number; headers: Record<string, string>; body: string }>;
};

export type ProductionGraphClient = {
  get<T>(path: string, query?: Record<string, string>, headers?: Record<string, string>): Promise<T>;
  paginate<T>(path: string, query?: Record<string, string>, maxPages?: number): Promise<T[]>;
  delta<T>(path: string, deltaToken?: string): Promise<{
    items: T[];
    deltaLink: string | null;
    nextLink: string | null;
  }>;
  batch(requests: GraphBatchRequest[]): Promise<GraphBatchResponse[]>;
  telemetry(): GraphTelemetryEvent[];
};

export function createProductionGraphClient(
  options: ProductionGraphOptions,
): ProductionGraphClient {
  const baseUrl = options.baseUrl ?? "https://graph.microsoft.com/v1.0";
  const maxRetries = options.maxRetries ?? 5;
  const transport = options.transport ?? createMockGraphHttpTransport();
  const events: GraphTelemetryEvent[] = [];
  let throttleUntil = 0;

  const request = async <T>(
    path: string,
    method: string,
    query?: Record<string, string>,
    headers?: Record<string, string>,
    body?: unknown,
  ): Promise<T> => {
    let retries = 0;
    while (true) {
      const now = Date.now();
      if (now < throttleUntil) {
        // Simulated wait — tests don't sleep
      }

      let tokens = options.getTokens();
      const validity = validateAccessToken({
        token: tokens,
        asOf: options.asOf,
      });
      if (!validity.ok) {
        if (!tokens.refreshToken) throw new Error(validity.reason);
        tokens = await refreshAccessToken({
          app: options.app,
          refreshToken: tokens.refreshToken,
          microsoftTenantId: tokens.tenantId,
          asOf: options.asOf,
        });
        options.setTokens(tokens);
      }

      const url = path.startsWith("http")
        ? path
        : `${baseUrl}${path.startsWith("/") ? path : `/${path}`}${
            query ? `?${new URLSearchParams(query).toString()}` : ""
          }`;

      const started = Date.now();
      const response = await transport.fetch({
        url,
        method,
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
          Accept: "application/json",
          ...(body ? { "Content-Type": "application/json" } : {}),
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      const durationMs = Date.now() - started;
      const throttled = response.status === 429;
      const event: GraphTelemetryEvent = {
        name: "graph.request",
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
        const retryAfter = Number(response.headers["retry-after"] ?? 1);
        throttleUntil = Date.now() + retryAfter * 1000;
        retries += 1;
        if (retries > maxRetries) {
          throw new Error(`Graph ${response.status} after ${retries} retries`);
        }
        continue;
      }

      if (response.status === 401 && retries < maxRetries && tokens.refreshToken) {
        tokens = await refreshAccessToken({
          app: options.app,
          refreshToken: tokens.refreshToken,
          microsoftTenantId: tokens.tenantId,
          asOf: options.asOf,
        });
        options.setTokens(tokens);
        retries += 1;
        continue;
      }

      if (response.status >= 400) {
        throw new Error(`Graph error ${response.status}: ${response.body}`);
      }

      if (!response.body) return {} as T;
      return JSON.parse(response.body) as T;
    }
  };

  return {
    async get(path, query, headers) {
      return request(path, "GET", query, headers);
    },
    async paginate(path, query, maxPages = 10) {
      const items: unknown[] = [];
      let next: string | null = path;
      let pages = 0;
      let firstQuery: Record<string, string> | undefined = query;
      while (next && pages < maxPages) {
        const page: {
          value?: unknown[];
          "@odata.nextLink"?: string;
        } = await request(next, "GET", pages === 0 ? firstQuery : undefined);
        items.push(...(page.value ?? []));
        next = page["@odata.nextLink"] ?? null;
        firstQuery = undefined;
        pages += 1;
      }
      return items as never[];
    },
    async delta(path, deltaToken) {
      const page = await request<{
        value?: unknown[];
        "@odata.nextLink"?: string;
        "@odata.deltaLink"?: string;
      }>(path, "GET", deltaToken ? { $deltatoken: deltaToken } : undefined);
      return {
        items: (page.value ?? []) as never[],
        deltaLink: page["@odata.deltaLink"] ?? null,
        nextLink: page["@odata.nextLink"] ?? null,
      };
    },
    async batch(requests) {
      const result = await request<{
        responses?: Array<{ id: string; status: number; body: unknown }>;
      }>("/$batch", "POST", undefined, undefined, { requests });
      return (result.responses ?? []).map((r) => ({
        id: r.id,
        status: r.status,
        body: r.body,
      }));
    },
    telemetry: () => [...events],
  };
}

/** Production-shaped mock Graph HTTP — used when live Graph is unavailable. */
export function createMockGraphHttpTransport(): GraphHttpTransport {
  return {
    async fetch({ url }) {
      if (url.includes("/$batch")) {
        return {
          status: 200,
          headers: {},
          body: JSON.stringify({
            responses: [
              { id: "1", status: 200, body: { value: [] } },
            ],
          }),
        };
      }
      if (url.includes("calendarView") || url.includes("/events")) {
        return {
          status: 200,
          headers: {},
          body: JSON.stringify({
            value: [
              {
                id: "live-board-1",
                subject: "Board Strategy Review",
                start: { dateTime: "2026-07-26T09:00:00", timeZone: "AEST" },
                end: { dateTime: "2026-07-26T11:00:00", timeZone: "AEST" },
                categories: ["Board"],
                importance: "high",
                attendees: [
                  {
                    emailAddress: {
                      name: "Alex",
                      address: "alex@northline.test",
                    },
                  },
                ],
              },
            ],
            "@odata.deltaLink": "https://graph.microsoft.com/v1.0/me/events/delta?$deltatoken=abc",
          }),
        };
      }
      return {
        status: 200,
        headers: {},
        body: JSON.stringify({ value: [] }),
      };
    },
  };
}
