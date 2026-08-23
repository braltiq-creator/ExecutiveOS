import { requireAppAccess } from "@/lib/auth/access";
import { loadMeetingsPageData } from "@/lib/meetings/actions";
import { AppShell } from "@/components/layout/AppShell";
import { MeetingRegister } from "@/components/meetings/MeetingRegister";

export default async function MeetingsPage() {
  await requireAppAccess();
  const meetings = await loadMeetingsPageData();

  return (
    <AppShell breadcrumb="Meetings">
      <MeetingRegister initialMeetings={meetings} />
    </AppShell>
  );
}
