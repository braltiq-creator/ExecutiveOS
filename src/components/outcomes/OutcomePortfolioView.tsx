"use client";

import { useEffect, useState } from "react";
import { OutcomeCard } from "@/components/outcomes/OutcomeCard";
import { Button } from "@/components/ui/button";
import { useOutcomes } from "@/components/providers/OutcomeProvider";
import { cn } from "@/lib/utils/cn";

type LayoutMode = "desktop" | "laptop" | "tablet" | "mobile" | "board";

function resolveMode(width: number, boardMode: boolean): LayoutMode {
  if (boardMode) return "board";
  if (width < 640) return "mobile";
  if (width < 1024) return "tablet";
  if (width < 1280) return "laptop";
  return "desktop";
}

export function OutcomePortfolioView() {
  const { portfolio } = useOutcomes();
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
        layoutMode === "board" && "mx-auto max-w-5xl space-y-10",
      )}
    >
      <div className="flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted">
            Outcome Engine
          </p>
          <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Outcome portfolio
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-secondary">
            {portfolio.statusLabel}. Layout: {layoutMode}.
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

      <div
        className={cn(
          "rounded-[var(--eos-radius-xl)] border border-border px-5 py-5",
          layoutMode === "board"
            ? "bg-briefing text-[var(--eos-briefing-text)]"
            : "bg-surface",
        )}
      >
        <p
          className={cn(
            "text-[11px] font-medium uppercase tracking-[0.14em]",
            layoutMode === "board"
              ? "text-[var(--eos-briefing-text)]/60"
              : "text-muted",
          )}
        >
          Portfolio health
        </p>
        <p
          className={cn(
            "mt-1 font-mono text-4xl font-semibold tabular-nums",
            layoutMode === "board"
              ? "text-[var(--eos-briefing-text)]"
              : "text-foreground",
          )}
        >
          {portfolio.overallScore}
          <span className="text-xl opacity-70">/100</span>
        </p>
        <p
          className={cn(
            "mt-2 text-sm",
            layoutMode === "board"
              ? "text-[var(--eos-briefing-text)]/80"
              : "text-secondary",
          )}
        >
          Refreshed{" "}
          {new Intl.DateTimeFormat(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
          }).format(new Date(portfolio.refreshedAt))}
        </p>
      </div>

      <ul
        className={cn(
          "grid gap-4",
          layoutMode === "mobile" && "grid-cols-1",
          layoutMode === "tablet" && "grid-cols-1",
          (layoutMode === "laptop" || layoutMode === "desktop") &&
            "md:grid-cols-2",
          layoutMode === "board" && "grid-cols-1 gap-6",
        )}
      >
        {portfolio.outcomes.map((outcome) => (
          <li key={outcome.id}>
            <OutcomeCard outcome={outcome} />
          </li>
        ))}
      </ul>
    </div>
  );
}
