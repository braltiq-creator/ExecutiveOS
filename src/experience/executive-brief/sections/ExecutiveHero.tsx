import Link from "next/link";
import { ExperienceBadge } from "@/experience/design-system/Badge";
import { Reveal } from "@/experience/motion/Reveal";

type ExecutiveHeroProps = {
  dayPart: string;
  name: string;
  judgementAreas: number;
  reviewMinutes: number;
  delay?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
};

/** Concise masthead — nothing more. */
export function ExecutiveHero({
  dayPart,
  name,
  judgementAreas,
  reviewMinutes,
  delay = 1,
}: ExecutiveHeroProps) {
  const areasLabel =
    judgementAreas === 1
      ? "one area"
      : `${numberWord(judgementAreas)} areas`;

  return (
    <Reveal delay={delay}>
      <header
        className="ex-snapshot-block space-y-3 border-b border-[var(--eos-border)] pb-4"
        aria-labelledby="executive-hero-heading"
      >
        <ExperienceBadge tone="accent">Executive Brief</ExperienceBadge>

        <div className="space-y-1.5">
          <p className="ex-body text-[var(--ex-text-secondary)]">
            {dayPart} {name}
          </p>
          <h1
            id="executive-hero-heading"
            className="ex-display text-[length:clamp(1.45rem,2.2vw,1.85rem)]"
          >
            Today requires judgement in {areasLabel}.
          </h1>
          <p className="ex-body">
            Estimated review time{" "}
            <span className="font-medium tabular-nums text-[var(--ex-text)]">
              {reviewMinutes} minutes
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Link
            href="#lead-judgement"
            className="inline-flex min-h-9 items-center justify-center rounded-[var(--ex-radius)] bg-[var(--ex-accent)] px-3.5 text-sm font-medium text-white transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--eos-ring)]"
          >
            Begin Executive Brief
          </Link>
          <Link
            href="#critical-insights"
            className="inline-flex min-h-9 items-center rounded-[var(--ex-radius)] px-3.5 text-sm font-medium text-[var(--ex-text-secondary)] transition-colors hover:text-[var(--ex-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--eos-ring)]"
          >
            Review Yesterday
          </Link>
        </div>
      </header>
    </Reveal>
  );
}

function numberWord(n: number): string {
  if (n === 2) return "two";
  if (n === 3) return "three";
  return String(n);
}
