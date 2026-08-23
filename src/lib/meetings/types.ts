import type { MemoryImportance } from "@/lib/memory/types";

export const MEETING_ACTION_STATUSES = [
  "open",
  "in_progress",
  "completed",
  "cancelled",
] as const;

export type MeetingActionStatus = (typeof MEETING_ACTION_STATUSES)[number];

export const MEETING_ACTION_STATUS_LABELS: Record<MeetingActionStatus, string> = {
  open: "Open",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export type ExecutiveMeetingRecord = {
  id: string;
  user_id: string;
  title: string;
  meeting_date: string;
  duration_minutes: number;
  participants: string[];
  raw_notes: string;
  meeting_summary: string | null;
  archived_at: string | null;
  analyzed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type MeetingActionRecord = {
  id: string;
  meeting_id: string;
  user_id: string;
  title: string;
  description: string | null;
  owner: string | null;
  due_date: string | null;
  status: MeetingActionStatus;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type MeetingActionInput = {
  id?: string;
  title: string;
  description?: string;
  owner?: string;
  dueDate?: string;
  status?: MeetingActionStatus;
};

export type ExtractedDecision = {
  title: string;
  summary: string;
  reason: string;
  expectedOutcome: string;
  owner?: string;
};

export type ExtractedMemoryItem = {
  title: string;
  content: string;
  importance?: MemoryImportance;
};

export type ExtractedActionItem = {
  title: string;
  description?: string;
  owner?: string;
  dueDate?: string;
  status?: MeetingActionStatus;
};

export type MeetingExtraction = {
  summary: string;
  decisions: ExtractedDecision[];
  risks: ExtractedMemoryItem[];
  opportunities: ExtractedMemoryItem[];
  commitments: ExtractedMemoryItem[];
  actionItems: ExtractedActionItem[];
};

export type MeetingInsightsInput = {
  decisions?: ExtractedDecision[];
  risks?: ExtractedMemoryItem[];
  opportunities?: ExtractedMemoryItem[];
  commitments?: ExtractedMemoryItem[];
};

export type SaveMeetingInput = {
  id?: string;
  title: string;
  meetingDate: string;
  durationMinutes: number;
  participants: string[];
  rawNotes: string;
  meetingSummary?: string;
  actionItems: MeetingActionInput[];
  insights?: MeetingInsightsInput;
  analyze?: boolean;
};

export type MeetingQueryOptions = {
  includeArchived?: boolean;
  limit?: number;
};

export type MeetingWithActions = {
  meeting: ExecutiveMeetingRecord;
  actions: MeetingActionRecord[];
};

export type MeetingAnalyzer = {
  analyze: (meeting: ExecutiveMeetingRecord) => Promise<MeetingExtraction>;
};

export class ExecutiveMeetingError extends Error {
  readonly code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = "ExecutiveMeetingError";
    this.code = code;
  }
}

export function meetingMemorySource(
  meetingId: string,
  type: "risk" | "opportunity" | "commitment",
  index: number,
): string {
  return `meeting:${meetingId}:${type}:${index}`;
}

export function meetingDecisionSource(meetingId: string, index: number): string {
  return `meeting:${meetingId}:decision:${index}`;
}

export function formatMeetingActionStatus(status: MeetingActionStatus): string {
  return MEETING_ACTION_STATUS_LABELS[status];
}

export function parseParticipants(value: string): string[] {
  return value
    .split(/[\n,;]+/)
    .map((participant) => participant.trim())
    .filter(Boolean);
}

export function formatParticipants(participants: string[]): string {
  return participants.join(", ");
}
