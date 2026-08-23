import { requireAppAccess } from "@/lib/auth/access";
import { loadCalendarPageDataAction } from "@/lib/calendar/actions";
import { AppShell } from "@/components/layout/AppShell";
import { CalendarDashboard } from "@/components/calendar/CalendarDashboard";

export default async function CalendarPage() {
  await requireAppAccess({ requireOnboarding: false });
  const data = await loadCalendarPageDataAction();

  return (
    <AppShell breadcrumb="Calendar">
      <CalendarDashboard data={data} />
    </AppShell>
  );
}
