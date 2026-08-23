"use client";

import { useState } from "react";
import { EXECUTIVE_ICONS } from "@/experience/icons";
import { ExsOpenLink, ExsSectionHeader, ExsTrend } from "@/experience/exs";
import { Reveal } from "@/experience/motion/Reveal";
import type { SwOutcomeCard } from "@/experience/strategy-workspace/types";
import { cn } from "@/lib/utils/cn";

type Props = {
  outcomes: SwOutcomeCard[];
  focused?: boolean;
};

export function OutcomePortfolio({ outcomes, focused }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <Reveal delay={2}>
      <section
        id="outcome-portfolio"
        aria-label="Strategic Outcome Portfolio"
        className={cn("scroll-mt-6", focused && "exs-entry-focus rounded-[var(--exs-radius)]")}
      >
        <ExsSectionHeader
          label="Strategic Outcome Portfolio"
          icon={EXECUTIVE_ICONS.strategic_outcomes}
        />
        {outcomes.length === 0 ? (
          <article className="exs-card">
            <p className="exs-title text-[length:1rem]">No outcomes defined</p>
            <p className="exs-body mt-1">
              Define a few strategic outcomes to explain Organisation Health.
            </p>
          </article>
        ) : (
          <ul className="grid gap-3 lg:grid-cols-2">
            {outcomes.map((outcome) => {
              const open = expanded === outcome.id;
              return (
                <li key={outcome.id} id={`outcome-${outcome.id}`}>
                  <article className="exs-card h-full">
                    <header className="flex items-start justify-between gap-3">
                      <p className="exs-label flex min-w-0 items-center gap-1.5">
                        <EXECUTIVE_ICONS.strategic_outcomes
                          className="h-3.5 w-3.5 shrink-0"
                          strokeWidth={1.75}
                          aria-hidden="true"
                        />
                        <span className="truncate">{outcome.health}</span>
                      </p>
                      <ExsOpenLink href={outcome.href}>
                        Open Outcome →
                      </ExsOpenLink>
                    </header>
                    <h3 className="exs-title mt-2">{outcome.name}</h3>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[length:0.75rem] text-[var(--exs-text-secondary)]">
                      <span className="inline-flex items-center gap-1">
                        <ExsTrend
                          trend={outcome.trend}
                          severity={outcome.healthTone}
                        />
                        {outcome.trajectory}
                      </span>
                      <span>Owner {outcome.owner}</span>
                    </div>
                    <p className="exs-body mt-2 line-clamp-2">{outcome.impact}</p>
                    <p className="exs-body mt-2 text-[length:0.8rem]">
                      <span className="font-medium text-[var(--exs-text)]">
                        Next decision.{" "}
                      </span>
                      {outcome.nextDecision}
                    </p>
                    <button
                      type="button"
                      className="exs-open mt-3 self-start"
                      aria-expanded={open}
                      onClick={() =>
                        setExpanded(open ? null : outcome.id)
                      }
                    >
                      {open ? "Hide detail" : "Expand detail"}
                    </button>
                    {open ? (
                      <div className="mt-3 space-y-2 border-t border-[var(--exs-divider)] pt-3">
                        <p className="exs-body">{outcome.detail}</p>
                        {outcome.measures.length > 0 ? (
                          <ul className="space-y-1">
                            {outcome.measures.map((m) => (
                              <li key={m} className="exs-body text-[length:0.8rem]">
                                · {m}
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    ) : null}
                  </article>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </Reveal>
  );
}
