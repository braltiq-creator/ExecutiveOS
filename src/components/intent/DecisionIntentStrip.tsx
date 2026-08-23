"use client";

import Link from "next/link";
import { IntentAlignmentBadge } from "@/components/intent/IntentAlignmentBadge";
import { useIntent } from "@/components/providers/IntentProvider";
import type { Decision } from "@/lib/decisions/engine-types";
import { cn } from "@/lib/utils/cn";

type DecisionIntentStripProps = {
  decision: Decision;
  className?: string;
  compact?: boolean;
};

/**
 * Shows which Strategic Intent a decision supports — derived via outcomes only.
 */
export function DecisionIntentStrip({
  decision,
  className,
  compact = false,
}: DecisionIntentStripProps) {
  const { alignDecision } = useIntent();
  const alignment = alignDecision(decision);

  return (
    <aside
      aria-label="Strategic Intent alignment"
      className={cn(
        "rounded-[var(--eos-radius-md)] border border-border bg-surface-inset/60 px-3 py-3",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
          Strategic Intent
        </p>
        <IntentAlignmentBadge alignment={alignment.alignment} />
      </div>
      <p className="mt-2 text-sm font-medium text-foreground">
        <Link
          href="/intent"
          className="underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {alignment.intentTitle}
        </Link>
      </p>
      {!compact ? (
        <p className="mt-1 text-sm leading-5 text-secondary">
          {alignment.explanation}
        </p>
      ) : null}
    </aside>
  );
}
