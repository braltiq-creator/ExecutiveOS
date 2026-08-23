"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { EXDS_TONE_VAR } from "@/design-system/executive-experience";
import type { ExdsHeatCell, ExdsSemanticTone } from "@/design-system/executive-experience/types";

export type EvidenceSummaryRow = {
  id: string;
  label: string;
  value: string;
  tone?: ExdsSemanticTone;
  /** Hierarchy role label e.g. Lead signal / Counter-signal */
  roleTitle?: string;
};

type Props = {
  summaryRows: EvidenceSummaryRow[];
  summaryTitle?: string;
  expandLabel?: string;
  collapseLabel?: string;
  /** Always-visible technical preview (e.g. compact heat map). */
  preview?: ReactNode;
  /** Full instrument (unchanged calculations). */
  children: ReactNode;
  className?: string;
  defaultExpanded?: boolean;
  /** When true, summary stays visible after expand. */
  keepSummaryWhenExpanded?: boolean;
};

/**
 * Phase 67/68 — progressive disclosure for dense evidence instruments.
 * Summary + optional technical preview first; full instrument on demand.
 */
export function EvidenceInstrumentDisclosure({
  summaryRows,
  summaryTitle = "Evidence hierarchy",
  expandLabel = "View full evidence →",
  collapseLabel = "Hide full evidence →",
  preview,
  children,
  className,
  defaultExpanded = false,
  keepSummaryWhenExpanded = true,
}: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const showSummary = keepSummaryWhenExpanded || !expanded;

  return (
    <div
      data-evidence-disclosure="true"
      data-evidence-disclosure-expanded={expanded ? "true" : "false"}
      className={cn("space-y-4", className)}
    >
      {showSummary ? (
        <div data-evidence-summary="true" data-evidence-narrative="true">
          <p
            className="exds-editorial-label"
            style={{ color: "var(--exds-intelligence)" }}
          >
            {summaryTitle}
          </p>
          <ul className="mt-3 space-y-2.5">
            {summaryRows.slice(0, 4).map((row) => (
              <li
                key={row.id}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3 border-b pb-2"
                style={{ borderColor: "var(--exds-electric-border)" }}
                data-evidence-role={row.roleTitle ?? undefined}
              >
                <div className="min-w-0">
                  {row.roleTitle ? (
                    <p className="exds-editorial-label mb-0.5">{row.roleTitle}</p>
                  ) : null}
                  <span className="text-[length:0.9rem] font-semibold tracking-tight">
                    {row.label}
                  </span>
                </div>
                <span
                  className="tabular-nums text-[length:1.1rem] font-semibold"
                  style={{ color: EXDS_TONE_VAR[row.tone ?? "intelligence"] }}
                >
                  {row.value}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {preview ? (
        <div data-evidence-preview="true" className="min-w-0">
          {preview}
        </div>
      ) : null}

      <button
        type="button"
        data-evidence-expand="true"
        className="exds-focus-ring eos-type-caption font-semibold uppercase tracking-[0.08em]"
        style={{ color: "var(--exds-intelligence)" }}
        onClick={() => setExpanded((v) => !v)}
      >
        {expanded ? collapseLabel : expandLabel}
      </button>

      {expanded ? (
        <div data-evidence-full="true" className="min-w-0">
          {children}
        </div>
      ) : (
        <div hidden data-evidence-full="deferred">
          {children}
        </div>
      )}
    </div>
  );
}

/** Prefer meaningful (non-quiet) heat cells — presentation only fallback. */
export function heatCellsToSummaryRows(cells: ExdsHeatCell[]): EvidenceSummaryRow[] {
  const meaningful = cells.filter((c) => c.value > 0);
  const source = meaningful.length > 0 ? meaningful : cells;
  return source.slice(0, 4).map((c) => ({
    id: c.id,
    label: c.label,
    value:
      c.detail?.split("·")[0]?.trim() ??
      (typeof c.value === "number" ? String(c.value) : String(c.value)),
    tone: c.tone,
  }));
}

type StripItem = {
  id: string;
  label: string;
  value: string;
  tone?: ExdsSemanticTone;
  caption?: string;
  role?: string;
};

/**
 * Map existing evidence-strip hierarchy into Demand narrative labels.
 * Does not re-rank or invent signals — presentation of Phase 59B roles only.
 */
export function evidenceStripToNarrativeRows(
  strip: StripItem[],
): EvidenceSummaryRow[] {
  let primaryCount = 0;
  return strip.slice(0, 4).map((item) => {
    let roleTitle = item.caption;
    if (item.role === "PRIMARY_SUPPORT") {
      primaryCount += 1;
      roleTitle = primaryCount === 1 ? "Lead signal" : "Supporting signal";
    } else if (item.role === "COUNTER_SIGNAL") {
      roleTitle = "Counter-signal";
    } else if (item.role === "OPERATIONAL_IMPLICATION") {
      roleTitle = "Operational implication";
    } else if (item.role === "CONTEXT") {
      roleTitle = "Context";
    }
    return {
      id: item.id,
      label: item.label,
      value: item.value,
      tone: item.tone,
      roleTitle,
    };
  });
}
