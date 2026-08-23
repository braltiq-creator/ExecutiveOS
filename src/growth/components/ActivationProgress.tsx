"use client";

import type { CustomerJourneyState } from "@/growth/framework/types";
import { activationProgressPct } from "@/growth/activation";
import { ExperienceCardShell } from "@/experience/design-system/Card";
import { ExperienceBadge } from "@/experience/design-system/Badge";

type ActivationProgressProps = {
  journey: CustomerJourneyState;
};

export function ActivationProgress({ journey }: ActivationProgressProps) {
  const pct = activationProgressPct(journey.steps);

  return (
    <ExperienceCardShell className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <ExperienceBadge tone="accent">Activation</ExperienceBadge>
        <span className="text-sm font-medium text-[var(--ex-text)]">
          {pct}% complete
        </span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-[var(--eos-surface-inset)]"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Activation progress"
      >
        <div
          className="h-full bg-[var(--ex-accent)] transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <ol className="space-y-2">
        {journey.steps.map((step) => (
          <li
            key={step.id}
            className="flex items-start justify-between gap-3 text-sm"
          >
            <span
              className={
                step.status === "complete"
                  ? "text-[var(--ex-text)]"
                  : step.status === "in_progress"
                    ? "text-[var(--ex-accent)]"
                    : "text-[var(--ex-text-muted)]"
              }
            >
              {step.label}
            </span>
            <span className="ex-caption normal-case tracking-normal shrink-0">
              {step.status.replace(/_/g, " ")}
            </span>
          </li>
        ))}
      </ol>
      {journey.fiveMinuteReady ? (
        <p className="ex-body text-[var(--ex-success)]">
          Five-minute path complete — first brief and value are ready.
        </p>
      ) : null}
    </ExperienceCardShell>
  );
}
