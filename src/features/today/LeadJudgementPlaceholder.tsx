import { SectionShell } from "@/components/shared/SectionShell";

export function LeadJudgementPlaceholder() {
  return (
    <SectionShell
      id="today-lead-judgement"
      label="Lead judgement"
      description="The single most consequential call for today — what, why, and what to do."
    >
      <div className="max-w-2xl space-y-3">
        <p className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Lead judgement prepares here
        </p>
        <p className="text-sm leading-6 text-secondary">
          The Executive Briefing will surface one centre of attention with
          Outcome grounding and an explicit next move. This shell reserves that
          space without fabricating urgency.
        </p>
      </div>
    </SectionShell>
  );
}
