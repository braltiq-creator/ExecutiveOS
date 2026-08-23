"use client";

import Link from "next/link";
import { IntentAlignmentBadge } from "@/components/intent/IntentAlignmentBadge";
import { OutcomeMetricStrip } from "@/components/outcomes/OutcomeMetricStrip";
import { OutcomeStatusBadge } from "@/components/outcomes/OutcomeStatusBadge";
import { useIntent } from "@/components/providers/IntentProvider";
import type { Outcome } from "@/lib/outcomes/types";

export function OutcomeCard({ outcome }: { outcome: Outcome }) {
  const { getOutcomeAlignment } = useIntent();
  const intentAlignment = getOutcomeAlignment(outcome.id);

  return (
    <article className="flex h-full flex-col rounded-[var(--eos-radius-lg)] border border-border bg-surface p-5 shadow-[var(--eos-shadow-1)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <OutcomeStatusBadge status={outcome.status} />
            <IntentAlignmentBadge alignment={intentAlignment} />
          </div>
          <h3 className="mt-3 font-display text-lg font-semibold tracking-tight text-foreground">
            <Link
              href={`/outcomes/${outcome.id}`}
              className="rounded-sm hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
            >
              {outcome.name}
            </Link>
          </h3>
          <p className="mt-2 text-sm leading-6 text-secondary">
            {outcome.description}
          </p>
        </div>
      </div>

      <OutcomeMetricStrip outcome={outcome} className="mt-5" />

      <dl className="mt-5 grid gap-3 border-t border-border pt-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-[11px] uppercase tracking-[0.14em] text-muted">
            Owner
          </dt>
          <dd className="mt-1 text-secondary">{outcome.owner}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-[0.14em] text-muted">
            Target date
          </dt>
          <dd className="mt-1 font-mono text-secondary">{outcome.targetDate}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-[11px] uppercase tracking-[0.14em] text-muted">
            Business impact
          </dt>
          <dd className="mt-1 text-secondary">{outcome.businessImpact}</dd>
        </div>
            <div>
          <dt className="text-[11px] uppercase tracking-[0.14em] text-muted">
            Linked decisions
          </dt>
          <dd className="mt-1 font-mono text-foreground">
            {outcome.decisionIds.length}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-[0.14em] text-muted">
            Pending actions
          </dt>
          <dd className="mt-1 font-mono text-foreground">
            {outcome.pendingActions.length}
          </dd>
        </div>
      </dl>

      <div className="mt-5">
        <Link
          href={`/outcomes/${outcome.id}`}
          className="inline-flex min-h-11 items-center text-sm font-medium text-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
        >
          Open outcome detail
        </Link>
      </div>
    </article>
  );
}
