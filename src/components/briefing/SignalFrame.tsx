"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { RecommendationMeta } from "@/components/briefing/RecommendationMeta";
import { useOutcomes } from "@/components/providers/OutcomeProvider";
import type { RecommendationFields } from "@/lib/briefing/executive-briefing-types";
import { cn } from "@/lib/utils/cn";

type SignalFrameProps = {
  whatChanged: string;
  why: string;
  outcomeId: string;
  whatShouldHappenNext: string;
  recommendation: RecommendationFields;
  eyebrow?: ReactNode;
  title?: string;
  className?: string;
  /** When true, recommendation details start collapsed (Progressive Disclosure). */
  discloseRecommendation?: boolean;
  /** @deprecated Prefer discloseRecommendation — kept for callers. */
  compactMeta?: boolean;
};

export function SignalFrame({
  whatChanged,
  why,
  outcomeId,
  whatShouldHappenNext,
  recommendation,
  eyebrow,
  title,
  className,
  discloseRecommendation = true,
  compactMeta,
}: SignalFrameProps) {
  const { getOutcomeById } = useOutcomes();
  const outcome = getOutcomeById(outcomeId);
  const shouldDisclose = compactMeta === true ? true : discloseRecommendation;
  const [open, setOpen] = useState(!shouldDisclose);

  return (
    <article
      className={cn(
        "border-b border-border py-6 last:border-b-0 first:pt-0 last:pb-0",
        className,
      )}
    >
      {eyebrow ? <div className="mb-3">{eyebrow}</div> : null}
      {title ? (
        <h3 className="font-display text-lg font-semibold tracking-tight text-foreground sm:text-xl">
          {title}
        </h3>
      ) : null}

      <dl className={cn("space-y-4", title && "mt-4")}>
        <div>
          <dt className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
            What changed
          </dt>
          <dd className="mt-1.5 text-sm leading-6 text-foreground sm:text-[15px]">
            {whatChanged}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
            Why it matters
          </dt>
          <dd className="mt-1.5 text-sm leading-6 text-secondary sm:text-[15px]">
            {why}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
            Outcome
          </dt>
          <dd className="mt-1.5 text-sm leading-6 text-foreground">
            {outcome ? (
              <Link
                href={`/outcomes/${outcome.id}`}
                className="font-medium underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {outcome.name}
              </Link>
            ) : (
              "Strategic outcome"
            )}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
            What you should do
          </dt>
          <dd className="mt-1.5 text-sm font-medium leading-6 text-foreground sm:text-[15px]">
            {whatShouldHappenNext}
          </dd>
        </div>
      </dl>

      {shouldDisclose ? (
        <div className="mt-5">
          <button
            type="button"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
            className="text-sm font-medium text-secondary underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {open ? "Hide recommendation detail" : "Chief of Staff recommendation"}
          </button>
          {open ? (
            <RecommendationMeta
              recommendation={recommendation}
              compact
              className="mt-4"
            />
          ) : null}
        </div>
      ) : (
        <RecommendationMeta
          recommendation={recommendation}
          compact
          className="mt-5"
        />
      )}
    </article>
  );
}
