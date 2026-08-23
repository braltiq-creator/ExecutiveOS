"use client";

import { DecisionLoopAck } from "@/components/briefing/DecisionLoopAck";
import { ExecutiveSummaryChapter } from "@/components/briefing/ExecutiveSummaryChapter";
import { LeadJudgementSection } from "@/components/briefing/LeadJudgementSection";
import { OutcomeHealthSection } from "@/components/briefing/OutcomeHealthSection";
import { PriorityDecisionsSection } from "@/components/briefing/PriorityDecisionsSection";
import { RecommendedActionsSection } from "@/components/briefing/RecommendedActionsSection";
import { TopInsightsSection } from "@/components/briefing/TopInsightsSection";
import { useBriefingLayoutSync } from "@/components/briefing/useBriefingLayoutSync";
import { Button } from "@/components/ui/button";
import { useExecutiveBriefing } from "@/components/providers/ExecutiveBriefingProvider";
import { cn } from "@/lib/utils/cn";

/**
 * Continuous Executive Morning Briefing.
 * One narrative — Lead Judgement through Recommended Actions.
 */
export function ExecutiveBriefing() {
  useBriefingLayoutSync();
  const { boardMode, setBoardMode, layoutMode } = useExecutiveBriefing();
  const isBoard = layoutMode === "board" || boardMode;

  return (
    <div
      className={cn(
        "mx-auto max-w-3xl pb-16",
        isBoard && "max-w-4xl",
      )}
    >
      <div className="mb-2 flex justify-end sm:mb-4">
        <Button
          type="button"
          variant={boardMode ? "primary" : "ghost"}
          size="sm"
          aria-pressed={boardMode}
          onClick={() => setBoardMode(!boardMode)}
        >
          {boardMode ? "Exit Board Mode" : "Board Mode"}
        </Button>
      </div>

      <DecisionLoopAck />

      <article className="divide-y divide-border/60">
        <LeadJudgementSection />
        <ExecutiveSummaryChapter />
        <OutcomeHealthSection />
        <PriorityDecisionsSection />
        <TopInsightsSection />
        <RecommendedActionsSection />
      </article>
    </div>
  );
}
