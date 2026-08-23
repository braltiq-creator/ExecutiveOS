import { ExperienceBadge } from "@/experience/design-system/Badge";
import { ExperienceCardShell } from "@/experience/design-system/Card";
import { ConfidenceBar } from "@/experience/motion/ConfidenceBar";
import { Reveal } from "@/experience/motion/Reveal";
import { SnapshotCta } from "@/experience/executive-brief/SnapshotCta";
import type { BusinessPulse } from "@/lib/snapshot/types";

type LeadJudgementProps = {
  pulse: BusinessPulse;
  prose: string;
  evidenceSources: string;
  tone: "success" | "attention" | "critical" | "accent" | "neutral";
  delay?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
};

/**
 * Visual centrepiece of the Executive Snapshot.
 * Awareness only — analysis continues in Strategy / Decisions.
 */
export function LeadJudgement({
  pulse,
  prose,
  evidenceSources,
  tone,
  delay = 0,
}: LeadJudgementProps) {
  return (
    <Reveal delay={delay}>
      <section
        id="lead-judgement"
        aria-labelledby="lead-judgement-heading"
        className="ex-snapshot-block scroll-mt-6"
      >
        <p className="ex-caption mb-2">What deserves judgement?</p>
        <h2 id="lead-judgement-heading" className="sr-only">
          Lead judgement
        </h2>

        <ExperienceCardShell className="ex-lead-judgement space-y-4 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <ExperienceBadge tone={tone}>{pulse.label}</ExperienceBadge>
            <ConfidenceBar
              value={pulse.confidence}
              className="w-32"
              label="Confidence"
            />
          </div>

          <p className="ex-heading text-[length:clamp(1.2rem,1.8vw,1.45rem)] leading-snug tracking-tight">
            {prose}
          </p>

          <dl className="grid gap-2 border-t border-[var(--eos-border)] pt-3 sm:grid-cols-2">
            <div>
              <dt className="ex-caption">Evidence sources</dt>
              <dd className="ex-body mt-0.5 text-[length:0.85rem] text-[var(--ex-text)]">
                {evidenceSources}
              </dd>
            </div>
            <div>
              <dt className="ex-caption">Last updated</dt>
              <dd className="ex-body mt-0.5 text-[length:0.85rem] text-[var(--ex-text)]">
                {pulse.refreshedLabel}
              </dd>
            </div>
          </dl>

          <SnapshotCta href="/strategy">Open Analysis</SnapshotCta>
        </ExperienceCardShell>
      </section>
    </Reveal>
  );
}
