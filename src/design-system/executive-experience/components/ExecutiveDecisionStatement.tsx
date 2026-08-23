import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { EXDS_TONE_VAR } from "../colour";

type ExecutiveDecisionStatementProps = {
  index?: string | number;
  title: string;
  statement: string;
  why?: string;
  confidence?: number;
  action?: ReactNode;
  className?: string;
};

/**
 * Editorial judgement list item — meeting-ready, not a task card.
 */
export function ExecutiveDecisionStatement({
  index,
  title,
  statement,
  why,
  confidence,
  action,
  className,
}: ExecutiveDecisionStatementProps) {
  const idx =
    index === undefined
      ? null
      : String(index).padStart(2, "0");

  return (
    <article
      data-exds-decision-statement="true"
      className={cn(
        "exds-reveal-up grid gap-3 border-b border-[var(--eos-color-divider)] py-[var(--eos-space-lg)] last:border-b-0 sm:grid-cols-[auto_minmax(0,1fr)_auto]",
        className,
      )}
    >
      {idx ? (
        <p
          className="tabular-nums font-semibold tracking-tight"
          style={{
            fontSize: "1.35rem",
            color: EXDS_TONE_VAR.decision,
          }}
        >
          {idx}
        </p>
      ) : null}

      <div className="min-w-0 space-y-2">
        <h3 className="eos-type-heading text-[length:1.05rem] uppercase tracking-[0.04em] text-[var(--eos-color-text)]">
          {title}
        </h3>
        <p className="eos-type-body text-[var(--eos-color-text-secondary)]">
          {statement}
        </p>
        {why ? (
          <p className="eos-type-supporting">
            <span className="exds-editorial-label mr-2 inline">Why it matters</span>
            {why}
          </p>
        ) : null}
        {confidence !== undefined ? (
          <p className="eos-type-caption">
            Confidence{" "}
            <span
              className="tabular-nums font-medium"
              style={{ color: EXDS_TONE_VAR.intelligence }}
            >
              {Math.round(confidence)}%
            </span>
          </p>
        ) : null}
      </div>

      {action ? <div className="shrink-0 self-start">{action}</div> : null}
    </article>
  );
}
