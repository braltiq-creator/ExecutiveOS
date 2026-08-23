"use client";

import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { ds } from "@/design-system/tokens";
import { EXDS_TONE_VAR } from "../colour";
import type { ExdsSemanticTone, ExdsTimelineEvent, ExdsTimelineStage } from "../types";

const STAGE_LABEL: Record<ExdsTimelineStage, string> = {
  observation: "Observation",
  analysis: "Analysis",
  council: "Council discussion",
  recommendation: "Recommendation",
  decision: "Decision",
  outcome: "Outcome",
  learning: "Learning",
};

const STAGE_TONE: Record<ExdsTimelineStage, ExdsSemanticTone> = {
  observation: "intelligence",
  analysis: "intelligence",
  council: "strategy",
  recommendation: "watching",
  decision: "improving",
  outcome: "improving",
  learning: "historical",
};

type ExecutiveTimelineProps = {
  title?: string;
  events: ExdsTimelineEvent[];
  className?: string;
};

/**
 * Executive Timeline — judgement lifecycle, not an activity feed.
 * Everything remains clickable into existing surfaces.
 */
export function ExecutiveTimeline({
  title = "Executive timeline",
  events,
  className,
}: ExecutiveTimelineProps) {
  return (
    <section
      className={cn(
        "rounded-[var(--exds-card-radius)] border border-[var(--exds-card-border)]",
        "bg-[var(--exds-card-bg)] p-[var(--eos-space-lg)]",
        className,
      )}
    >
      <p className={ds.type.label}>{title}</p>
      <ol className="mt-[var(--eos-space-md)] space-y-0">
        {events.map((event, index) => {
          const tone = event.tone ?? STAGE_TONE[event.stage];
          const body = (
            <>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="eos-type-caption" style={{ color: EXDS_TONE_VAR[tone] }}>
                  {STAGE_LABEL[event.stage]}
                </p>
                {event.timestamp ? (
                  <time className="eos-type-caption tabular-nums">
                    {event.timestamp}
                  </time>
                ) : null}
              </div>
              <p className="eos-type-subheading mt-1 text-[var(--eos-color-text)]">
                {event.title}
              </p>
              {event.summary ? (
                <p className="eos-type-supporting mt-1">{event.summary}</p>
              ) : null}
            </>
          );

          return (
            <li key={event.id} className="relative flex gap-3 pb-5 last:pb-0">
              <div className="flex w-3 shrink-0 flex-col items-center">
                <span
                  className="mt-1.5 h-2.5 w-2.5 rounded-full"
                  style={{ background: EXDS_TONE_VAR[tone] }}
                  aria-hidden="true"
                />
                {index < events.length - 1 ? (
                  <span
                    className="mt-1 w-px flex-1 bg-[var(--eos-color-divider)]"
                    aria-hidden="true"
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                {event.href ? (
                  <Link
                    href={event.href}
                    className="exds-focus-ring exds-interactive block rounded-[var(--eos-radius-sm)] -mx-1 px-1"
                  >
                    {body}
                  </Link>
                ) : (
                  body
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
