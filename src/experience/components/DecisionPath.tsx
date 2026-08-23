"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";

type DecisionPathProps = {
  steps: string[];
  className?: string;
};

/** Interactive decision path — Question → … → Expected outcome. */
export function DecisionPath({ steps, className }: DecisionPathProps) {
  const [active, setActive] = useState(0);

  if (steps.length === 0) return null;

  return (
    <div className={cn("space-y-3", className)}>
      <p className="ex-caption">Reasoning path</p>
      <ol className="flex flex-col gap-0">
        {steps.map((step, index) => {
          const isActive = index === active;
          return (
            <li key={`${step}-${index}`}>
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-current={isActive ? "step" : undefined}
                className={cn(
                  "flex w-full items-start gap-3 rounded-[var(--ex-radius)] px-2 py-2 text-left transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--eos-ring)]",
                  isActive
                    ? "bg-[color-mix(in_srgb,var(--ex-accent)_8%,transparent)]"
                    : "hover:bg-[var(--eos-surface-inset)]",
                )}
              >
                <span
                  className={cn(
                    "mt-1 flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold",
                    isActive
                      ? "bg-[var(--ex-accent)] text-white"
                      : "bg-[var(--eos-surface-inset)] text-[var(--ex-text-muted)]",
                  )}
                  aria-hidden
                >
                  {index + 1}
                </span>
                <span className="min-w-0">
                  <span
                    className={cn(
                      "block text-sm font-medium",
                      isActive
                        ? "text-[var(--ex-text)]"
                        : "text-[var(--ex-text-secondary)]",
                    )}
                  >
                    {step}
                  </span>
                  {index < steps.length - 1 ? (
                    <span
                      className="mt-1 block pl-1 text-[var(--ex-text-muted)]"
                      aria-hidden
                    >
                      ↓
                    </span>
                  ) : null}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      <p className="ex-body text-[var(--ex-text-muted)]" aria-live="polite">
        Step {active + 1} of {steps.length}: {steps[active]}
      </p>
    </div>
  );
}
