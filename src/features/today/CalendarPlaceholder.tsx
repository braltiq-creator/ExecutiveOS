import { SectionShell } from "@/components/shared/SectionShell";

export function CalendarPlaceholder() {
  return (
    <SectionShell
      id="today-calendar"
      label="Calendar"
      description="Rhythm context for the day — not the hero of the Briefing."
    >
      <p className="max-w-2xl text-sm leading-6 text-secondary">
        Meeting and calendar context will appear here as Observe input. Calendar
        remains utility — it does not become a seventh primary destination.
      </p>
    </SectionShell>
  );
}
