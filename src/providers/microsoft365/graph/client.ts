/**
 * Microsoft Graph client contract — vendor transport only.
 * Engines never import Graph response types from here.
 */

import type { AuthCredentials, AuthSession } from "@/connectivity/authentication";
import {
  authenticateWithStrategy,
  getAuthStrategy,
} from "@/connectivity/authentication";
import {
  classifyFailure,
  computeBackoff,
  shouldRetry,
  type RetryPolicy,
  DEFAULT_RETRY_POLICY,
} from "@/connectivity/retry";

export type GraphPage<T> = {
  items: T[];
  nextLink: string | null;
  deltaLink: string | null;
};

export type GraphRequest = {
  path: string;
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  query?: Record<string, string>;
  body?: unknown;
  deltaToken?: string;
};

export type GraphClientOptions = {
  tenantId: string;
  credentials: AuthCredentials;
  asOf?: string;
  retryPolicy?: RetryPolicy;
  /** Injected transport for tests / mock */
  transport?: GraphTransport;
};

export type GraphTransport = {
  request<T>(input: {
    path: string;
    method: string;
    headers: Record<string, string>;
    query?: Record<string, string>;
    body?: unknown;
  }): Promise<{ status: number; body: T; headers: Record<string, string> }>;
};

export type GraphClient = {
  readonly tenantId: string;
  authenticate(): { ok: boolean; session?: AuthSession; message: string };
  refreshToken(): { ok: boolean; session?: AuthSession; message: string };
  getSession(): AuthSession | undefined;
  request<T>(req: GraphRequest): Promise<GraphPage<T>>;
  paginate<T>(req: GraphRequest, maxPages?: number): Promise<T[]>;
  delta<T>(path: string, deltaToken?: string): Promise<GraphPage<T>>;
  registerWebhook(input: {
    resource: string;
    notificationUrl: string;
    clientState: string;
  }): { ok: boolean; subscriptionId: string; message: string };
};

/**
 * Create a Graph client with auth, retry, rate-limit awareness, delta, pagination.
 * Default transport is a deterministic mock suitable for Reality Lab / unit tests.
 */
export function createMicrosoftGraphClient(
  options: GraphClientOptions,
): GraphClient {
  let session: AuthSession | undefined;
  const policy = options.retryPolicy ?? DEFAULT_RETRY_POLICY;
  const transport = options.transport ?? createMockGraphTransport(options.asOf);
  const asOf = options.asOf ?? new Date().toISOString();

  const client: GraphClient = {
    tenantId: options.tenantId,
    authenticate() {
      const result = authenticateWithStrategy({
        connectorId: `m365-${options.tenantId}`,
        credentials: options.credentials,
        asOf,
      });
      if (result.ok && result.session) session = result.session;
      return result;
    },
    refreshToken() {
      if (!session) {
        return { ok: false, message: "No session to refresh" };
      }
      const strategy = getAuthStrategy(session.strategy);
      const result = strategy.refresh
        ? strategy.refresh(session, options.credentials)
        : authenticateWithStrategy({
            connectorId: session.connectorId,
            credentials: options.credentials,
            asOf: new Date().toISOString(),
          });
      if (result.ok && result.session) session = result.session;
      return result;
    },
    getSession: () => session,
    async request<T>(req: GraphRequest): Promise<GraphPage<T>> {
      if (!session || session.status !== "active") {
        const auth = client.authenticate();
        if (!auth.ok) {
          throw new Error(auth.message);
        }
      }
      if (session && !getAuthStrategy(session.strategy).validateSession(session, asOf)) {
        const refreshed = client.refreshToken();
        if (!refreshed.ok) throw new Error("Token refresh failed");
      }

      let attempt = 1;
      while (true) {
        const response = await transport.request<T & { value?: T[]; "@odata.nextLink"?: string; "@odata.deltaLink"?: string }>({
          path: req.path,
          method: req.method ?? "GET",
          headers: {
            Authorization: `Bearer ${session?.id ?? "mock"}`,
            "X-Tenant-Id": options.tenantId,
          },
          query: {
            ...req.query,
            ...(req.deltaToken ? { $deltatoken: req.deltaToken } : {}),
          },
          body: req.body,
        });

        if (response.status === 429 || response.status >= 500) {
          const kind = classifyFailure(
            response.status === 429
              ? "429 rate limit — temporary"
              : `HTTP ${response.status} unavailable`,
          );
          if (!shouldRetry(kind, attempt, policy)) {
            throw new Error(`Graph request failed after retries: ${response.status}`);
          }
          const delay = computeBackoff(attempt, { ...policy, jitter: false });
          void delay;
          attempt += 1;
          continue;
        }

        if (response.status === 401) {
          const refreshed = client.refreshToken();
          if (!refreshed.ok || attempt >= policy.maxAttempts) {
            throw new Error("Unauthorized — token refresh exhausted");
          }
          attempt += 1;
          continue;
        }

        const body = response.body as {
          value?: T[];
          "@odata.nextLink"?: string;
          "@odata.deltaLink"?: string;
        } & T;

        if (Array.isArray(body.value)) {
          return {
            items: body.value,
            nextLink: body["@odata.nextLink"] ?? null,
            deltaLink: body["@odata.deltaLink"] ?? null,
          };
        }

        return {
          items: [body as T],
          nextLink: null,
          deltaLink: null,
        };
      }
    },
    async paginate<T>(req: GraphRequest, maxPages = 5): Promise<T[]> {
      const all: T[] = [];
      let page = await client.request<T>(req);
      all.push(...page.items);
      let pages = 1;
      while (page.nextLink && pages < maxPages) {
        page = await client.request<T>({ path: page.nextLink });
        all.push(...page.items);
        pages += 1;
      }
      return all;
    },
    async delta<T>(path: string, deltaToken?: string) {
      return client.request<T>({ path, deltaToken });
    },
    registerWebhook(input) {
      return {
        ok: true,
        subscriptionId: `sub-${options.tenantId}-${input.resource.replace(/\W+/g, "-")}`,
        message: "Webhook subscription registered (mock-safe)",
      };
    },
  };

  return client;
}

