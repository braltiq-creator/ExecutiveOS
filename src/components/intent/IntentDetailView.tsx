"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { IntentAlignmentBadge } from "@/components/intent/IntentAlignmentBadge";
import { Button } from "@/components/ui/button";
import { useIntent } from "@/components/providers/IntentProvider";
import { cn } from "@/lib/utils/cn";

type LayoutMode = "desktop" | "laptop" | "tablet" | "mobile" | "board";

function resolveMode(width: number, boardMode: boolean): LayoutMode {
  if (boardMode) return "board";
  if (width < 640) return "mobile";
  if (width < 1024) return "tablet";
  if (width < 1280) return "laptop";
  return "desktop";
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24">
      <h2
        id={`${id}-title`}
        className="font-display text-xl font-semibold tracking-tight text-foreground"
      >
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function IntentDetailView() {
  const {
    intent,
    intentHistory,
    focusOutcomes,
    watchingOutcomes,
    supportingOutcomes,
    nonFocusOutcomes,
  } = useIntent();
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

  return (
    <div
      className={cn(
        "space-y-8",
        layoutMode === "board" && "mx-auto max-w-4xl space-y-10 md:max-w-5xl",
      )}
    >
      <header className="flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted">
            Executive Intent · Utility
          </p>
          <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {intent.title}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-secondary sm:text-base">
            {intent.narrative}
          </p>
          <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <div>
              <dt className="text-[11px] uppercase tracking-[0.14em] text-muted">
                Horizon
              </dt>
              <dd className="mt-1 text-foreground">{intent.horizon}</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-[0.14em] text-muted">
                Review date
              </dt>
              <dd className="mt-1 font-mono text-foreground">
                {intent.reviewDate}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-[0.14em] text-muted">
                Review cadence
              </dt>
              <dd className="mt-1 text-foreground">{intent.reviewCadence}</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-[0.14em] text-muted">
                Priority
              </dt>
              <dd className="mt-1 capitalize text-foreground">
                {intent.priority}
              </dd>
            </div>
          </dl>
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
      </header>

      <nav aria-label="Intent sections" className="overflow-x-auto">
        <ul className="flex min-w-max gap-2 pb-1">
          {(
            [
              ["#narrative", "Narrative"],
              ["#focus", "Focus"],
              ["#watching", "Watching"],
              ["#constraints", "Constraints"],
              ["#signals", "Success signals"],
              ["#history", "History"],
            ] as const
          ).map(([href, label]) => (
            <li key={href}>
              <a
                href={href}
                className="inline-flex min-h-11 items-center rounded-[var(--eos-radius-md)] border border-border bg-surface px-3 py-2 text-sm text-secondary transition-colors hover:border-border-strong hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <Section id="narrative" title="Strategic narrative">
        <p className="max-w-3xl text-sm leading-7 text-secondary sm:text-base">
          {intent.narrative}
        </p>
      </Section>

      <Section id="focus" title="Focus outcomes">
        <OutcomeRefList items={focusOutcomes} empty="No focus outcomes." />
      </Section>

      <Section id="watching" title="Watching outcomes">
        <OutcomeRefList items={watchingOutcomes} empty="No watching outcomes." />
        {!boardMode && supportingOutcomes.length > 0 ? (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-foreground">
              Supporting (portfolio)
            </h3>
            <OutcomeRefList
              items={supportingOutcomes}
              empty="None"
              className="mt-3"
            />
          </div>
        ) : null}
        {!boardMode && nonFocusOutcomes.length > 0 ? (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-foreground">Non-focus</h3>
            <OutcomeRefList
              items={nonFocusOutcomes}
              empty="None"
              className="mt-3"
            />
          </div>
        ) : null}
      </Section>

      <Section id="constraints" title="Strategic constraints">
        <ul className="space-y-3">
          {intent.constraints.map((item) => (
            <li
              key={item.id}
              className="rounded-[var(--eos-radius-md)] border border-border bg-surface px-4 py-3"
            >
              <p className="font-medium text-foreground">{item.label}</p>
              <p className="mt-1 text-sm leading-6 text-secondary">
                {item.explanation}
              </p>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="signals" title="Success signals">
        <ul className="space-y-3">
          {intent.successSignals.map((signal) => (
            <li
              key={signal.id}
              className="rounded-[var(--eos-radius-md)] border border-border bg-surface px-4 py-3"
            >
              <p className="font-medium text-foreground">{signal.label}</p>
              <p className="mt-1 text-sm leading-6 text-secondary">
                {signal.narrative}
              </p>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="history" title="Intent history">
        <ol className="space-y-3">
          {intent.history.map((entry) => (
            <li
              key={entry.id}
              className="flex gap-4 rounded-[var(--eos-radius-md)] border border-border bg-surface-inset/50 px-4 py-3"
            >
              <time
                dateTime={entry.at}
                className="w-36 shrink-0 font-mono text-xs text-muted"
              >
                {entry.at.slice(0, 10)}
              </time>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {entry.title}
                </p>
                <p className="mt-1 text-sm text-secondary">{entry.detail}</p>
              </div>
            </li>
          ))}
        </ol>

        {intentHistory.length > 0 ? (
          <div className="mt-8">
            <h3 className="text-sm font-medium text-foreground">
              Prior Intent records
            </h3>
            <ul className="mt-3 space-y-3">
              {intentHistory.map((prior) => (
                <li
                  key={prior.id}
                  className="rounded-[var(--eos-radius-md)] border border-border px-4 py-3"
                >
                  <p className="text-sm font-medium text-foreground">
                    {prior.title}
                  </p>
                  <p className="mt-1 text-sm text-secondary">{prior.horizon}</p>
                  <p className="mt-2 text-sm leading-6 text-secondary">
                    {prior.narrative}
                  </p>
                  <p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-muted">
                    Status: {prior.status}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </Section>
    </div>
  );
}

function OutcomeRefList({
  items,
  empty,
  className,
}: {
  items: Array<{
    id: string;
    name: string;
    alignment: "focused" | "watching" | "supporting" | "non_focus";
    healthScore: number;
  }>;
  empty: string;
  className?: string;
}) {
  if (items.length === 0) {
    return <p className={cn("text-sm text-secondary", className)}>{empty}</p>;
  }

  return (
    <ul className={cn("space-y-2", className)}>
      {items.map((item) => (
        <li
          key={item.id}
          className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--eos-radius-md)] border border-border bg-surface px-4 py-3"
        >
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <IntentAlignmentBadge alignment={item.alignment} />
            <Link
              href={`/outcomes/${item.id}`}
              className="text-sm font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {item.name}
            </Link>
          </div>
          <span className="font-mono text-sm tabular-nums text-secondary">
            {item.healthScore}/100
          </span>
        </li>
      ))}
    </ul>
  );
}
