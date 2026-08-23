import type {
  GraphCalendarEvent,
  M365Attendee,
  M365CalendarEvent,
  M365MailMessage,
  M365Person,
  M365TeamsMeeting,
} from "@/lib/integrations/providers/microsoft365/types";
import type { CalendarEventContext } from "@/types/intelligence";

function mapResponseStatus(
  status?: string,
): M365Attendee["responseStatus"] {
  switch (status) {
    case "accepted":
      return "accepted";
    case "declined":
      return "declined";
    case "tentativelyAccepted":
      return "tentative";
    default:
      return "none";
  }
}

function mapShowAs(value?: string): M365CalendarEvent["showAs"] {
  switch (value) {
    case "free":
      return "free";
    case "tentative":
      return "tentative";
    case "busy":
      return "busy";
    case "oof":
      return "oof";
    case "workingElsewhere":
      return "workingElsewhere";
    default:
      return "unknown";
  }
}

function mapImportance(value?: string): M365CalendarEvent["importance"] {
  if (value === "high") return "high";
  if (value === "low") return "low";
  return "normal";
}

export function mapGraphEventToM365(event: GraphCalendarEvent): M365CalendarEvent {
  const attendees: M365Attendee[] = (event.attendees ?? []).map((attendee) => ({
    name: attendee.emailAddress?.name ?? "Unknown",
    email: attendee.emailAddress?.address ?? "",
    responseStatus: mapResponseStatus(attendee.status?.response),
    optional: attendee.type === "optional",
  }));

  return {
    id: event.id,
    subject: event.subject ?? "Untitled meeting",
    bodyPreview: event.bodyPreview ?? null,
    startsAt: event.start.dateTime,
    endsAt: event.end.dateTime,
    isAllDay: Boolean(event.isAllDay),
    location: event.location?.displayName ?? null,
    onlineMeetingUrl: event.onlineMeeting?.joinUrl ?? null,
    isOnline: Boolean(event.isOnlineMeeting || event.onlineMeeting?.joinUrl),
    showAs: mapShowAs(event.showAs),
    isRecurring: Boolean(event.recurrence),
    recurrencePattern: event.recurrence?.pattern?.type ?? null,
    organizer: event.organizer?.emailAddress?.name ?? null,
    attendees,
    categories: event.categories ?? [],
    importance: mapImportance(event.importance),
  };
}

export function mapM365EventToCalendarContext(
  event: M365CalendarEvent,
): CalendarEventContext {
  return {
    id: event.id,
    title: event.subject,
    startsAt: event.startsAt,
    endsAt: event.endsAt,
    source: "Microsoft 365",
    location: event.location,
    onlineMeetingUrl: event.onlineMeetingUrl,
    isAllDay: event.isAllDay,
    isRecurring: event.isRecurring,
    showAs: event.showAs,
    attendeeCount: event.attendees.length,
    organizer: event.organizer,
    importance: event.importance,
  };
}

export function mapGraphMailToM365(message: {
  id: string;
  subject?: string;
  from?: { emailAddress?: { name?: string } };
  receivedDateTime?: string;
  bodyPreview?: string;
  isRead?: boolean;
}): M365MailMessage {
  return {
    id: message.id,
    subject: message.subject ?? "(No subject)",
    from: message.from?.emailAddress?.name ?? "Unknown",
    receivedAt: message.receivedDateTime ?? new Date().toISOString(),
    preview: message.bodyPreview ?? "",
    isRead: Boolean(message.isRead),
  };
}

export function mapGraphPersonToM365(person: {
  id: string;
  displayName?: string;
  mail?: string;
  jobTitle?: string;
}): M365Person {
  return {
    id: person.id,
    displayName: person.displayName ?? "Unknown",
    email: person.mail ?? "",
    jobTitle: person.jobTitle ?? null,
  };
}

export function mapM365EventToTeamsMeeting(event: M365CalendarEvent): M365TeamsMeeting | null {
  if (!event.isOnline && !event.onlineMeetingUrl) {
    return null;
  }

  return {
    id: event.id,
    subject: event.subject,
    startsAt: event.startsAt,
    endsAt: event.endsAt,
    joinUrl: event.onlineMeetingUrl,
    organizer: event.organizer,
  };
}

export function eventDurationMinutes(event: M365CalendarEvent): number {
  const start = new Date(event.startsAt).getTime();
  const end = new Date(event.endsAt).getTime();
  return Math.max(Math.round((end - start) / 60_000), 0);
}

export function isStrategicEvent(
  event: M365CalendarEvent,
  keywords: string[],
): boolean {
  const haystack = `${event.subject} ${event.bodyPreview ?? ""} ${event.categories.join(" ")}`.toLowerCase();
  return keywords.some((keyword) => haystack.includes(keyword.toLowerCase()));
}
