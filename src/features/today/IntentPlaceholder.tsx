import { SectionShell } from "@/components/shared/SectionShell";

export function IntentPlaceholder() {
  return (
    <SectionShell
      id="today-intent"
      label="Intent"
      description="Strategic mandate for this horizon — Focus, constraints, and Non-Focus. Full Briefing wiring arrives next."
    >
      <p className="max-w-2xl text-base leading-7 text-foreground">
        Intent context will frame ranking here. Amend Intent from Account →
        Strategic Intent when ready.
      </p>
    </SectionShell>
  );
}
