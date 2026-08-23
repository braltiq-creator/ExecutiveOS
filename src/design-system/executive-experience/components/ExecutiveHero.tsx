import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { EXDS_TONE_VAR } from "../colour";
import type { ExdsSemanticTone } from "../types";

export type ExecutiveHeroMetric = {
  id: string;
  label: string;
  value: string;
  tone?: ExdsSemanticTone;
  caption?: string;
  detail?: string;
};

type ExecutiveHeroProps = {
  kicker?: string;
  eyebrow?: string;
  question: string;
  judgement: string;
  /** Prefer metrics signals over long evidence lines. */
  evidence?: string[];
  confidence?: number;
  confidenceLabel?: string;
  meta?: string;
  metrics?: ExecutiveHeroMetric[];
  className?: string;
  children?: ReactNode;
  /** Phase 68 — denser first-viewport composition. */
  compact?: boolean;
};

/**
 * Editorial Command Centre opening — narrative, not a KPI card.
 */
export function ExecutiveHero({
  kicker = "Command Centre",
  eyebrow = "Executive Brief",
  question,
  judgement,
  evidence = [],
  confidence,
  confidenceLabel = "Judgement confidence",
  meta,
  metrics = [],
  className,
  children,
  compact = false,
}: ExecutiveHeroProps) {
  const showEvidenceLines = metrics.length === 0 && evidence.length > 0;

  return (
    <header
      data-exds-hero="true"
      data-exds-hero-compact={compact ? "true" : undefined}
      className={cn(
        "exds-reveal-up",
        compact ? "space-y-3" : "space-y-[var(--eos-space-lg)]",
        className,
      )}
    >
      <div className={cn(compact ? "space-y-1" : "space-y-2")}>
        {kicker ? (
          <p
            className="exds-editorial-label"
            style={{ color: "var(--exds-electric, var(--exds-intelligence))" }}
          >
            {kicker}
          </p>
        ) : null}
        <p className="exds-editorial-label">{eyebrow}</p>
        <h1
          className={cn(
            "exds-editorial-question max-w-3xl",
            compact && "text-[length:1.05rem]",
          )}
        >
          {question}
        </h1>
      </div>

      <p
        className="max-w-2xl font-[family-name:var(--font-display)] font-semibold tracking-[-0.025em] text-[var(--eos-color-text)]"
        style={{
          fontSize: compact
            ? "clamp(1.35rem, 2.2vw, 1.85rem)"
            : "var(--exds-hero-display-size)",
          lineHeight: compact ? 1.15 : "var(--exds-hero-display-leading)",
        }}
      >
        {judgement}
      </p>

      {showEvidenceLines ? (
        <ul className="max-w-2xl space-y-1.5">
          {evidence.slice(0, 3).map((line, i) => (
            <li
              key={`${i}-${line.slice(0, 24)}`}
              className="eos-type-body border-l-2 border-[var(--exds-intelligence)] pl-3 text-[var(--eos-color-text-secondary)]"
            >
              {line}
            </li>
          ))}
        </ul>
      ) : null}

      {metrics.length > 0 ? (
        <ul
          className={cn(
            "grid gap-x-5 border-t border-[rgba(47,122,229,0.18)] sm:grid-cols-2 lg:grid-cols-4",
            compact ? "gap-y-2.5 pt-3" : "gap-y-4 pt-[var(--eos-space-lg)]",
          )}
          aria-label="Evidence signals"
        >
          {metrics.slice(0, 4).map((m) => (
            <li key={m.id} className="min-w-0">
              <p
                className={cn(
                  "tabular-nums font-semibold tracking-tight",
                  compact ? "text-[length:1.2rem]" : "text-[length:1.45rem]",
                )}
                style={{
                  color: EXDS_TONE_VAR[m.tone ?? "intelligence"],
                }}
              >
                {m.value}
              </p>
              <p className="eos-type-caption mt-0.5 text-[var(--eos-color-text-muted)]">
                {m.label}
              </p>
              {m.caption ? (
                <p
                  className="eos-type-caption mt-0.5"
                  style={{ color: EXDS_TONE_VAR.decision }}
                >
                  {m.caption}
                </p>
              ) : null}
              {!compact && m.detail ? (
                <p className="eos-type-caption mt-0.5 text-[var(--eos-color-text-muted)]">
                  {m.detail}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="flex flex-wrap items-end gap-x-6 gap-y-2">
        {confidence !== undefined ? (
          <div>
            <p
              className="exds-editorial-label"
              style={{ color: EXDS_TONE_VAR.decision }}
            >
              {confidenceLabel}
            </p>
            <p
              className="mt-0.5 tabular-nums font-semibold tracking-tight exds-soft-counter"
              style={{
                fontSize: compact ? "1.45rem" : "1.75rem",
                color: EXDS_TONE_VAR.decision,
              }}
            >
              {Math.round(confidence)}%
            </p>
          </div>
        ) : null}
        {meta ? (
          <p className="eos-type-caption pb-1 text-[var(--eos-color-text-muted)]">
            {meta}
          </p>
        ) : null}
      </div>

      {children}
    </header>
  );
}
