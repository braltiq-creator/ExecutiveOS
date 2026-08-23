"use server";

import { requireAuth } from "@/lib/auth/actions";
import {
  archiveMeeting,
  getMeetings,
  saveMeeting,
} from "@/lib/meetings/service";
import type {
  MeetingWithActions,
  SaveMeetingInput,
} from "@/lib/meetings/types";
import { ExecutiveMeetingError } from "@/lib/meetings/types";

export type MeetingActionResult = {
  error: string | null;
  data: MeetingWithActions | null;
};

export async function saveMeetingAction(
  input: SaveMeetingInput,
): Promise<MeetingActionResult> {
  try {
    const user = await requireAuth();
    const data = await saveMeeting(user.id, input);
    return { error: null, data };
  } catch (error) {
    return {
      error:
        error instanceof ExecutiveMeetingError || error instanceof Error
          ? error.message
          : "Unable to save meeting.",
      data: null,
    };
  }
}

export async function archiveMeetingAction(
  meetingId: string,
): Promise<MeetingActionResult> {
  try {
    const user = await requireAuth();
    await archiveMeeting(user.id, meetingId);
    return { error: null, data: null };
  } catch (error) {
    return {
      error:
        error instanceof ExecutiveMeetingError || error instanceof Error
          ? error.message
          : "Unable to archive meeting.",
      data: null,
    };
  }
}

export async function loadMeetingsPageData(): Promise<MeetingWithActions[]> {
  const user = await requireAuth();
  return getMeetings(user.id);
}
