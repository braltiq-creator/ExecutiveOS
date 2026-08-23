import { MeetingCard } from "@/components/meetings/MeetingCard";
import type { MeetingWithActions } from "@/lib/meetings/types";

type MeetingListProps = {
  meetings: MeetingWithActions[];
  onEdit: (data: MeetingWithActions) => void;
  onArchive: (meetingId: string) => void;
  archivingId?: string | null;
};

export function MeetingList({
  meetings,
  onEdit,
  onArchive,
  archivingId = null,
}: MeetingListProps) {
  if (meetings.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/50 px-6 py-12 text-center">
        <p className="text-sm leading-6 text-zinc-600">
          No meetings captured yet. Record your first meeting to enrich Executive
          Intelligence with summaries, decisions, risks, and action items.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {meetings.map((meeting) => (
        <MeetingCard
          key={meeting.meeting.id}
          data={meeting}
          onEdit={onEdit}
          onArchive={onArchive}
          archiving={archivingId === meeting.meeting.id}
        />
      ))}
    </div>
  );
}
