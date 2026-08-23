"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { EngineDecisionStatusBadge } from "@/components/decisions/EngineDecisionStatusBadge";
import { DecisionIntentStrip } from "@/components/intent/DecisionIntentStrip";
import { useDecisions } from "@/components/providers/DecisionProvider";
import {
  ExecutiveBadge,
  ExecutiveButton,
  ExecutiveCard,
  ExecutiveHeading,
  ExecutiveSummary,
  ds,
} from "@/design-system";
import { cn } from "@/lib/utils/cn";

type LayoutMode = "desktop" | "laptop" | "tablet" | "mobile" | "board";

function resolveMode(width: number, boardMode: boolean): LayoutMode {
  if (boardMode) return "board";
  if (width < 640) return "mobile";
  if (width < 1024) return "tablet";
  if (width < 1280) return "laptop";
  return "desktop";
}

export function DecisionQueueView() {
  const { queue, openCount, dueTodayCount } = useDecisions();
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
        ds.spaceY.xl,
        layoutMode === "board" &&
          "mx-auto max-w-5xl space-y-[var(--eos-space-2xl)]",
      )}
    >
      <div
        className={cn(
          "flex flex-col border-b border-[var(--eos-color-divider)]",
          "pb-[var(--eos-space-lg)]",
          "gap-[var(--eos-space-md)] sm:flex-row sm:items-end sm:justify-between",
        )}
      >
        <div>
          <ExecutiveBadge>Decision Intelligence Engine</ExecutiveBadge>
          <ExecutiveHeading
            as="h1"
            size="xl"
            className="mt-[var(--eos-space-sm)] sm:text-[1.85rem]"
          >
            Decision queue
          </ExecutiveHeading>
          <ExecutiveSummary className="mt-[var(--eos-space-sm)]">
            Every decision is linked to strategic outcomes. {openCount} open ·{" "}
            {dueTodayCount} due today. Layout: {layoutMode}.
          </ExecutiveSummary>
        </div>
        <ExecutiveButton
          type="button"
          variant={boardMode ? "primary" : "secondary"}
          size="sm"
          aria-pressed={boardMode}
          onClick={() => setBoardMode((value) => !value)}
        >
          {boardMode ? "Exit Board Mode" : "Board Mode"}
        </ExecutiveButton>
      </div>

      <ul className={ds.spaceY.md}>
        {queue.map((decision) => (
          <li key={decision.id}>
            <ExecutiveCard
              as="div"
              interactive
              className="p-[var(--eos-space-xl)]"
            >
              <div
                className={cn(
                  "flex flex-wrap items-start justify-between",
                  "gap-[var(--eos-space-md)]",
                )}
              >
                <div className="min-w-0">
                  <div
                    className={cn(
                      "flex flex-wrap items-center",
                      "gap-[var(--eos-space-sm)]",
                    )}
                  >
                    <EngineDecisionStatusBadge status={decision.status} />
                    <span className={cn(ds.type.caption, "font-mono")}>
                      {decision.deadline}
                    </span>
                  </div>
                  <ExecutiveHeading
                    as="h2"
                    size="heading"
                    className="mt-[var(--eos-space-md)]"
                  >
                    <Link
                      href={`/decisions/${decision.id}`}
                      className={cn("hover:underline", ds.focusRing)}
                    >
                      {decision.question}
                    </Link>
                  </ExecutiveHeading>
                </div>
                <p className={cn(ds.type.metric, "text-[var(--eos-type-display-l-size)]")}>
                  {decision.confidence}
                  <span className={cn(ds.type.caption, "ml-[var(--eos-space-xs)]")}>
                    %
                  </span>
                </p>
              </div>

              <DecisionIntentStrip
                decision={decision}
                compact
                className="mt-[var(--eos-space-md)]"
              />

              <dl
                className={cn(
                  "mt-[var(--eos-space-md)] grid",
                  "gap-[var(--eos-space-md)] md:grid-cols-2 xl:grid-cols-3",
                )}
              >
                <div>
                  <dt className={ds.type.label}>Outcomes</dt>
                  <dd
                    className={cn(
                      ds.type.supporting,
                      "mt-[var(--eos-space-xs)] text-[var(--eos-color-text-secondary)]",
                    )}
                  >
                    {decision.outcomeNames.join(" · ")}
                  </dd>
                </div>
                <div>
                  <dt className={ds.type.label}>Owner</dt>
                  <dd
                    className={cn(
                      ds.type.supporting,
                      "mt-[var(--eos-space-xs)] text-[var(--eos-color-text-secondary)]",
                    )}
                  >
                    {decision.owner}
                  </dd>
                </div>
                <div>
                  <dt className={ds.type.label}>Cost of delay</dt>
                  <dd
                    className={cn(
                      ds.type.supporting,
                      "mt-[var(--eos-space-xs)] text-[var(--eos-color-text-secondary)]",
                    )}
                  >
                    {decision.costOfDelay}
                  </dd>
                </div>
                <div className="md:col-span-2 xl:col-span-3">
                  <dt className={ds.type.label}>Business impact</dt>
                  <dd
                    className={cn(
                      ds.type.supporting,
                      "mt-[var(--eos-space-xs)] text-[var(--eos-color-text-secondary)]",
                    )}
                  >
                    {decision.businessImpact}
                  </dd>
                </div>
                <div className="md:col-span-2 xl:col-span-3">
                  <dt className={ds.type.label}>Expected outcome impact</dt>
                  <dd
                    className={cn(
                      ds.type.supporting,
                      "mt-[var(--eos-space-xs)] text-[var(--eos-color-text-secondary)]",
                    )}
                  >
                    {decision.expectedOutcomeImpact}
                  </dd>
                </div>
              </dl>

              <div className="mt-[var(--eos-space-md)]">
                <Link
                  href={`/decisions/${decision.id}`}
                  className={cn(
                    ds.type.body,
                    "inline-flex min-h-11 items-center font-medium",
                    "text-[var(--eos-color-primary)] underline-offset-4 hover:underline",
                    ds.focusRing,
                  )}
                >
                  Open decision detail
                </Link>
              </div>
            </ExecutiveCard>
          </li>
        ))}
      </ul>
    </div>
  );
}
