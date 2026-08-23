import { createClient } from "@/lib/supabase/server";
import type {
  ExecutiveMeetingRecord,
  MeetingActionInput,
  MeetingActionRecord,
  SaveMeetingInput,
} from "@/lib/meetings/types";

function mapMeetingInput(input: SaveMeetingInput, userId: string) {
  return {
    user_id: userId,
    title: input.title.trim(),
    meeting_date: input.meetingDate,
    duration_minutes: input.durationMinutes,
    participants: input.participants,
    raw_notes: input.rawNotes.trim(),
    meeting_summary: input.meetingSummary?.trim() || null,
    updated_at: new Date().toISOString(),
  };
}

export async function insertMeetingRecord(
  userId: string,
  input: SaveMeetingInput,
): Promise<ExecutiveMeetingRecord> {
  const supabase = await createClient();
  const timestamp = new Date().toISOString();

  const { data, error } = await supabase
    .from("executive_meetings")
    .insert({
      ...mapMeetingInput(input, userId),
      created_at: timestamp,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateMeetingRecord(
  userId: string,
  meetingId: string,
  input: SaveMeetingInput,
): Promise<ExecutiveMeetingRecord> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("executive_meetings")
    .update(mapMeetingInput(input, userId))
    .eq("user_id", userId)
    .eq("id", meetingId)
    .is("archived_at", null)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function markMeetingAnalyzed(
  userId: string,
  meetingId: string,
  summary: string,
): Promise<ExecutiveMeetingRecord> {
  const supabase = await createClient();
  const timestamp = new Date().toISOString();

  const { data, error } = await supabase
    .from("executive_meetings")
    .update({
      meeting_summary: summary,
      analyzed_at: timestamp,
      updated_at: timestamp,
    })
    .eq("user_id", userId)
    .eq("id", meetingId)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function archiveMeetingRecord(
  userId: string,
  meetingId: string,
): Promise<ExecutiveMeetingRecord> {
  const supabase = await createClient();
  const timestamp = new Date().toISOString();

  const { data, error } = await supabase
    .from("executive_meetings")
    .update({
      archived_at: timestamp,
      updated_at: timestamp,
    })
    .eq("user_id", userId)
    .eq("id", meetingId)
    .is("archived_at", null)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function replaceMeetingActions(
  userId: string,
  meetingId: string,
  actions: MeetingActionInput[],
): Promise<MeetingActionRecord[]> {
  const supabase = await createClient();

  const { error: deleteError } = await supabase
    .from("meeting_actions")
    .delete()
    .eq("meeting_id", meetingId)
    .eq("user_id", userId);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  if (actions.length === 0) {
    return [];
  }

  const timestamp = new Date().toISOString();
  const rows = actions.map((action, index) => ({
    meeting_id: meetingId,
    user_id: userId,
    title: action.title.trim(),
    description: action.description?.trim() || null,
    owner: action.owner?.trim() || null,
    due_date: action.dueDate?.trim() || null,
    status: action.status ?? "open",
    sort_order: index + 1,
    created_at: timestamp,
    updated_at: timestamp,
  }));

  const { data, error } = await supabase
    .from("meeting_actions")
    .insert(rows)
    .select("*");

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}
