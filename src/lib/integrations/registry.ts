import {
  CalendarIntegrationProvider,
  CrmIntegrationProvider,
  DocumentsIntegrationProvider,
  OAuthIntegrationProvider,
  TasksIntegrationProvider,
  type IntegrationProvider,
} from "@/lib/integrations/provider";
import type { ContextDomain, ProviderId } from "@/lib/integrations/types";
import { createMicrosoft365Provider } from "@/lib/integrations/providers/microsoft365/service";
import { mapM365EventToCalendarContext } from "@/lib/integrations/providers/microsoft365/mapper";
import type { M365CalendarEvent } from "@/lib/integrations/providers/microsoft365/types";
import type { IntelligenceIntegrationsContext } from "@/types/intelligence";

const OAUTH_ENDPOINTS: Record<
  ProviderId,
  { authorizationUrl: string; tokenUrl: string; scopes: string[] }
> = {
  microsoft_365: {
    authorizationUrl:
      "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
    tokenUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    scopes: ["offline_access", "User.Read", "Calendars.Read", "Mail.Read"],
  },
  google_workspace: {
    authorizationUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    scopes: [
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/drive.readonly",
    ],
  },
  google_calendar: {
    authorizationUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    scopes: ["https://www.googleapis.com/auth/calendar.readonly"],
  },
  outlook_calendar: {
    authorizationUrl:
      "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
    tokenUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    scopes: ["offline_access", "Calendars.Read"],
  },
  microsoft_teams: {
    authorizationUrl:
      "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
    tokenUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    scopes: ["offline_access", "OnlineMeetings.Read"],
  },
  slack: {
    authorizationUrl: "https://slack.com/oauth/v2/authorize",
    tokenUrl: "https://slack.com/api/oauth.v2.access",
    scopes: ["channels:read", "users:read"],
  },
  salesforce: {
    authorizationUrl: "https://login.salesforce.com/services/oauth2/authorize",
    tokenUrl: "https://login.salesforce.com/services/oauth2/token",
    scopes: ["api", "refresh_token"],
  },
  hubspot: {
    authorizationUrl: "https://app.hubspot.com/oauth/authorize",
    tokenUrl: "https://api.hubapi.com/oauth/v1/token",
    scopes: ["crm.objects.contacts.read", "crm.objects.deals.read"],
  },
  jira: {
    authorizationUrl: "https://auth.atlassian.com/authorize",
    tokenUrl: "https://auth.atlassian.com/oauth/token",
    scopes: ["read:jira-work"],
  },
  confluence: {
    authorizationUrl: "https://auth.atlassian.com/authorize",
    tokenUrl: "https://auth.atlassian.com/oauth/token",
    scopes: ["read:confluence-content.all"],
  },
  sharepoint: {
    authorizationUrl:
      "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
    tokenUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    scopes: ["offline_access", "Sites.Read.All"],
  },
  notion: {
    authorizationUrl: "https://api.notion.com/v1/oauth/authorize",
    tokenUrl: "https://api.notion.com/v1/oauth/token",
    scopes: [],
  },
  github: {
    authorizationUrl: "https://github.com/login/oauth/authorize",
    tokenUrl: "https://github.com/login/oauth/access_token",
    scopes: ["repo", "read:org"],
  },
  asana: {
    authorizationUrl: "https://app.asana.com/-/oauth_authorize",
    tokenUrl: "https://app.asana.com/-/oauth_token",
    scopes: ["default"],
  },
  monday: {
    authorizationUrl: "https://auth.monday.com/oauth2/authorize",
    tokenUrl: "https://auth.monday.com/oauth2/token",
    scopes: ["boards:read"],
  },
};

const providerRegistry = new Map<ProviderId, IntegrationProvider>();

function registerProvider(provider: IntegrationProvider): void {
  providerRegistry.set(provider.id, provider);
}

function createProvider(
  id: ProviderId,
  factory: (
    id: ProviderId,
    oauth: (typeof OAUTH_ENDPOINTS)[ProviderId],
  ) => IntegrationProvider,
): void {
  registerProvider(factory(id, OAUTH_ENDPOINTS[id]));
}

export function initializeIntegrationRegistry(): void {
  if (providerRegistry.size > 0) {
    return;
  }

  const calendarProviders: ProviderId[] = [
    "google_calendar",
    "outlook_calendar",
  ];
  const crmProviders: ProviderId[] = ["salesforce", "hubspot"];
  const taskProviders: ProviderId[] = ["jira", "github", "asana", "monday"];
  const documentProviders: ProviderId[] = [
    "confluence",
    "sharepoint",
    "notion",
    "google_workspace",
  ];

  registerProvider(createMicrosoft365Provider());

  for (const providerId of Object.keys(OAUTH_ENDPOINTS) as ProviderId[]) {
    if (providerId === "microsoft_365") {
      continue;
    }
    if (calendarProviders.includes(providerId)) {
      createProvider(
        providerId,
        (id, oauth) => new CalendarIntegrationProvider(id, oauth),
      );
      continue;
    }

    if (crmProviders.includes(providerId)) {
      createProvider(providerId, (id, oauth) => new CrmIntegrationProvider(id, oauth));
      continue;
    }

    if (taskProviders.includes(providerId)) {
      createProvider(
        providerId,
        (id, oauth) => new TasksIntegrationProvider(id, oauth),
      );
      continue;
    }

    if (documentProviders.includes(providerId)) {
      createProvider(
        providerId,
        (id, oauth) => new DocumentsIntegrationProvider(id, oauth),
      );
      continue;
    }

    createProvider(
      providerId,
      (id, oauth) => new OAuthIntegrationProvider(id, oauth),
    );
  }
}

