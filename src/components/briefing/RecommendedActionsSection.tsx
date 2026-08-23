"use client";

import Link from "next/link";
import { BriefingChapter } from "@/components/briefing/BriefingChapter";
import { useMorningNarrative } from "@/components/providers/MorningNarrativeProvider";

/**
 * Recommended Actions — clear stances with reasons. Executive still decides.
 */
export function RecommendedActionsSection() {
  const { recommendations, closingLine } = useMorningNarrative();

  return (
    <BriefingChapter
      id="recommended-actions"
      overline="Recommended actions"
      title="What preparation suggests"
    >
      <ul className="max-w-2xl space-y-10">
        {recommendations.map((item) => (
          <li key={item.id}>
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
              {item.stanceLabel}
            </p>
            <h3 className="mt-2 font-display text-lg font-semibold tracking-tight text-foreground sm:text-xl">
              {item.href ? (
                <Link
                  href={item.href}
                  className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {item.title}
                </Link>
              ) : (
                item.title
              )}
            </h3>
            <p className="mt-3 text-base leading-7 text-secondary sm:text-[17px]">
              {item.reason}
            </p>
          </li>
        ))}
      </ul>

      <p className="mt-14 max-w-2xl font-display text-xl font-semibold tracking-tight text-foreground sm:text-2xl sm:leading-snug">
        {closingLine}
      </p>
    </BriefingChapter>
  );
}
