import type { CalendarEventContext } from "@/types/intelligence";

export type MeetingPreparationItem = {
  id: string;
  type: "decision" | "initiative" | "risk" | "opportunity" | "memory" | "meeting" | "email";
  title: string;
  summary: string;
};

export type MeetingPreparation = {
  meetingId: string;
  meetingTitle: string;
  startsAt: string;
  preparationScore: number;
  previousMeetings: MeetingPreparationItem[];
  relatedDecisions: MeetingPreparationItem[];
  relatedInitiatives: MeetingPreparationItem[];
  relatedRisks: MeetingPreparationItem[];
  relatedOpportunities: MeetingPreparationItem[];
  relevantMemory: MeetingPreparationItem[];
  recentEmails: MeetingPreparationItem[];
};

export type MeetingConflict = {
  id: string;
  eventIds: string[];
  title: string;
  startsAt: string;
  message: string;
};

export type CalendarHealthMetrics = {
  meetingOverload: boolean;
  meetingLoadRatio: number;
  strategicTimeAvailableMinutes: number;
  focusTimeAvailableMinutes: number;
  deepWorkScore: number;
  conflictCount: number;
  status: "balanced" | "overloaded" | "constrained";
  summary: string;
};

export type ExecutiveCalendarIntelligence = {
  connected: boolean;
  syncedAt: string | null;
  todaysAgenda: CalendarEventContext[];
  upcomingMeetings: CalendarEventContext[];
  meetingLoadMinutes: number;
  strategicTimeMinutes: number;
  focusTimeMinutes: number;
  conflicts: MeetingConflict[];
  travelGaps: Array<{ id: string; message: string; minutesAvailable: number }>;
  preparationNeeded: MeetingPreparation[];
  meetingPreparation: MeetingPreparation[];
  health: CalendarHealthMetrics;
};

export type ExecutiveMeetingIntelligence = {
  connected: boolean;
  totalMeetingsToday: number;
  onlineMeetingsToday: number;
  highPriorityMeetings: CalendarEventContext[];
  teamsReady: boolean;
};

export type ExecutiveEmailIntelligence = {
  connected: boolean;
  unreadCount: number;
  recentThreads: Array<{
    id: string;
    subject: string;
    from: string;
    receivedAt: string;
    preview: string;
  }>;
};

export type ExecutiveDayIntelligence = {
  calendar: ExecutiveCalendarIntelligence;
  meetings: ExecutiveMeetingIntelligence;
  email: ExecutiveEmailIntelligence;
};