export function getIntegrationProvider(
  providerId: ProviderId,
): IntegrationProvider {
  initializeIntegrationRegistry();
  const provider = providerRegistry.get(providerId);

  if (!provider) {
    throw new Error(`Integration provider not registered: ${providerId}`);
  }

  return provider;
}

export function listRegisteredProviders(): ProviderId[] {
  initializeIntegrationRegistry();
  return Array.from(providerRegistry.keys());
}

export function getOAuthConfigForProvider(providerId: ProviderId) {
  return OAUTH_ENDPOINTS[providerId];
}

export type IntegrationContextProvider = {
  domain: keyof IntelligenceIntegrationsContext;
  providerIds: ProviderId[];
  apply: (
    context: IntelligenceIntegrationsContext,
    payload: Record<string, unknown>,
  ) => IntelligenceIntegrationsContext;
};

const contextProviders: IntegrationContextProvider[] = [
  {
    domain: "calendar",
    providerIds: [
      "google_calendar",
      "outlook_calendar",
      "google_workspace",
      "microsoft_365",
    ],
    apply: (context, payload) => {
      const calendarPayload = payload.calendar as { events?: M365CalendarEvent[] } | undefined;
      const rawEvents = calendarPayload?.events ?? payload.events;
      const events = Array.isArray(rawEvents)
        ? rawEvents.map((event) =>
            "subject" in event
              ? mapM365EventToCalendarContext(event as M365CalendarEvent)
              : (event as IntelligenceIntegrationsContext["calendar"]["events"][number]),
          )
        : context.calendar.events;

      return {
        ...context,
        calendar: {
          connected: true,
          events,
        },
      };
    },
  },
  {
    domain: "email",
    providerIds: ["google_workspace", "microsoft_365"],
    apply: (context, _payload) => ({
      ...context,
      email: { connected: true, threads: context.email.threads },
    }),
  },
  {
    domain: "crm",
    providerIds: ["salesforce", "hubspot"],
    apply: (context, payload) => ({
      ...context,
      crm: {
        connected: true,
        records: Array.isArray(payload.records)
          ? (payload.records as IntelligenceIntegrationsContext["crm"]["records"])
          : context.crm.records,
      },
    }),
  },
  {
    domain: "meetings",
    providerIds: ["microsoft_teams", "microsoft_365"],
    apply: (context, _payload) => ({
      ...context,
      meetings: { connected: true, meetings: context.meetings.meetings },
    }),
  },
  {
    domain: "tasks",
    providerIds: ["jira", "github", "asana", "monday"],
    apply: (context, payload) => ({
      ...context,
      tasks: {
        connected: true,
        tasks: Array.isArray(payload.tasks)
          ? (payload.tasks as IntelligenceIntegrationsContext["tasks"]["tasks"])
          : context.tasks.tasks,
      },
    }),
  },
  {
    domain: "documents",
    providerIds: [
      "confluence",
      "sharepoint",
      "notion",
      "google_workspace",
      "microsoft_365",
    ],
    apply: (context, payload) => ({
      ...context,
      documents: {
        connected: true,
        documents: Array.isArray(payload.documents)
          ? (payload.documents as IntelligenceIntegrationsContext["documents"]["documents"])
          : context.documents.documents,
      },
    }),
  },
  {
    domain: "knowledgeGraph",
    providerIds: ["confluence", "notion"],
    apply: (context, _payload) => ({
      ...context,
      knowledgeGraph: {
        connected: true,
        nodes: context.knowledgeGraph.nodes,
        edges: context.knowledgeGraph.edges,
      },
    }),
  },
];

export function getContextProvidersForDomain(
  domain: ContextDomain,
): IntegrationContextProvider[] {
  return contextProviders.filter((provider) => provider.domain === domain);
}

export function applyIntegrationContextPayload(
  base: IntelligenceIntegrationsContext,
  providerId: ProviderId,
  payload: Record<string, unknown>,
): IntelligenceIntegrationsContext {
  const matching = contextProviders.filter((provider) =>
    provider.providerIds.includes(providerId),
  );

  return matching.reduce(
    (context, provider) => provider.apply(context, payload),
    base,
  );
}

export function listIntegrationContextProviders(): IntegrationContextProvider[] {
  return contextProviders;
}
