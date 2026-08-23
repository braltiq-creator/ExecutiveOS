"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";

type Item = {
  id: string;
  state: string;
  label: string;
  detail: string;
};

type Props = {
  items: Item[];
  nothingMaterialChanged?: boolean;
  /** Phase 67 — default 3 compact rows. */
  initialVisible?: number;
  className?: string;
};

/**
 * Phase 65–67 — Since you last looked (derived continuity only).
 * Compressed footprint; full list via progressive disclosure.
 */
export function SinceYouLastLooked({
  items,
  nothingMaterialChanged,
  initialVisible = 3,
  className,
}: Props) {
  const [showAll, setShowAll] = useState(false);
  const limit = Math.max(1, Math.min(5, initialVisible));
  const visible = showAll ? items : items.slice(0, limit);
  const hasMore = items.length > limit;

  return (
    <section
      aria-label="Since you last looked"
      data-since-last-looked="true"
      data-since-last-looked-compact={!showAll ? "true" : "false"}
      className={cn("space-y-2", className)}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p
          className="exds-editorial-label"
          style={{ color: "var(--exds-intelligence)" }}
        >
          Since you last looked
        </p>
        {!nothingMaterialChanged && items.length > 0 ? (
          <p className="eos-type-caption tabular-nums">
            {items.length} material change{items.length === 1 ? "" : "s"}
          </p>
        ) : null}
      </div>
      {nothingMaterialChanged || items.length === 0 ? (
        <p className="eos-type-supporting">Nothing material has changed.</p>
      ) : (
        <>
          <ol className="space-y-1.5">
            {visible.map((item, index) => (
              <li
                key={item.id}
                className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-2"
              >
                <span
                  className="tabular-nums text-[length:0.75rem] font-semibold"
                  style={{
                    color: "var(--exds-electric, var(--exds-intelligence))",
                  }}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="text-[length:0.9rem] font-semibold tracking-tight leading-snug">
                  {item.label}
                </p>
              </li>
            ))}
          </ol>
          {hasMore || showAll ? (
            <button
              type="button"
              data-view-all-changes="true"
              className="exds-focus-ring eos-type-caption font-semibold uppercase tracking-[0.08em]"
              style={{ color: "var(--exds-intelligence)" }}
              onClick={() => setShowAll((v) => !v)}
            >
              {showAll
                ? "Show fewer →"
                : `View all ${items.length} changes →`}
            </button>
          ) : null}
        </>
      )}
    </section>
  );
}
