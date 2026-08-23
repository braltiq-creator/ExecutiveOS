"use client";

import { BriefingChapter } from "@/components/briefing/BriefingChapter";
import { useExecutiveBriefing } from "@/components/providers/ExecutiveBriefingProvider";
import { useMorningNarrative } from "@/components/providers/MorningNarrativeProvider";

/**
 * Executive Summary chapter — CoS prose bridging Lead Judgement into Outcomes.
 */
export function ExecutiveSummaryChapter() {
  const { briefing } = useExecutiveBriefing();
  const narrative = useMorningNarrative();
  const lead = briefing.leadJudgement;

  const sentences = lead.executiveSummary
    .split(/(?<=\.)\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  return (
    <BriefingChapter
      id="executive-summary"
      overline="Executive summary"
      title="The picture before you decide"
    >
      <div className="max-w-2xl space-y-5 text-base leading-8 text-secondary sm:text-[17px] sm:leading-8">
        {sentences.map((sentence) => (
          <p key={sentence} className="text-pretty">
            {sentence}
          </p>
        ))}
      </div>

      <div className="mt-10 max-w-2xl space-y-8">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
            What requires attention
          </p>
          <p className="mt-3 text-base font-medium leading-7 text-foreground sm:text-[17px]">
            {lead.whatRequiresAttention}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
            Why it matters
          </p>
          <p className="mt-3 text-base leading-7 text-secondary sm:text-[17px]">
            {lead.whyItMatters}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
            What can wait
          </p>
          <p className="mt-3 text-base leading-7 text-secondary sm:text-[17px]">
            {lead.canWait}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
            Focus this morning
          </p>
          <p className="mt-3 font-display text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {lead.focusAreas.join(" · ")}
          </p>
        </div>
      </div>

      <p className="mt-12 max-w-2xl text-base leading-7 text-secondary sm:text-[17px]">
        {narrative.transitionToOutcomes}
      </p>
    </BriefingChapter>
  );
}
