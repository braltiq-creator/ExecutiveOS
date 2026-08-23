"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  OutcomeBlockersSection,
  OutcomeContributingDecisionsSection,
  OutcomeContributingInsightsSection,
  OutcomeContributorsSection,
  OutcomeForecastSection,
  OutcomeHistorySection,
  OutcomePendingActionsSection,
  OutcomeRecommendationsSection,
  OutcomeRelationshipsSection,
  OutcomeTimelineSection,
} from "@/components/outcomes/OutcomeDetailSections";
import { IntentAlignmentBadge } from "@/components/intent/IntentAlignmentBadge";
import { OutcomeMetricStrip } from "@/components/outcomes/OutcomeMetricStrip";
import { OutcomeStatusBadge } from "@/components/outcomes/OutcomeStatusBadge";
import { Button } from "@/components/ui/button";
import { useIntent } from "@/components/providers/IntentProvider";
import { useOutcome } from "@/components/providers/OutcomeProvider";
import { cn } from "@/lib/utils/cn";

type LayoutMode = "desktop" | "laptop" | "tablet" | "mobile" | "board";

function resolveMode(width: number, boardMode: boolean): LayoutMode {
  if (boardMode) return "board";
  if (width < 640) return "mobile";
  if (width < 1024) return "tablet";
  if (width < 1280) return "laptop";
  return "desktop";
}

const SECTION_LINKS = [
  { href: "#overview", label: "Overview" },
  { href: "#decisions", label: "Decisions" },
  { href: "#insights", label: "Insights" },
  { href: "#actions", label: "Actions" },
  { href: "#timeline", label: "Timeline" },
  { href: "#contributors", label: "Contributors" },
  { href: "#blockers", label: "Blockers" },
  { href: "#recommendations", label: "Recommendations" },
  { href: "#forecast", label: "Forecast" },
  { href: "#history", label: "History" },
  { href: "#relationships", label: "Relationships" },
] as const;

export function OutcomeDetailView({ outcomeId }: { outcomeId: string }) {
  const outcome = useOutcome(outcomeId);
  const { getOutcomeAlignment, intent } = useIntent();
  const intentAlignment = getOutcomeAlignment(outcome.id);
  const [boardMode, setBoardMode] = useState(false);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("desktop");

  useEffect(() => {
    function update() {
      setLayoutMode(resolveMode(window.innerWidth, boardMode));
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [boardMode]);

  const isSplit =
    layoutMode === "laptop" || layoutMode === "desktop";

  return (
    <div
      className={cn(
        "space-y-8",
        layoutMode === "board" && "mx-auto max-w-4xl space-y-10 md:max-w-5xl",
      )}
    >
      <div className="flex flex-col gap-3">
        <Link
          href="/outcomes"
          className="w-fit text-sm text-secondary underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          ← Outcome portfolio
        </Link>
        <div className="flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <OutcomeStatusBadge status={outcome.status} />
              <IntentAlignmentBadge alignment={intentAlignment} />
              <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted">
                Outcome Engine · {layoutMode}
              </span>
            </div>
            <h1 className="mt-3 font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {outcome.name}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-secondary">
              {outcome.description}
            </p>
            <p className="mt-3 text-sm text-secondary">
              Strategic Intent:{" "}
              <Link
                href="/intent"
                className="font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {intent.title}
              </Link>
            </p>
          </div>
          <Button
            type="button"
            variant={boardMode ? "primary" : "secondary"}
            size="sm"
            aria-pressed={boardMode}
            onClick={() => setBoardMode((value) => !value)}
          >
            {boardMode ? "Exit Board Mode" : "Board Mode"}
          </Button>
        </div>
      </div>

      <nav aria-label="Outcome sections" className="overflow-x-auto">
        <ul className="flex min-w-max gap-2 pb-1">
          {SECTION_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="inline-flex min-h-11 items-center rounded-[var(--eos-radius-md)] border border-border bg-surface px-3 py-2 text-sm text-secondary transition-colors hover:border-border-strong hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <section
        id="overview"
        aria-labelledby="overview-title"
        className="space-y-5"
      >
        <h2 id="overview-title" className="sr-only">
          Outcome overview
        </h2>
        <OutcomeMetricStrip outcome={outcome} />
        <dl className="grid gap-4 rounded-[var(--eos-radius-lg)] border border-border bg-surface p-5 sm:grid-cols-2">
          <div>
            <dt className="text-[11px] uppercase tracking-[0.14em] text-muted">
              Owner
            </dt>
            <dd className="mt-1 text-sm text-foreground">{outcome.owner}</dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-[0.14em] text-muted">
              Target date
            </dt>
            <dd className="mt-1 font-mono text-sm text-foreground">
              {outcome.targetDate}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-[11px] uppercase tracking-[0.14em] text-muted">
              Business impact
            </dt>
            <dd className="mt-1 text-sm leading-6 text-secondary">
              {outcome.businessImpact}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-[11px] uppercase tracking-[0.14em] text-muted">
              Expected trajectory
            </dt>
            <dd className="mt-1 text-sm leading-6 text-secondary">
              {outcome.expectedTrajectory.summary}
            </dd>
          </div>
        </dl>
      </section>

      <div
        className={cn(
          "space-y-10",
          isSplit &&
            "lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(280px,34%)] lg:items-start lg:gap-8",
        )}
      >
        <div className="space-y-10">
          <OutcomeContributingDecisionsSection outcome={outcome} />
          <OutcomeContributingInsightsSection outcome={outcome} />
          <OutcomePendingActionsSection outcome={outcome} />
          <OutcomeTimelineSection outcome={outcome} />
          <OutcomeRecommendationsSection outcome={outcome} />
        </div>
        <aside className="space-y-10 lg:sticky lg:top-6">
          <OutcomeContributorsSection outcome={outcome} />
          <OutcomeBlockersSection outcome={outcome} />
          <OutcomeForecastSection outcome={outcome} />
          <OutcomeHistorySection outcome={outcome} />
          <OutcomeRelationshipsSection outcome={outcome} />
        </aside>
      </div>
    </div>
  );
}
