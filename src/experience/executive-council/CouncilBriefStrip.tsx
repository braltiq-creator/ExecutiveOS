import { EXECUTIVE_ICONS } from "@/experience/icons";
import { ExsOpenLink, ExsSectionHeader } from "@/experience/exs";
import { Reveal } from "@/experience/motion/Reveal";
import type { CouncilBrief } from "@/experience/executive-council/types";
import { cn } from "@/lib/utils/cn";

type Props = {
  brief: CouncilBrief;
  decisionTitle: string;
  outcomeName: string;
  href?: string;
  compact?: boolean;
};

/**
 * Compact Council strip for Mission Control and workspace headers.
 * Full perspectives live in Decision / dedicated panels.
 */
export function CouncilBriefStrip({
  brief,
  decisionTitle,
  outcomeName,
  href = "/decisions?from=priority#executive-council",
  compact = false,
}: Props) {
  return (
    <Reveal delay={compact ? 2 : 1}>
      <section
        aria-label="Executive Council Brief"
        className={cn(
          "rounded-[var(--exs-radius)] border border-[var(--exs-border)] bg-[var(--exs-surface)] shadow-[var(--exs-shadow-1)]",
          compact ? "px-3 py-1.5" : "px-3 py-2.5",
        )}
        data-council-brief="true"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <ExsSectionHeader
              label="Executive Council"
              icon={EXECUTIVE_ICONS.people_health}
              className="mb-0"
            />
            <p className="exs-title mt-1 truncate text-[length:0.85rem]">
              {brief.headline}
            </p>
            <p className="exs-body mt-0.5 line-clamp-1 text-[length:0.72rem]">
              {brief.agreementLabel}
              {brief.confidence > 0 ? (
                <>
                  <span className="mx-1.5 text-[var(--exs-text-muted)]">·</span>
                  Confidence {brief.confidence}%
                  <span className="mx-1.5 text-[var(--exs-text-muted)]">·</span>
                  Watch {brief.focusRole}
                </>
              ) : null}
              <span className="mx-1.5 text-[var(--exs-text-muted)]">·</span>
              {outcomeName}
            </p>
            {!compact ? (
              <p className="exs-label mt-0.5 truncate normal-case">
                On {decisionTitle}
              </p>
            ) : null}
          </div>
          <ExsOpenLink href={href} className="shrink-0">
            Open Council →
          </ExsOpenLink>
        </div>
      </section>
    </Reveal>
  );
}
