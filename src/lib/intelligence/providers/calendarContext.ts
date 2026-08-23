import type { M365CalendarEvent } from "@/lib/integrations/providers/microsoft365/types";
import type {
  CalendarHealthMetrics,
  ExecutiveCalendarIntelligence,
  MeetingConflict,
  MeetingPreparation,
  MeetingPreparationItem,
} from "@/lib/intelligence/providers/types";
import type { CalendarEventContext } from "@/types/intelligence";

export function isSameDay(isoDate: string, reference = new Date()): boolean {
  const date = new Date(isoDate);
  return (
    date.getFullYear() === reference.getFullYear() &&
    date.getMonth() === reference.getMonth() &&
    date.getDate() === reference.getDate()
  );
}

export function buildCalendarIntelligence(input: {
  events: M365CalendarEvent[];
  connected: boolean;
  objectiveTitles: string[];
  initiativeTitles: string[];
  decisionTitles: string[];
  memoryEntries: Array<{ id: string; title: string; memoryType: string; content: string }>;
  previousMeetingTitles: string[];
}): ExecutiveCalendarIntelligence {
  const todayEvents = input.events
    .filter((event) => isSameDay(event.startsAt))
    .sort(
      (left, right) =>
        new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime(),
    );

  const upcomingEvents = input.events
    .filter((event) => new Date(event.startsAt) >= new Date())
    .sort(
      (left, right) =>
        new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime(),
    )
    .slice(0, 20);

  const strategicKeywords = [
    ...input.objectiveTitles,
    ...input.initiativeTitles,
    "board",
    "strategic",
    "executive",
    "committee",
  ];

  const meetingLoadMinutes = todayEvents
    .filter((event) => event.showAs !== "free")
    .reduce((total, event) => total + eventDuration(event), 0);

  const strategicTimeMinutes = todayEvents
    .filter((event) => isStrategicEvent(event, strategicKeywords))
    .reduce((total, event) => total + eventDuration(event), 0);

  const focusBlocks = findFocusBlocks(todayEvents);
  const focusTimeMinutes = focusBlocks.reduce(
    (total, block) => total + block.durationMinutes,
    0,
  );

  const conflicts = detectConflicts(todayEvents);
  const travelGaps = detectTravelGaps(todayEvents);
  const preparation = buildMeetingPreparations(input, upcomingEvents.slice(0, 6));

  const health = buildCalendarHealth({
    meetingLoadMinutes,
    strategicTimeMinutes,
    focusTimeMinutes,
    conflicts: conflicts.length,
    eventCount: todayEvents.length,
  });

  return {
    connected: input.connected,
    syncedAt: new Date().toISOString(),
    todaysAgenda: todayEvents.map(mapEventToContext),
    upcomingMeetings: upcomingEvents.map(mapEventToContext),
    meetingLoadMinutes,
    strategicTimeMinutes,
    focusTimeMinutes,
    conflicts,
    travelGaps,
    preparationNeeded: preparation.filter((item) => item.preparationScore >= 60),
    meetingPreparation: preparation,
    health,
  };
}

function eventDuration(event: M365CalendarEvent): number {
  return Math.max(
    Math.round(
      (new Date(event.endsAt).getTime() - new Date(event.startsAt).getTime()) / 60_000,
    ),
    0,
  );
}

function isStrategicEvent(event: M365CalendarEvent, keywords: string[]): boolean {
  const haystack =
    `${event.subject} ${event.bodyPreview ?? ""} ${event.categories.join(" ")}`.toLowerCase();
  return keywords.some((keyword) => haystack.includes(keyword.toLowerCase()));
}

