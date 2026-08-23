import type { CalendarHealthMetrics } from "@/lib/intelligence/providers/types";
import type { HealthSignal } from "@/lib/health/types";

export function evaluateCalendarHealthRules(
  calendar: CalendarHealthMetrics | null | undefined,
): HealthSignal[] {
  if (!calendar) {
    return [];
  }

  const signals: HealthSignal[] = [];

  if (calendar.meetingOverload) {
    signals.push({
      id: "calendar-meeting-overload",
      label: "Meeting overload detected on today's calendar.",
      impact: -12,
      category: "meeting",
    });
  }

  if (calendar.deepWorkScore < 50) {
    signals.push({
      id: "calendar-low-deep-work",
      label: "Limited deep work time available today.",
      impact: -8,
      category: "meeting",
    });
  }

  if (calendar.conflictCount > 0) {
    signals.push({
      id: "calendar-conflicts",
      label: `${calendar.conflictCount} meeting conflict(s) require resolution.`,
      impact: -10,
      category: "meeting",
    });
  }

  if (calendar.strategicTimeAvailableMinutes >= 90) {
    signals.push({
      id: "calendar-strategic-time",
      label: "Strategic calendar time is protected today.",
      impact: 6,
      category: "opportunity",
    });
  }

  if (calendar.focusTimeAvailableMinutes >= 60) {
    signals.push({
      id: "calendar-focus-time",
      label: "Focus blocks are available for deep work.",
      impact: 5,
      category: "opportunity",
    });
  }

  return signals;
}
