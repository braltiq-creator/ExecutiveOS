import type { Outcome } from "@/lib/outcomes/types";
import { cn } from "@/lib/utils/cn";

type OutcomeMetricStripProps = {
  outcome: Outcome;
  className?: string;
};

export function OutcomeMetricStrip({
  outcome,
  className,
}: OutcomeMetricStripProps) {
  const movementPositive = outcome.yesterdayMovement > 0;
  const movementNegative = outcome.yesterdayMovement < 0;

  return (
    <dl
      className={cn(
        "grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
        className,
      )}
    >
      <div className="rounded-[var(--eos-radius-md)] border border-border bg-surface-inset px-3 py-3">
        <dt className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
          Current health
        </dt>
        <dd className="mt-1 font-mono text-2xl font-semibold tabular-nums text-foreground">
          {outcome.healthScore}
          <span className="text-sm text-muted">/100</span>
        </dd>
      </div>
      <div className="rounded-[var(--eos-radius-md)] border border-border bg-surface-inset px-3 py-3">
        <dt className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
          Yesterday&apos;s movement
        </dt>
        <dd
          className={cn(
            "mt-1 font-mono text-2xl font-semibold tabular-nums",
            movementPositive && "text-success",
            movementNegative && "text-critical",
            !movementPositive && !movementNegative && "text-foreground",
          )}
        >
          {outcome.yesterdayMovement > 0 ? "+" : ""}
          {outcome.yesterdayMovement}
        </dd>
        <p className="mt-1 text-xs text-secondary">
          {outcome.yesterdayMovementLabel}
        </p>
      </div>
      <div className="rounded-[var(--eos-radius-md)] border border-border bg-surface-inset px-3 py-3">
        <dt className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
          Expected trajectory
        </dt>
        <dd className="mt-1 text-sm font-medium capitalize text-foreground">
          {outcome.expectedTrajectory.direction}
        </dd>
        <p className="mt-1 text-xs text-secondary">
          {outcome.expectedTrajectory.horizonLabel}
        </p>
      </div>
      <div className="rounded-[var(--eos-radius-md)] border border-border bg-surface-inset px-3 py-3">
        <dt className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
          Confidence
        </dt>
        <dd className="mt-1 font-mono text-2xl font-semibold tabular-nums text-foreground">
          {outcome.confidence}
          <span className="text-sm text-muted">%</span>
        </dd>
      </div>
    </dl>
  );
}
