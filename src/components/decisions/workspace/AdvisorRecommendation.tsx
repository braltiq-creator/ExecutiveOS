"use client";

import { useState } from "react";
import { DecisionChapter } from "@/components/decisions/workspace/DecisionChapter";
import type { DecisionWorkspaceModel } from "@/lib/decisions/workspace";
import {
  ExecutiveBadge,
  ExecutiveHeading,
  ExecutiveSummary,
  ds,
} from "@/design-system";
import { cn } from "@/lib/utils/cn";

/**
 * Advisor recommendation — explains and proposes.
 * Never binds. Executive Decides.
 */
export function AdvisorRecommendation({
  model,
}: {
  model: DecisionWorkspaceModel;
}) {
  const [open, setOpen] = useState(true);
  const rec = model.advisorRecommendation;

  return (
    <DecisionChapter
      id="advisor-recommendation"
      overline="Advisor recommendation"
      title="Preparation — not authority"
    >
      <ExecutiveSummary className="max-w-2xl">
        A Chief of Staff would put this in front of you with reasoning attached.
        The Decision remains yours.
      </ExecutiveSummary>

      <div className="mt-[var(--eos-space-xl)] max-w-2xl">
        <ExecutiveHeading as="h3" size="l">
          {rec.summary}
        </ExecutiveHeading>
        <p className={cn(ds.type.caption, "mt-[var(--eos-space-md)]")}>
          Preferred path · {rec.preferredPath}
          {" · "}
          Confidence {rec.confidence}%
        </p>

        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className={cn(
            ds.type.body,
            "mt-[var(--eos-space-xl)] font-medium underline-offset-4",
            "hover:text-[var(--eos-color-text)] hover:underline",
            ds.focusRing,
          )}
        >
          {open ? "Hide reasoning" : "Show reasoning"}
        </button>

        {open ? (
          <div
            className={cn(
              ds.spaceY.md,
              "mt-[var(--eos-space-lg)]",
            )}
          >
            <ExecutiveSummary>{rec.rationale}</ExecutiveSummary>
            <ExecutiveSummary className="text-[var(--eos-color-text)]/80">
              {rec.caveats}
            </ExecutiveSummary>
            <ExecutiveSummary>
              Suggested next step:{" "}
              <span className="font-medium text-[var(--eos-color-text)]">
                {model.nextStep}
              </span>
            </ExecutiveSummary>
          </div>
        ) : null}
      </div>
    </DecisionChapter>
  );
}
