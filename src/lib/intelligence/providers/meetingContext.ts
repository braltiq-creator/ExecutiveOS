import type { M365CalendarEvent } from "@/lib/integrations/providers/microsoft365/types";
import type {
  ExecutiveMeetingIntelligence,
  MeetingPreparation,
} from "@/lib/intelligence/providers/types";
import type { CalendarEventContext } from "@/types/intelligence";

export function buildMeetingIntelligence(input: {
  events: M365CalendarEvent[];
  connected: boolean;
  preparation: MeetingPreparation[];
}): ExecutiveMeetingIntelligence {
  const today = new Date();
  const todayEvents = input.events.filter((event) => isSameDay(event.startsAt, today));

  const highPriority = todayEvents
    .filter((event) => event.importance === "high")
    .map(mapEvent);

  return {
    connected: input.connected,
    totalMeetingsToday: todayEvents.filter((event) => event.showAs !== "free").length,
    onlineMeetingsToday: todayEvents.filter((event) => event.isOnline).length,
    highPriorityMeetings: highPriority,
    teamsReady: todayEvents.some((event) => Boolean(event.onlineMeetingUrl)),
  };
}

function isSameDay(isoDate: string, reference: Date): boolean {
  const date = new Date(isoDate);
  return (
    date.getFullYear() === reference.getFullYear() &&
    date.getMonth() === reference.getMonth() &&
    date.getDate() === reference.getDate()
  );
}

function mapEvent(event: M365CalendarEvent): CalendarEventContext {
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

export function getMeetingsNeedingPreparation(
  preparation: MeetingPreparation[],
): MeetingPreparation[] {
  return preparation
    .filter((item) => item.preparationScore >= 60)
    .sort((left, right) => right.preparationScore - left.preparationScore);
}