function mapEventToContext(event: M365CalendarEvent): CalendarEventContext {
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

function findFocusBlocks(events: M365CalendarEvent[]): Array<{
  startsAt: string;
  endsAt: string;
  durationMinutes: number;
}> {
  const busyEvents = events
    .filter((event) => event.showAs !== "free")
    .sort(
      (left, right) =>
        new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime(),
    );

  const blocks: Array<{ startsAt: string; endsAt: string; durationMinutes: number }> =
    [];

  for (let index = 0; index < busyEvents.length - 1; index += 1) {
    const currentEnd = new Date(busyEvents[index].endsAt).getTime();
    const nextStart = new Date(busyEvents[index + 1].startsAt).getTime();
    const gapMinutes = Math.round((nextStart - currentEnd) / 60_000);

    if (gapMinutes >= 45) {
      blocks.push({
        startsAt: busyEvents[index].endsAt,
        endsAt: busyEvents[index + 1].startsAt,
        durationMinutes: gapMinutes,
      });
    }
  }

  return blocks;
}

function detectConflicts(events: M365CalendarEvent[]): MeetingConflict[] {
  const conflicts: MeetingConflict[] = [];
  const sorted = [...events].sort(
    (left, right) =>
      new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime(),
  );

  for (let index = 0; index < sorted.length - 1; index += 1) {
    const current = sorted[index];
    const next = sorted[index + 1];
    const currentEnd = new Date(current.endsAt).getTime();
    const nextStart = new Date(next.startsAt).getTime();

    if (currentEnd > nextStart && current.showAs !== "free" && next.showAs !== "free") {
      conflicts.push({
        id: `${current.id}-${next.id}`,
        eventIds: [current.id, next.id],
        title: `${current.subject} overlaps ${next.subject}`,
        startsAt: next.startsAt,
        message: "Meeting conflict detected. Consider rescheduling or delegating attendance.",
      });
    }
  }

  return conflicts;
}

function detectTravelGaps(events: M365CalendarEvent[]): Array<{
  id: string;
  message: string;
  minutesAvailable: number;
}> {
  return events
    .filter((event, index) => {
      if (index === 0) return false;
      const previous = events[index - 1];
      const hasPhysicalLocation =
        Boolean(event.location) &&
        Boolean(previous.location) &&
        event.location !== previous.location &&
        !event.isOnline;
      return hasPhysicalLocation;
    })
    .map((event, index) => ({
      id: `travel-${event.id}`,
      message: `Travel time may be required before ${event.subject}.`,
      minutesAvailable: 15,
    }));
}

function buildMeetingPreparations(
  input: {
    objectiveTitles: string[];
    initiativeTitles: string[];
    decisionTitles: string[];
    memoryEntries: Array<{ id: string; title: string; memoryType: string; content: string }>;
    previousMeetingTitles: string[];
  },
  meetings: M365CalendarEvent[],
): MeetingPreparation[] {
  return meetings.map((meeting) => {
    const terms = tokenize(meeting.subject);
    const relatedDecisions = matchItems(input.decisionTitles, terms, "decision");
    const relatedInitiatives = matchItems(input.initiativeTitles, terms, "initiative");
    const relatedMemory = input.memoryEntries
      .filter((entry) => terms.some((term) => matchesTerm(entry.title, term)))
      .slice(0, 3)
      .map((entry) => ({
        id: entry.id,
        type: normalizeMemoryType(entry.memoryType),
        title: entry.title,
        summary: entry.content.slice(0, 160),
      }));
    const relatedRisks = relatedMemory.filter((entry) => entry.type === "risk");
    const relatedOpportunities = relatedMemory.filter(
      (entry) => entry.type === "opportunity",
    );
    const previousMeetings = input.previousMeetingTitles
      .filter((title) => terms.some((term) => matchesTerm(title, term)))
      .slice(0, 2)
      .map((title, index) => ({
        id: `prev-${index}`,
        type: "meeting" as const,
        title,
        summary: "Related prior meeting on this topic.",
      }));

    const preparationScore =
      meeting.importance === "high" ? 80 : meeting.attendees.length > 4 ? 65 : 40;

    return {
      meetingId: meeting.id,
      meetingTitle: meeting.subject,
      startsAt: meeting.startsAt,
      preparationScore,
      previousMeetings,
      relatedDecisions,
      relatedInitiatives,
      relatedRisks,
      relatedOpportunities,
      relevantMemory: relatedMemory,
      recentEmails: [],
    };
  });
}

function normalizeMemoryType(
  memoryType: string,
): MeetingPreparationItem["type"] {
  const normalized = memoryType.toLowerCase();
  if (normalized === "risk") return "risk";
  if (normalized === "opportunity") return "opportunity";
  if (normalized === "decision") return "decision";
  return "memory";
}

function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((term) => term.length > 3);
}

function matchesTerm(haystack: string, term: string): boolean {
  return haystack.toLowerCase().includes(term);
}

function matchItems(
  items: string[],
  terms: string[],
  type: MeetingPreparationItem["type"],
): MeetingPreparationItem[] {
  return items
    .filter((item) => terms.some((term) => matchesTerm(item, term)))
    .slice(0, 2)
    .map((title, index) => ({
      id: `${type}-${index}-${title}`,
      type,
      title,
      summary: `Related ${type} connected to this meeting topic.`,
    }));
}

function buildCalendarHealth(input: {
  meetingLoadMinutes: number;
  strategicTimeMinutes: number;
  focusTimeMinutes: number;
  conflicts: number;
  eventCount: number;
}): CalendarHealthMetrics {
  const workdayMinutes = 540;
  const meetingLoadRatio = input.meetingLoadMinutes / workdayMinutes;
  const meetingOverload = meetingLoadRatio >= 0.65 || input.eventCount >= 6;
  const strategicRatio = input.strategicTimeMinutes / Math.max(input.meetingLoadMinutes, 1);
  const deepWorkScore = clamp(
    Math.round(
      (input.focusTimeMinutes / 120) * 40 +
        (1 - Math.min(meetingLoadRatio, 1)) * 40 +
        strategicRatio * 20 -
        input.conflicts * 10,
    ),
    0,
    100,
  );

  return {
    meetingOverload,
    meetingLoadRatio: Math.round(meetingLoadRatio * 100),
    strategicTimeAvailableMinutes: input.strategicTimeMinutes,
    focusTimeAvailableMinutes: input.focusTimeMinutes,
    deepWorkScore,
    conflictCount: input.conflicts,
    status: meetingOverload ? "overloaded" : deepWorkScore >= 60 ? "balanced" : "constrained",
    summary: meetingOverload
      ? "Calendar is overloaded. Protect focus time and consider cancelling low-value meetings."
      : deepWorkScore >= 60
        ? "Calendar balance supports strategic work and deep focus."
        : "Limited focus time available. Block deep work before accepting new meetings.",
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function buildEmptyCalendarIntelligence(): ExecutiveCalendarIntelligence {
  return buildCalendarIntelligence({
    events: [],
    connected: false,
    objectiveTitles: [],
    initiativeTitles: [],
    decisionTitles: [],
    memoryEntries: [],
    previousMeetingTitles: [],
  });
}
