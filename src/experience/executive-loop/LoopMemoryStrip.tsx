import Link from "next/link";
import { EXECUTIVE_ICONS } from "@/experience/icons";
import { ExsOpenLink, ExsSectionHeader } from "@/experience/exs";
import { Reveal } from "@/experience/motion/Reveal";
import type { LoopMemory } from "@/experience/executive-loop/types";

type Props = {
  memory: LoopMemory;
};

/** Yesterday's Decisions → Today's Results — organisational learning. */
export function LoopMemoryStrip({ memory }: Props) {
  return (
    <Reveal delay={2}>
      <section
        aria-label="Executive Memory"
        className="mc-memory rounded-[var(--exs-radius)] border border-[var(--exs-border)] bg-[var(--exs-surface)] px-3 py-2.5 shadow-[var(--exs-shadow-1)]"
      >
        <div className="mb-2 flex items-start justify-between gap-3">
          <ExsSectionHeader
            label="Executive Memory"
            icon={EXECUTIVE_ICONS.priorities}
            className="mb-0"
          />
          <ExsOpenLink href="/knowledge?from=memory" className="shrink-0">
            Open Evidence →
          </ExsOpenLink>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="exs-label mb-1.5">Yesterday&apos;s Decisions</p>
            <ul className="space-y-1">
              {memory.yesterday.map((item) => (
                <li key={item.href + item.decisionTitle}>
                  <Link
                    href={item.href}
                    className="exs-body text-[length:0.8rem] text-[var(--exs-nav)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--eos-ring)]"
                  >
                    {item.decisionTitle}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="exs-label mb-1.5">Today&apos;s Results</p>
            <ul className="space-y-1">
              {memory.today.map((item) => (
                <li
                  key={item.label}
                  className="exs-body flex justify-between gap-2 text-[length:0.8rem]"
                >
                  <span>{item.label}</span>
                  <span className="font-medium text-[var(--exs-text)]">
                    {item.value}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </Reveal>
  );
}
