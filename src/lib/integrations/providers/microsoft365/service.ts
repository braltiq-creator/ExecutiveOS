import {
  buildExecutiveFallbackEvents,
  fetchGraphCalendarEvents,
  getCalendarWindow,
} from "@/lib/integrations/providers/microsoft365/calendar";
import {
  buildFallbackMailMessages,
  fetchGraphMailMessages,
} from "@/lib/integrations/providers/microsoft365/mail";
import { buildPeopleFromAttendees } from "@/lib/integrations/providers/microsoft365/people";
import { extractTeamsMeetingsFromEvents } from "@/lib/integrations/providers/microsoft365/teams";
import type {
  M365CalendarEvent,
  M365SyncCursor,
  M365SyncPayload,
} from "@/lib/integrations/providers/microsoft365/types";
import type { ProviderRuntimeContext } from "@/lib/integrations/provider";
import {
  OAuthIntegrationProvider,
  type SyncResult,
} from "@/lib/integrations/provider";
import type { ProviderId, SyncTriggerType } from "@/lib/integrations/types";
import type { OAuthProviderConfig } from "@/lib/integrations/provider";
import { getOAuthConfigForProvider } from "@/lib/integrations/registry";

export async function syncMicrosoft365Data(input: {
  accessToken: string | null;
  cursor: Record<string, unknown>;
  triggerType: SyncTriggerType;
  fallbackContext?: {
    company: string;
    jobTitle: string;
    initiativeTitles: string[];
  };
}): Promise<{
  payload: M365SyncPayload;
  cursor: M365SyncCursor;
  recordsProcessed: number;
}> {
  const window = getCalendarWindow();
  let events: M365CalendarEvent[] = [];
  let messages = buildFallbackMailMessages();
  let usedFallback = false;

  if (input.accessToken) {
    try {
      events = await fetchGraphCalendarEvents({
        accessToken: input.accessToken,
        startDateTime: window.startDateTime,
        endDateTime: window.endDateTime,
      });
      messages = await fetchGraphMailMessages(input.accessToken);
    } catch {
      usedFallback = true;
    }
  } else {
    usedFallback = true;
  }

  if (usedFallback && input.fallbackContext) {
    events = buildExecutiveFallbackEvents(input.fallbackContext);
  }

  const existingCursor = input.cursor as Partial<M365SyncCursor>;
  if (
    input.triggerType === "incremental" &&
    Array.isArray(existingCursor.events) &&
    events.length > 0
  ) {
    const existingIds = new Set(existingCursor.events.map((event) => event.id));
    const merged = [
      ...existingCursor.events,
      ...events.filter((event) => !existingIds.has(event.id)),
    ];
    events = merged;
  }

  const teamsMeetings = extractTeamsMeetingsFromEvents(events);
  const people = buildPeopleFromAttendees(
    events.flatMap((event) =>
      event.attendees.map((attendee) => ({
        name: attendee.name,
        email: attendee.email,
      })),
    ),
  );

  const syncedAt = new Date().toISOString();
  const cursor: M365SyncCursor = {
    lastSyncedAt: syncedAt,
    calendarDeltaToken: null,
    events,
    messages,
    teamsMeetings,
    people,
  };

  const payload: M365SyncPayload = {
    providerId: "microsoft_365",
    syncedAt,
    calendar: { events },
    email: { messages },
    meetings: { teamsMeetings },
    people,
  };

  return {
    payload,
    cursor,
    recordsProcessed: events.length + messages.length + teamsMeetings.length,
  };
}

export class Microsoft365IntegrationProvider extends OAuthIntegrationProvider {
  constructor(oauth: OAuthProviderConfig) {
    super("microsoft_365" as ProviderId, oauth);
  }

  override async sync(
    ctx: ProviderRuntimeContext,
    options: { triggerType: SyncTriggerType; cursor: Record<string, unknown> },
  ): Promise<SyncResult> {
    const result = await syncMicrosoft365Data({
      accessToken: ctx.tokens?.accessToken ?? null,
      cursor: options.cursor,
      triggerType: options.triggerType,
      fallbackContext: {
        company: "ExecutiveOS",
        jobTitle: "Executive",
        initiativeTitles: ["Strategic Initiative"],
      },
    });

    return {
      recordsProcessed: result.recordsProcessed,
      cursorAfter: result.cursor as unknown as Record<string, unknown>,
      contextPayload: {
        ...result.payload,
        calendarIntelligence: {
          events: result.payload.calendar.events,
          syncedAt: result.payload.syncedAt,
        },
      },
    };
  }
}

export function createMicrosoft365Provider(): Microsoft365IntegrationProvider {
  return new Microsoft365IntegrationProvider(getOAuthConfigForProvider("microsoft_365"));
}
