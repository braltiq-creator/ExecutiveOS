export type M365Attendee = {
  name: string;
  email: string;
  responseStatus: "accepted" | "declined" | "tentative" | "none";
  optional: boolean;
};

export type M365CalendarEvent = {
  id: string;
  subject: string;
  bodyPreview: string | null;
  startsAt: string;
  endsAt: string;
  isAllDay: boolean;
  location: string | null;
  onlineMeetingUrl: string | null;
  isOnline: boolean;
  showAs: "free" | "tentative" | "busy" | "oof" | "workingElsewhere" | "unknown";
  isRecurring: boolean;
  recurrencePattern: string | null;
  organizer: string | null;
  attendees: M365Attendee[];
  categories: string[];
  importance: "low" | "normal" | "high";
};

export type M365MailMessage = {
  id: string;
  subject: string;
  from: string;
  receivedAt: string;
  preview: string;
  isRead: boolean;
};

export type M365TeamsMeeting = {
  id: string;
  subject: string;
  startsAt: string;
  endsAt: string;
  joinUrl: string | null;
  organizer: string | null;
};

export type M365Person = {
  id: string;
  displayName: string;
  email: string;
  jobTitle: string | null;
};

export type M365SyncCursor = {
  lastSyncedAt: string | null;
  calendarDeltaToken: string | null;
  events: M365CalendarEvent[];
  messages: M365MailMessage[];
  teamsMeetings: M365TeamsMeeting[];
  people: M365Person[];
};

export type M365SyncPayload = {
  providerId: "microsoft_365";
  syncedAt: string;
  calendar: {
    events: M365CalendarEvent[];
  };
  email: {
    messages: M365MailMessage[];
  };
  meetings: {
    teamsMeetings: M365TeamsMeeting[];
  };
  people: M365Person[];
};

export type GraphCalendarEvent = {
  id: string;
  subject?: string;
  bodyPreview?: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  isAllDay?: boolean;
  location?: { displayName?: string };
  onlineMeeting?: { joinUrl?: string };
  isOnlineMeeting?: boolean;
  showAs?: string;
  recurrence?: { pattern?: { type?: string } } | null;
  organizer?: { emailAddress?: { name?: string } };
  attendees?: Array<{
    emailAddress?: { name?: string; address?: string };
    status?: { response?: string };
    type?: string;
  }>;
  categories?: string[];
  importance?: string;
};
