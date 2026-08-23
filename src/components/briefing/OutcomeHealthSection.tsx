"use client";

import Link from "next/link";
import { BriefingChapter } from "@/components/briefing/BriefingChapter";
import { useMorningNarrative } from "@/components/providers/MorningNarrativeProvider";
import { cn } from "@/lib/utils/cn";

const directionLabel = {
  improved: "Improved",
  declined: "Declined",
  stable: "Moved",
} as const;

/**
 * Outcome Health as strategic overnight context — not a score dashboard.
 */
export function OutcomeHealthSection() {
  const narrative = useMorningNarrative();
  const { outcomeMovements, transitionToDecisions } = narrative;

  const declined = outcomeMovements.filter((item) => item.direction === "declined");
  const improved = outcomeMovements.filter((item) => item.direction === "improved");

  return (
    <BriefingChapter
      id="outcome-health"
      overline="Outcome health"
      title="What moved overnight"
    >
      {outcomeMovements.length === 0 ? (
        <p className="max-w-2xl text-base leading-7 text-secondary sm:text-[17px]">
          No meaningful Outcome movement overnight. The portfolio held.
        </p>
      ) : (
        <div className="max-w-2xl space-y-10">
          {(declined.length > 0 || improved.length > 0) && (
            <p className="text-base leading-7 text-secondary sm:text-[17px]">
              {declined.length > 0 ? (
                <>
                  Declined:{" "}
                  <span className="text-foreground">
                    {declined.map((item) => item.outcomeName).join("; ")}
                  </span>
                  {improved.length > 0 ? ". " : "."}
                </>
              ) : null}
              {improved.length > 0 ? (
                <>
                  Improved:{" "}
                  <span className="text-foreground">
                    {improved.map((item) => item.outcomeName).join("; ")}
                  </span>
                  .
                </>
              ) : null}
            </p>
          )}

          <ul className="space-y-10">
            {outcomeMovements.map((item) => (
              <li key={item.id}>
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
                  {directionLabel[item.direction]} · {item.changeLabel}
                </p>
                <h3 className="mt-2 font-display text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                  <Link
                    href={`/outcomes/${item.outcomeId}`}
                    className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {item.outcomeName}
                  </Link>
                </h3>
                <p className="mt-3 text-base leading-7 text-secondary sm:text-[17px]">
                  {item.why}
                </p>
                {item.overnightNote ? (
                  <p
                    className={cn(
                      "mt-3 text-base leading-7 text-foreground/90 sm:text-[17px]",
                    )}
                  >
                    Overnight: {item.overnightNote}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-12 max-w-2xl text-base leading-7 text-secondary sm:text-[17px]">
        {transitionToDecisions}
      </p>
    </BriefingChapter>
  );
}
