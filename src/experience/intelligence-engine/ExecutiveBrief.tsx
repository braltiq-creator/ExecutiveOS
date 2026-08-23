import { Reveal } from "@/experience/motion/Reveal";
import type { CommandBrief } from "@/experience/intelligence-engine/types";
import type { CouncilObservation } from "@/experience/executive-council/types";
import type { RhythmAwareness } from "@/experience/executive-rhythm/types";
import type { SnapshotCommercialBriefView } from "@/experience/mission-control/snapshot-integrity";
import { CouncilProactiveObservations } from "@/experience/executive-council/CouncilDiscussion";
import { RhythmBriefCadence } from "@/experience/executive-rhythm/RhythmPanels";
import { EXECUTIVE_ICONS } from "@/experience/icons";
import { ExsOpenLink, ExsSectionHeader, ExsTrend } from "@/experience/exs";
import { cn } from "@/lib/utils/cn";

type Props = {
  brief: CommandBrief;
  /** Highest-priority Council observations — Phase 44 agency. */
  observations?: CouncilObservation[];
  /** Current operating cadence — Phase 45 rhythm. */
  rhythm?: RhythmAwareness | null;
  /**
   * Phase 57F — active Executive Snapshot Commercial Brief.
   * When set, blocks rhythm / seeded Meeting Pack templates.
   */
  commercialBrief?: SnapshotCommercialBriefView | null;
};

/**
 * Compact overnight narrative for Mission Control (~120–140px).
 * Real snapshot commercial brief takes priority; then rhythm; then Council.
 */
export function ExecutiveBriefPanel({
  brief,
  observations,
  rhythm,
  commercialBrief,
}: Props) {
  const proactive = (observations ?? []).slice(0, 2);

  return (
    <Reveal delay={2}>
      <section
        aria-label="Executive Brief"
        className="mc-brief max-h-[140px] shrink-0 overflow-hidden rounded-[var(--exs-radius)] border border-[var(--exs-border)] bg-[var(--exs-surface)] px-3 py-2 shadow-[var(--exs-shadow-1)]"
        data-executive-brief="true"
        data-rhythm={commercialBrief ? "snapshot" : (rhythm?.currentRhythmId ?? "none")}
        data-meeting-pack={
          commercialBrief
            ? commercialBrief.meetingPackAvailable
              ? "ready"
              : "not-prepared"
            : undefined
        }
      >
        {commercialBrief ? (
          <CommercialSnapshotBrief view={commercialBrief} />
        ) : rhythm ? (
          <RhythmBriefCadence awareness={rhythm} />
        ) : proactive.length > 0 ? (
          <CouncilProactiveObservations
            observations={proactive}
            judgementCount={brief.judgementCount}
          />
        ) : (
          <LegacyBriefCells brief={brief} />
        )}
      </section>
    </Reveal>
  );
}

function CommercialSnapshotBrief({
  view,
}: {
  view: SnapshotCommercialBriefView;
}) {
  return (
    <div data-commercial-brief="true" className="space-y-1">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <ExsSectionHeader
          label="Executive Brief"
          icon={EXECUTIVE_ICONS.pulse}
          className="mb-0"
        />
        <p className="exs-label normal-case text-[var(--exs-text-muted)]">
          {view.meetingPackLabel}
        </p>
      </div>
      <p className="exs-title text-[length:0.9rem]">{view.title}</p>
      <p className="exs-body line-clamp-2 text-[length:0.78rem]">
        {view.judgement}
      </p>
      {view.evidence[0] ? (
        <p className="exs-label line-clamp-1 normal-case">
          Evidence · {view.evidence[0]}
        </p>
      ) : (
        <p className="exs-label normal-case">{view.dataConfidence}</p>
      )}
    </div>
  );
}

function LegacyBriefCells({ brief }: { brief: CommandBrief }) {
  const areas =
    brief.judgementCount === 1 ? "1 Area" : `${brief.judgementCount} Areas`;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <ExsSectionHeader
          label="Executive Brief"
          icon={EXECUTIVE_ICONS.pulse}
          className="mb-0"
        />
        <p className="exs-title text-[length:0.85rem]">
          Today&apos;s judgement required in{" "}
          <span className="tabular-nums">{areas}</span>
        </p>
      </div>
      <div className="mt-1.5 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-5">
        <BriefCell
          label="Organisation Health"
          value={String(brief.healthValue)}
          meta={brief.healthStatus}
          trend={brief.healthTrend}
        />
        <BriefCell label="Commercial" value={brief.commercialLabel} />
        <BriefCell
          label="Risk"
          value={brief.riskLabel}
          attention={brief.riskLabel.includes("Increased")}
        />
        <BriefCell
          label="Executive Intelligence"
          value={String(brief.intelligence)}
          meta={`Confidence ${brief.confidence}%`}
        />
        <div className="col-span-2 flex items-end justify-end sm:col-span-4 lg:col-span-1">
          <ExsOpenLink href={brief.href}>Open Intelligence →</ExsOpenLink>
        </div>
      </div>
    </>
  );
}

function BriefCell({
  label,
  value,
  meta,
  trend,
  attention,
}: {
  label: string;
  value: string;
  meta?: string;
  trend?: "up" | "down" | "flat";
  attention?: boolean;
}) {
  return (
    <div className="min-w-0">
      <p className="exs-label truncate">{label}</p>
      <p
        className={cn(
          "mt-0.5 flex items-center gap-1 truncate exs-title text-[length:0.9rem]",
          attention && "exs-trend-attention",
        )}
      >
        {trend ? <ExsTrend trend={trend} /> : null}
        <span className="truncate">{value}</span>
      </p>
      {meta ? (
        <p className="exs-label mt-0.5 truncate normal-case">{meta}</p>
      ) : null}
    </div>
  );
}
