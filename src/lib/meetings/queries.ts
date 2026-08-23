import { createClient } from "@/lib/supabase/server";
import type {
  ExecutiveMeetingRecord,
  MeetingActionRecord,
  MeetingQueryOptions,
} from "@/lib/meetings/types";

export async function fetchMeetingById(
  userId: string,
  meetingId: string,
): Promise<ExecutiveMeetingRecord | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("executive_meetings")
    .select("*")
    .eq("user_id", userId)
    .eq("id", meetingId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function fetchMeetings(
  userId: string,
  options: MeetingQueryOptions = {},
): Promise<ExecutiveMeetingRecord[]> {
  const supabase = await createClient();

  let query = supabase
    .from("executive_meetings")
    .select("*")
    .eq("user_id", userId)
    .order("meeting_date", { ascending: false });

  if (!options.includeArchived) {
    query = query.is("archived_at", null);
  }

  if (options.limit !== undefined) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function fetchMeetingActions(
  meetingId: string,
): Promise<MeetingActionRecord[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("meeting_actions")
    .select("*")
    .eq("meeting_id", meetingId)
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function fetchMeetingsWithActions(
  userId: string,
): Promise<Array<{ meeting: ExecutiveMeetingRecord; actions: MeetingActionRecord[] }>> {
  const meetings = await fetchMeetings(userId);
  const results = await Promise.all(
    meetings.map(async (meeting) => ({
      meeting,
      actions: await fetchMeetingActions(meeting.id),
    })),
  );

  return results;
}
