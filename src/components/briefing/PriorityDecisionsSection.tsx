"use client";

import Link from "next/link";
import { BriefingChapter } from "@/components/briefing/BriefingChapter";
import { useMorningNarrative } from "@/components/providers/MorningNarrativeProvider";

/**
 * Priority Decisions — only the few that require executive judgement.
 */
export function PriorityDecisionsSection() {
  const { priorityDecisions, transitionToInsights } = useMorningNarrative();

  return (
    <BriefingChapter
      id="priority-decisions"
      overline="Priority decisions"
      title={
        priorityDecisions.length === 0
          ? "No decision requires you this morning"
          : "Judgement only you can make"
      }
    >
      {priorityDecisions.length === 0 ? (
        <p className="max-w-2xl text-base leading-7 text-secondary sm:text-[17px]">
          Silence is correct. Return to the register when something consequential
          arrives.
        </p>
      ) : (
        <ol className="max-w-2xl space-y-12">
          {priorityDecisions.map((decision, index) => (
            <li key={decision.id}>
              <p className="font-mono text-xs text-muted">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-2 font-display text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                <Link
                  href={decision.href}
                  className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {decision.title}
                </Link>
              </h3>
              <div className="mt-5 space-y-4">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
                    Why now
                  </p>
                  <p className="mt-2 text-base leading-7 text-secondary sm:text-[17px]">
                    {decision.whyNow}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
                    Expected impact
                  </p>
                  <p className="mt-2 text-base leading-7 text-secondary sm:text-[17px]">
                    {decision.expectedImpact}
                  </p>
                </div>
                <p className="text-sm text-muted">
                  Estimated decision time · {decision.estimatedMinutes} minutes
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}

      <p className="mt-12 max-w-2xl text-base leading-7 text-secondary sm:text-[17px]">
        {transitionToInsights}
      </p>
    </BriefingChapter>
  );
}
