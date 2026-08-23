"use client";

import type { ExpansionSignal } from "@/design-partner";
import { cn } from "@/lib/utils/cn";

type Props = {
  signals: ExpansionSignal[];
  className?: string;
  /** Phase 67 — compact list; NOT ACTIVE modules stay visually quiet. */
  compact?: boolean;
};

/**
 * Land-and-expand signals — NOT ACTIVE modules are never implied as available.
 */
export function DesignPartnerExpansionSignals({
  signals,
  className,
  compact = false,
}: Props) {
  return (
    <section
      aria-label="Expansion signals"
      data-design-partner-expansion="true"
      data-module-landscape-compact={compact ? "true" : undefined}
      className={cn("space-y-2", className)}
    >
      <p className="exds-editorial-label">Module landscape</p>
      <ul className={cn(compact ? "space-y-1" : "grid gap-2 sm:grid-cols-2")}>
        {signals.map((signal) => {
          const active = signal.status === "active";
          return (
            <li
              key={signal.id}
              className={cn(
                compact
                  ? "flex items-baseline justify-between gap-3 py-1"
                  : "rounded-[var(--eos-radius-sm)] border px-3 py-2",
              )}
              style={
                compact
                  ? { opacity: active ? 1 : 0.55 }
                  : { borderColor: "var(--exds-card-border)" }
              }
            >
              <div className="min-w-0">
                <p
                  className={cn(
                    compact
                      ? "text-[length:0.85rem] font-semibold"
                      : "eos-type-subheading",
                  )}
                >
                  {signal.label}
                </p>
                {!compact ? (
                  <p className="eos-type-caption mt-1">{signal.rationale}</p>
                ) : null}
              </div>
              <p
                className="exds-editorial-label shrink-0"
                style={{
                  color: active
                    ? "var(--exds-intelligence)"
                    : "var(--eos-color-text-muted)",
                }}
              >
                {active ? "ACTIVE" : "NOT ACTIVE"}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
