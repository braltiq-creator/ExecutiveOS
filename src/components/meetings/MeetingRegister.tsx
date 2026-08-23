"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { archiveMeetingAction } from "@/lib/meetings/actions";
import { MeetingForm } from "@/components/meetings/MeetingForm";
import { MeetingList } from "@/components/meetings/MeetingList";
import type { MeetingWithActions } from "@/lib/meetings/types";

type MeetingRegisterProps = {
  initialMeetings: MeetingWithActions[];
};

export function MeetingRegister({ initialMeetings }: MeetingRegisterProps) {
  const router = useRouter();
  const [meetings, setMeetings] = useState(initialMeetings);
  const [showForm, setShowForm] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<MeetingWithActions | null>(
    null,
  );
  const [archivingId, setArchivingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isArchiving, startArchive] = useTransition();

  function handleSaved(data: MeetingWithActions) {
    setMeetings((current) => {
      const index = current.findIndex(
        (item) => item.meeting.id === data.meeting.id,
      );

      if (index >= 0) {
        const next = [...current];
        next[index] = data;
        return next.sort(
          (left, right) =>
            new Date(right.meeting.meeting_date).getTime() -
            new Date(left.meeting.meeting_date).getTime(),
        );
      }

      return [data, ...current];
    });

    setShowForm(false);
    setEditingMeeting(null);
    router.refresh();
  }

  function handleEdit(data: MeetingWithActions) {
    setEditingMeeting(data);
    setShowForm(true);
    setError(null);
  }

  function handleArchive(meetingId: string) {
    setError(null);
    setArchivingId(meetingId);

    startArchive(async () => {
      const result = await archiveMeetingAction(meetingId);

      if (result.error) {
        setError(result.error);
        setArchivingId(null);
        return;
      }

      setMeetings((current) =>
        current.filter((item) => item.meeting.id !== meetingId),
      );
      setArchivingId(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-500">Meeting Intelligence</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
            Executive Meetings
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600 sm:text-base">
            Capture meetings, generate summaries, and automatically enrich
            decisions, risks, opportunities, and commitments across ExecutiveOS.
          </p>
        </div>
        {!showForm ? (
          <button
            type="button"
            onClick={() => {
              setEditingMeeting(null);
              setShowForm(true);
              setError(null);
            }}
            className="inline-flex h-11 items-center justify-center rounded-lg bg-zinc-900 px-5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
          >
            Capture Meeting
          </button>
        ) : null}
      </div>

      {error ? (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
        >
          {error}
        </div>
      ) : null}

      {showForm ? (
        <MeetingForm
          initialData={editingMeeting}
          onSaved={handleSaved}
          onCancel={() => {
            setShowForm(false);
            setEditingMeeting(null);
          }}
        />
      ) : null}

      <section>
        <h2 className="mb-6 text-lg font-semibold tracking-tight text-zinc-900 sm:text-xl">
          Meeting Register
        </h2>
        <MeetingList
          meetings={meetings}
          onEdit={handleEdit}
          onArchive={handleArchive}
          archivingId={isArchiving ? archivingId : null}
        />
      </section>
    </div>
  );
}
