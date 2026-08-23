"use client";

import { BriefingChapter } from "@/components/briefing/BriefingChapter";
import { useMorningNarrative } from "@/components/providers/MorningNarrativeProvider";

/**
 * Strategic Insights — observations that help understand the business.
 */
export function TopInsightsSection() {
  const { observations, transitionToActions } = useMorningNarrative();

  return (
    <BriefingChapter
      id="strategic-insights"
      overline="Strategic insights"
      title="How to read the business this morning"
    >
      {observations.length === 0 ? (
        <p className="max-w-2xl text-base leading-7 text-secondary sm:text-[17px]">
          No further observations beyond the summary above.
        </p>
      ) : (
        <ul className="max-w-2xl space-y-10">
          {observations.map((item) => (
            <li key={item.id}>
              <p className="text-base font-medium leading-7 text-foreground sm:text-[17px] sm:leading-8">
                {item.observation}
              </p>
              <p className="mt-3 text-base leading-7 text-secondary sm:text-[17px]">
                {item.implication}
              </p>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-12 max-w-2xl text-base leading-7 text-secondary sm:text-[17px]">
        {transitionToActions}
      </p>
    </BriefingChapter>
  );
}