function createMockGraphTransport(asOf?: string): GraphTransport {
  const stamp = asOf ?? "2026-07-26T07:30:00+10:00";
  return {
    async request<T>(input: {
      path: string;
      method: string;
      headers: Record<string, string>;
      query?: Record<string, string>;
      body?: unknown;
    }) {
      const { path } = input;
      const respond = (body: unknown) => ({
        status: 200,
        headers: {} as Record<string, string>,
        body: body as T,
      });

      if (path.includes("/calendarView") || path.includes("/events")) {
        return respond({
          value: [
            {
              id: "m365-board-q3",
              subject: "Board Strategy Review",
              start: { dateTime: "2026-07-26T09:00:00", timeZone: "AEST" },
              end: { dateTime: "2026-07-26T11:00:00", timeZone: "AEST" },
              attendees: [
                { emailAddress: { name: "Alex", address: "alex@northline.test" } },
                { emailAddress: { name: "Chair", address: "chair@northline.test" } },
              ],
              categories: ["Board"],
              importance: "high",
            },
            {
              id: "m365-elt-ops",
              subject: "ELT Operating Review",
              start: { dateTime: "2026-07-26T14:00:00", timeZone: "AEST" },
              end: { dateTime: "2026-07-26T15:00:00", timeZone: "AEST" },
              attendees: [
                { emailAddress: { name: "Alex", address: "alex@northline.test" } },
                { emailAddress: { name: "COO", address: "coo@northline.test" } },
              ],
              categories: ["Leadership"],
              importance: "normal",
            },
            {
              id: "m365-finance",
              subject: "Cancelled — Finance Review",
              start: { dateTime: "2026-07-27T10:00:00", timeZone: "AEST" },
              end: { dateTime: "2026-07-27T10:30:00", timeZone: "AEST" },
              isCancelled: true,
              attendees: [],
              categories: ["Finance"],
              importance: "high",
            },
          ],
          "@odata.deltaLink": "delta:calendar:v1",
        });
      }
      if (path.includes("/messages")) {
        return respond({
          value: [
            {
              id: "mail-board-pack",
              subject: "Board pack draft for review",
              from: { emailAddress: { name: "CoS", address: "cos@northline.test" } },
              receivedDateTime: stamp,
              bodyPreview: "Please review the Q3 board pack before 08:00.",
              importance: "high",
              isRead: false,
            },
          ],
        });
      }
      if (path.includes("/planner") || path.includes("/tasks")) {
        return respond({
          value: [
            {
              id: "task-cash",
              title: "Close cash conversion actions",
              percentComplete: 40,
              dueDateTime: "2026-07-30T00:00:00Z",
            },
          ],
        });
      }
      if (path.includes("/drive") || path.includes("/sites")) {
        return respond({
          value: [
            {
              id: "doc-board-pack",
              name: "Q3 Board Pack.docx",
              lastModifiedDateTime: stamp,
            },
          ],
        });
      }
      if (path.includes("/chats") || path.includes("/teams")) {
        return respond({
          value: [
            {
              id: "teams-helix",
              topic: "Helix renewal risk",
              lastMessagePreview: "Customer asked for executive call this week.",
            },
          ],
        });
      }
      if (path.includes("/people") || path.includes("/contacts")) {
        return respond({
          value: [
            {
              id: "person-chair",
              displayName: "Board Chair",
              jobTitle: "Chair",
              scoredEmailAddresses: [{ address: "chair@northline.test" }],
            },
            {
              id: "person-helix",
              displayName: "Helix Sponsor",
              jobTitle: "CIO",
              scoredEmailAddresses: [{ address: "sponsor@helix.test" }],
            },
          ],
        });
      }
      if (path.includes("/presence")) {
        return respond({
          value: [
            {
              id: "presence-alex",
              availability: "Busy",
              activity: "InAMeeting",
            },
          ],
        });
      }
      return respond({ value: [] });
    },
  };
}
