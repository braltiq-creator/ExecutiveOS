import type {
  GraphCalendarEvent,
  M365CalendarEvent,
} from "@/lib/integrations/providers/microsoft365/types";
import { mapGraphEventToM365 } from "@/lib/integrations/providers/microsoft365/mapper";

const GRAPH_BASE = "https://graph.microsoft.com/v1.0";

export async function fetchGraphCalendarEvents(input: {
  accessToken: string;
  startDateTime: string;
  endDateTime: string;
}): Promise<M365CalendarEvent[]> {
  const params = new URLSearchParams({
    startDateTime: input.startDateTime,
    endDateTime: input.endDateTime,
    $orderby: "start/dateTime",
    $top: "100",
  });

  const response = await fetch(
    `${GRAPH_BASE}/me/calendarView?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${input.accessToken}`,
        Prefer: 'outlook.timezone="UTC"',
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Microsoft Graph calendar request failed (${response.status}).`);
  }

  const payload = (await response.json()) as { value?: GraphCalendarEvent[] };
  return (payload.value ?? []).map(mapGraphEventToM365);
}

export function getCalendarWindow(timezone = "UTC"): {
  startDateTime: string;
  endDateTime: string;
} {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 14);

  return {
    startDateTime: start.toISOString(),
    endDateTime: end.toISOString(),
  };
}

export function buildExecutiveFallbackEvents(input: {
  company: string;
  jobTitle: string;
  initiativeTitles: string[];
}): M365CalendarEvent[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const makeEvent = (
    dayOffset: number,
    hour: number,
    durationMinutes: number,
    subject: string,
    options: Partial<M365CalendarEvent> = {},
  ): M365CalendarEvent => {
    const start = new Date(today);
    start.setDate(start.getDate() + dayOffset);
    start.setHours(hour, 0, 0, 0);
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + durationMinutes);

    return {
      id: `fallback-${dayOffset}-${hour}-${subject.replace(/\s+/g, "-").toLowerCase()}`,
      subject,
      bodyPreview: null,
      startsAt: start.toISOString(),
      endsAt: end.toISOString(),
      isAllDay: false,
      location: options.location ?? "Executive Office",
      onlineMeetingUrl: options.onlineMeetingUrl ?? null,
      isOnline: Boolean(options.onlineMeetingUrl),
      showAs: options.showAs ?? "busy",
      isRecurring: Boolean(options.isRecurring),
      recurrencePattern: options.recurrencePattern ?? null,
      organizer: `${input.jobTitle}, ${input.company}`,
      attendees: options.attendees ?? [],
      categories: options.categories ?? [],
      importance: options.importance ?? "normal",
    };
  };

  const initiative = input.initiativeTitles[0] ?? "Strategic Initiative";
  const secondInitiative = input.initiativeTitles[1] ?? "Operating Review";

  return [
    makeEvent(0, 8, 60, "Leadership stand-up", {
      onlineMeetingUrl: "https://teams.microsoft.com/l/meetup-join/standup",
      categories: ["Operations"],
    }),
    makeEvent(0, 10, 90, `Board preparation: ${initiative}`, {
      onlineMeetingUrl: "https://teams.microsoft.com/l/meetup-join/board-prep",
      categories: ["Strategic", initiative],
      importance: "high",
    }),
    makeEvent(0, 14, 60, "1:1 with direct report", {
      location: "Conference Room A",
      categories: ["Leadership"],
    }),
    makeEvent(0, 16, 45, `${secondInitiative} review`, {
      onlineMeetingUrl: "https://teams.microsoft.com/l/meetup-join/initiative-review",
      categories: ["Strategic", secondInitiative],
    }),
    makeEvent(1, 9, 120, "Executive committee", {
      onlineMeetingUrl: "https://teams.microsoft.com/l/meetup-join/exec-committee",
      categories: ["Strategic"],
      importance: "high",
      isRecurring: true,
      recurrencePattern: "weekly",
    }),
    makeEvent(1, 14, 30, "Focus block — deep work", {
      showAs: "free",
      categories: ["Focus"],
    }),
    makeEvent(2, 11, 60, "Customer advisory board", {
      location: "Client HQ",
      categories: ["External"],
    }),
  ];
}
