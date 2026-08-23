import { EXECUTIVE_ICONS } from "@/experience/icons";
import { ExsOpenLink, ExsSectionHeader } from "@/experience/exs";
import { Reveal } from "@/experience/motion/Reveal";
import type {
  MeetingPack,
  RhythmAwareness,
  RhythmLearning,
} from "@/experience/executive-rhythm/types";

type BriefProps = {
  awareness: RhythmAwareness;
};

/**
 * Command Centre cadence line for Executive Brief.
 * Compact — preparation signal + Open Meeting Pack.
 */
export function RhythmBriefCadence({ awareness }: BriefProps) {
  return (
    <div data-rhythm-brief="true" className="space-y-1">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <ExsSectionHeader
          label="Executive Brief"
          icon={EXECUTIVE_ICONS.pulse}
          className="mb-0"
        />
        <ExsOpenLink href={awareness.packHref}>Open Meeting Pack →</ExsOpenLink>
      </div>
      <p className="exs-title text-[length:0.9rem]">{awareness.headline}</p>
      <p className="exs-body text-[length:0.78rem]">{awareness.detail}</p>
      <p className="exs-label normal-case">
        Estimated preparation time{" "}
        <span className="tabular-nums text-[var(--exs-text)]">
          {awareness.prepMinutes} minutes
        </span>
        <span className="mx-1.5 text-[var(--exs-text-muted)]">·</span>
        {awareness.preparationWindow}
      </p>
    </div>
  );
}

type PackProps = {
  pack: MeetingPack;
  learning?: RhythmLearning | null;
};

/** Full reusable executive preparation pack. */
export function MeetingPackPanel({ pack, learning }: PackProps) {
  return (
    <Reveal delay={2}>
      <section
        id="meeting-pack"
        aria-label="Meeting Pack"
        className="scroll-mt-6 space-y-3"
        data-meeting-pack="true"
      >
        <ExsSectionHeader
          label="Meeting Pack"
          icon={EXECUTIVE_ICONS.today}
        />
        <article className="exs-card space-y-3 p-[var(--exs-space-5)]">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="exs-label">Purpose</p>
              <p className="exs-title mt-1 text-[length:1rem]">{pack.rhythmName}</p>
              <p className="exs-body mt-1 text-[length:0.85rem]">{pack.purpose}</p>
            </div>
            <p className="exs-label normal-case">
              Duration {pack.estimatedDurationMinutes} min · Prep {pack.prepMinutes}{" "}
              min
            </p>
          </div>

          <div>
            <p className="exs-label mb-1">Executive summary</p>
            <p className="exs-body text-[length:0.85rem]">{pack.executiveSummary}</p>
          </div>

          <List label="Council observations" items={pack.councilObservations} />
          <div>
            <p className="exs-label mb-1">Key decisions</p>
            <ul className="space-y-1">
              {pack.keyDecisions.map((d) => (
                <li key={d.href + d.title}>
                  <ExsOpenLink href={d.href}>{`${d.title} →`}</ExsOpenLink>
                </li>
              ))}
            </ul>
          </div>
          <List label="Strategic outcomes" items={pack.strategicOutcomes} />
          <div className="grid gap-3 sm:grid-cols-2">
            <List label="Risks" items={pack.risks} />
            <List label="Opportunities" items={pack.opportunities} />
          </div>
          <List label="Supporting evidence" items={pack.supportingEvidence} />

          <div>
            <p className="exs-label mb-1">Recommended discussion sequence</p>
            <ol className="space-y-1">
              {pack.discussionSequence.map((step, i) => (
                <li key={step} className="exs-body text-[length:0.8rem]">
                  {i + 1}. {step}
                </li>
              ))}
            </ol>
          </div>

          <div>
            <p className="exs-label mb-1">Council adaptation</p>
            <ul className="grid gap-1.5 sm:grid-cols-2">
              {pack.councilFocus.map((f) => (
                <li key={f.roleId} className="exs-card py-2">
                  <p className="exs-label">{f.shortTitle}</p>
                  <p className="exs-body mt-0.5 text-[length:0.75rem]">{f.focus}</p>
                </li>
              ))}
            </ul>
          </div>

          {learning ? (
            <div className="border-t border-[var(--exs-divider)] pt-3">
              <p className="exs-label mb-1">Rhythm learning</p>
              <p className="exs-body text-[length:0.8rem]">
                Prep {learning.preparationQuality}. Decisions{" "}
                {learning.decisionQuality}.
              </p>
              <p className="exs-body mt-1 text-[length:0.8rem]">
                {learning.learning}
              </p>
            </div>
          ) : null}
        </article>
      </section>
    </Reveal>
  );
}

function List({ label, items }: { label: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="exs-label mb-1">{label}</p>
      <ul className="space-y-0.5">
        {items.map((item) => (
          <li key={item} className="exs-body text-[length:0.8rem]">
            · {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
