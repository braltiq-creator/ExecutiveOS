import type { M365CalendarEvent, M365TeamsMeeting } from "@/lib/integrations/providers/microsoft365/types";
import { mapM365EventToTeamsMeeting } from "@/lib/integrations/providers/microsoft365/mapper";

export function extractTeamsMeetingsFromEvents(
  events: M365CalendarEvent[],
): M365TeamsMeeting[] {
  return events
    .map(mapM365EventToTeamsMeeting)
    .filter((meeting): meeting is M365TeamsMeeting => meeting !== null);
}

// Future: Teams transcript and recording analysis hooks.
export type TeamsTranscriptPlaceholder = {
  meetingId: string;
  status: "pending" | "available";
};

export function listPendingTranscripts(
  meetings: M365TeamsMeeting[],
): TeamsTranscriptPlaceholder[] {
  return meetings.map((meeting) => ({
    meetingId: meeting.id,
    status: "pending" as const,
  }));
}
