"use client";

import { AttentionLevel } from "@/components/briefing/lead-judgement/AttentionLevel";
import { AttentionTally } from "@/components/briefing/lead-judgement/AttentionTally";
import { ReadinessIndicator } from "@/components/briefing/lead-judgement/ReadinessIndicator";
import { ReviewTimeEstimate } from "@/components/briefing/lead-judgement/ReviewTimeEstimate";
import { useExecutiveBriefing } from "@/components/providers/ExecutiveBriefingProvider";
import { useIntent } from "@/components/providers/IntentProvider";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";

function formatAsOf(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

/**
 * Lead Judgement — opening of the continuous morning Briefing.
 * Executive Summary follows as the next chapter.
 */
export function LeadJudgementSection() {
  const { briefing, boardMode } = useExecutiveBriefing();
  const { context } = useIntent();
  const lead = briefing.leadJudgement;

  return (
    <section
      id="lead-judgement"
      aria-labelledby="lead-judgement-greeting"
      className={cn(
        "eos-lead-judgement pb-4 pt-2",
        boardMode &&
          "rounded-[var(--eos-radius-lg)] bg-briefing px-4 py-10 text-[var(--eos-briefing-text)] sm:px-8 sm:py-12",
      )}
    >
      <div className="eos-reveal eos-reveal-delay-0">
        <p
          className={cn(
            "text-[11px] font-medium uppercase tracking-[0.18em]",
            boardMode ? "text-[var(--eos-briefing-text)]/55" : "text-muted",
          )}
        >
          Lead judgement
        </p>
        <h2
          id="lead-judgement-greeting"
          className={cn(
            "mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl sm:leading-[1.1]",
            boardMode
              ? "text-[var(--eos-briefing-text)]"
              : "text-foreground",
          )}
        >
          {lead.greeting}
        </h2>
        <p
          className={cn(
            "mt-3 text-sm",
            boardMode ? "text-[var(--eos-briefing-text)]/55" : "text-muted",
          )}
        >
          As of {formatAsOf(lead.asOf)}
        </p>
        <p
          className={cn(
            "mt-5 max-w-2xl text-sm leading-6",
            boardMode
              ? "text-[var(--eos-briefing-text)]/70"
              : "text-secondary",
          )}
        >
          Intent · {context.title}
          {" · "}
          <Link
            href="/intent"
            className="font-medium underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Review
          </Link>
        </p>
      </div>

      <div className="eos-reveal eos-reveal-delay-1 mt-10 sm:mt-12">
        <AttentionTally
          items={lead.attentionTally}
          framingLine={lead.framingLine}
          boardMode={boardMode}
        />
      </div>

      <div className="eos-reveal eos-reveal-delay-2 mt-12 sm:mt-14">
        <ReviewTimeEstimate
          minutes={lead.reviewMinutes}
          boardMode={boardMode}
        />
      </div>

      <div className="eos-reveal eos-reveal-delay-3 mt-14 grid gap-12 sm:mt-16 lg:grid-cols-2 lg:gap-16">
        <AttentionLevel
          band={lead.attentionBand}
          explanation={lead.attentionBandWhy}
          boardMode={boardMode}
        />
        <ReadinessIndicator
          readiness={lead.readiness}
          label={lead.readinessLabel}
          why={lead.readinessWhy}
          boardMode={boardMode}
        />
      </div>
    </section>
  );
}

/** @deprecated Prefer LeadJudgementSection */
export { LeadJudgementSection as ExecutiveSummarySection };
