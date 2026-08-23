"use client";

import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import {
  clampConfidence,
  EXDS_TONE_LABEL,
  EXDS_TONE_SOFT_VAR,
  EXDS_TONE_VAR,
} from "../colour";
import type { ExdsHeatCell, ExdsSemanticTone } from "../types";

type ExecutiveHeatMapProps = {
  title: string;
  question?: string;
  cells: ExdsHeatCell[];
  columns?: 2 | 3 | 4 | 5 | 6;
  toneForValue?: (value: number) => ExdsSemanticTone;
  confidence?: number;
  showLegend?: boolean;
  /** When true, omit outer chrome — parent EvidenceSurface provides it. */
  bare?: boolean;
  className?: string;
};

function defaultTone(value: number): ExdsSemanticTone {
  if (value >= 80) return "attention";
  if (value >= 55) return "watching";
  if (value >= 30) return "intelligence";
  return "improving";
}

/** Neutral / zero / dash cells must not compete with meaningful deviations. */
function isQuietHeatCell(cell: ExdsHeatCell): boolean {
  if (cell.value <= 0) return true;
  const detail = cell.detail?.trim() ?? "";
  if (!detail || detail === "—" || detail === "-") return true;
  if (/^[+\-]?0(?:\.0+)?%/.test(detail)) return true;
  return false;
}

const LEGEND_TONES: ExdsSemanticTone[] = [
  "improving",
  "intelligence",
  "watching",
  "attention",
];

/**
 * Signature ExecutiveOS heat map — decision instrument, not a widget.
 */
export function ExecutiveHeatMap({
  title,
  question,
  cells,
  columns = 4,
  toneForValue = defaultTone,
  confidence,
  showLegend = true,
  bare = false,
  className,
}: ExecutiveHeatMapProps) {
  const conf =
    confidence === undefined ? undefined : clampConfidence(confidence);

  return (
    <section
      className={cn(
        !bare &&
          "rounded-[var(--exds-card-radius)] border border-[var(--exds-card-border)] bg-[var(--exds-card-bg)] p-[var(--eos-space-lg)]",
        className,
      )}
      data-exds-heatmap="true"
      aria-label={question ? `${title}: ${question}` : title}
    >
      {!bare ? (
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="exds-editorial-label">{title}</p>
            {question ? (
              <p className="exds-editorial-question mt-2 max-w-xl">{question}</p>
            ) : null}
          </div>
          {conf !== undefined ? (
            <p className="eos-type-caption tabular-nums">
              Evidence{" "}
              <span style={{ color: EXDS_TONE_VAR.intelligence }}>{conf}%</span>
            </p>
          ) : null}
        </div>
      ) : conf !== undefined ? (
        <p className="mb-3 eos-type-caption tabular-nums text-right">
          Evidence{" "}
          <span style={{ color: EXDS_TONE_VAR.intelligence }}>{conf}%</span>
        </p>
      ) : null}

      <div
        className={cn("grid gap-2", !bare && "mt-[var(--eos-space-lg)]")}
        style={{
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        }}
      >
        {cells.map((cell, i) => {
          const tone = cell.tone ?? toneForValue(cell.value);
          /** Phase 66 — neutral / zero cells stay visually quiet vs meaningful signals. */
          const quiet = isQuietHeatCell(cell);
          const intensity = quiet
            ? 0.08
            : Math.max(0.35, Math.min(1, cell.value / 100));
          const inner = (
            <>
              <span
                className={cn(
                  "eos-type-caption line-clamp-2 font-medium uppercase tracking-[0.06em]",
                  quiet
                    ? "text-[var(--eos-color-text-muted)]"
                    : "text-[var(--eos-color-text)]",
                )}
              >
                {cell.label}
              </span>
              <span
                className={cn(
                  "mt-3 font-semibold tabular-nums tracking-tight",
                  quiet ? "text-[length:1rem]" : "text-[length:1.35rem]",
                )}
                style={{
                  color: quiet
                    ? "var(--eos-color-text-muted)"
                    : EXDS_TONE_VAR[tone],
                }}
              >
                {cell.detail ?? cell.value}
              </span>
            </>
          );

          const shared = cn(
            "exds-interactive exds-focus-ring exds-heat-cell-enter flex flex-col justify-between",
            "min-h-[var(--exds-heat-cell-min-h)] rounded-[var(--eos-radius-md,8px)] px-3.5 py-3",
            quiet && "opacity-55",
          );

          const style = quiet
            ? {
                background: "rgba(47, 122, 229, 0.04)",
                boxShadow: "inset 0 0 0 1px rgba(47, 122, 229, 0.08)",
                animationDelay: `${Math.min(i, 12) * 28}ms`,
              }
            : {
                background: EXDS_TONE_SOFT_VAR[tone],
                boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${EXDS_TONE_VAR[tone]} ${Math.round(intensity * 60)}%, transparent)`,
                animationDelay: `${Math.min(i, 12) * 28}ms`,
              };

          if (cell.href) {
            return (
              <Link
                key={cell.id}
                href={cell.href}
                className={shared}
                style={style}
                data-heat-quiet={quiet ? "true" : undefined}
                title={`${cell.label}: exposure ${cell.value} · ${EXDS_TONE_LABEL[tone]}`}
              >
                {inner}
              </Link>
            );
          }

          return (
            <div
              key={cell.id}
              className={shared}
              style={style}
              data-heat-quiet={quiet ? "true" : undefined}
              title={`${cell.label}: exposure ${cell.value} · ${EXDS_TONE_LABEL[tone]}`}
            >
              {inner}
            </div>
          );
        })}
      </div>

      {showLegend ? (
        <ul
          className="mt-[var(--eos-space-lg)] flex flex-wrap gap-x-4 gap-y-1.5"
          aria-label="Semantic colour legend"
        >
          {LEGEND_TONES.map((tone) => (
            <li key={tone} className="flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 rounded-sm"
                style={{ background: EXDS_TONE_VAR[tone] }}
                aria-hidden="true"
              />
              <span className="eos-type-caption">{EXDS_TONE_LABEL[tone]}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
