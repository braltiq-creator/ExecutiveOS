import type {
  ExecutiveTimeline,
  TimelineBucket,
  TimelineEvent,
  TimelineEventType,
} from "@/lib/intelligence-center/types";
import type { ExecutiveIntelligenceResult } from "@/types/intelligence";

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function endOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(23, 59, 59, 999);
  return copy;
}

function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function startOfWeek(date: Date): Date {
  const copy = startOfDay(date);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  return copy;
}

function resolveBucket(isoDate: string, now: Date): TimelineBucket | null {
  const date = new Date(isoDate);
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const yesterdayStart = addDays(todayStart, -1);
  const yesterdayEnd = endOfDay(yesterdayStart);
  const weekStart = startOfWeek(now);
  const weekEnd = endOfDay(addDays(weekStart, 6));
  const nextWeekStart = addDays(weekStart, 7);
  const nextWeekEnd = endOfDay(addDays(nextWeekStart, 6));

  if (date >= yesterdayStart && date <= yesterdayEnd) return "yesterday";
  if (date >= todayStart && date <= todayEnd) return "today";
  if (date > todayEnd && date <= weekEnd) return "this_week";
  if (date >= nextWeekStart && date <= nextWeekEnd) return "next_week";
  return null;
}

function createEvent(input: {
  id: string;
  bucket: TimelineBucket;
  type: TimelineEventType;
  typeLabel: string;
  title: string;
  summary: string;
  startsAt: string;
  endsAt?: string;
  badge?: string;
}): TimelineEvent {
  return input;
}

function emptyTimeline(): ExecutiveTimeline {
  return {
    yesterday: [],
    today: [],
    this_week: [],
    next_week: [],
  };
}

export function buildExecutiveTimeline(
  intelligence: ExecutiveIntelligenceResult,
): ExecutiveTimeline {
  const timeline = emptyTimeline();
  const now = new Date();

  for (const event of intelligence.calendar.todaysAgenda) {
    const bucket = resolveBucket(event.startsAt, now);
    if (!bucket) continue;
    timeline[bucket].push(
      createEvent({
        id: `cal-${event.id}`,
        bucket,
        type: "meeting",
        typeLabel: "Meeting",
        title: event.title,
        summary: event.location ?? "Calendar event",
        startsAt: event.startsAt,
        endsAt: event.endsAt,
        badge: event.importance,
      }),
    );
  }

  for (const event of intelligence.calendar.upcomingMeetings) {
    const bucket = resolveBucket(event.startsAt, now);
    if (!bucket || bucket === "today") continue;
    timeline[bucket].push(
      createEvent({
        id: `upcoming-${event.id}`,
        bucket,
        type: "meeting",
        typeLabel: "Meeting",
        title: event.title,
        summary: event.location ?? "Upcoming meeting",
        startsAt: event.startsAt,
        endsAt: event.endsAt,
      }),
    );
  }

  for (const initiative of intelligence.initiatives.initiatives) {
    if (!initiative.targetDate) continue;
    const bucket = resolveBucket(initiative.targetDate, now);
    if (!bucket) continue;
    timeline[bucket].push(
      createEvent({
        id: `initiative-${initiative.id}`,
        bucket,
        type: "initiative",
        typeLabel: "Initiative",
        title: initiative.title,
        summary: `Target date · ${initiative.progressPercentage}% complete`,
        startsAt: initiative.targetDate,
        badge: initiative.healthStatus.replace("_", " "),
      }),
    );
  }

  for (const decision of intelligence.decisions.decisions) {
    const date = decision.reviewDate ?? decision.decisionDate;
    const bucket = resolveBucket(date, now);
    if (!bucket) continue;

    const isBoard =
      decision.title.toLowerCase().includes("board") ||
      decision.summary.toLowerCase().includes("board");

    timeline[bucket].push(
      createEvent({
        id: `decision-${decision.id}`,
        bucket,
        type: isBoard ? "board_event" : "decision",
        typeLabel: isBoard ? "Board Event" : "Decision",
        title: decision.title,
        summary: decision.summary,
        startsAt: date,
        badge: decision.statusLabel,
      }),
    );
  }

  for (const bucket of Object.keys(timeline) as TimelineBucket[]) {
    timeline[bucket].sort(
      (left, right) =>
        new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime(),
    );
  }

  return timeline;
}

export function countTimelineEvents(timeline: ExecutiveTimeline): number {
  return (
    timeline.yesterday.length +
    timeline.today.length +
    timeline.this_week.length +
    timeline.next_week.length
  );
}
