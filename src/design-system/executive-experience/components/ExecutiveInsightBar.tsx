import { cn } from "@/lib/utils/cn";
import { EXDS_TONE_VAR } from "../colour";
import type { ExdsSemanticTone } from "../types";

type ExecutiveInsightBarProps = {
  label?: string;
  insight: string;
  confidence?: number;
  tone?: ExdsSemanticTone;
  className?: string;
};

/**
 * Final executive takeaway — closing statement of the briefing.
 */
export function ExecutiveInsightBar({
  label = "Executive insight",
  insight,
  confidence,
  tone = "decision",
  className,
}: ExecutiveInsightBarProps) {
  return (
    <aside
      data-exds-insight-bar="true"
      className={cn(
        "exds-reveal-up flex flex-wrap items-end justify-between gap-4",
        "rounded-[calc(var(--exds-card-radius)+2px)] border px-[var(--eos-space-xl)] py-[var(--eos-space-lg)]",
        "bg-[var(--exds-navy)] text-[var(--exds-navy-fg)]",
        className,
      )}
      style={{
        borderColor: "var(--exds-electric-border)",
        boxShadow: "var(--exds-electric-glow)",
      }}
      aria-label={label}
    >
      <div className="flex min-w-0 max-w-3xl items-start gap-3">
        <span
          aria-hidden="true"
          className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[length:0.85rem]"
          style={{
            color: "var(--exds-electric)",
            borderColor: "var(--exds-electric)",
          }}
        >
          ◆
        </span>
        <div className="min-w-0 space-y-2">
          <p
            className="exds-editorial-label"
            style={{ color: EXDS_TONE_VAR[tone] }}
          >
            {label}
          </p>
          <p className="text-[length:1.05rem] font-medium leading-snug tracking-[-0.01em]">
            {insight}
          </p>
        </div>
      </div>
      {confidence !== undefined ? (
        <div className="shrink-0 text-right">
          <p
            className="exds-editorial-label"
            style={{ color: "var(--exds-navy-muted)" }}
          >
            Confidence
          </p>
          <p
            className="mt-1 tabular-nums text-[length:1.5rem] font-semibold tracking-tight"
            style={{ color: EXDS_TONE_VAR[tone] }}
          >
            {Math.round(confidence)}%
          </p>
        </div>
      ) : null}
    </aside>
  );
}
