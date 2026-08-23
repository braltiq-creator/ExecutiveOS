import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type ExecutiveEvidenceSurfaceProps = {
  /** Optional numbered sequence marker (01, 02…). */
  index?: string | number;
  /** Small editorial label (e.g. OPPORTUNITY EXPOSURE). */
  label?: string;
  /** Question the surface answers — primary heading. */
  question: string;
  /** Optional confidence / evidence meta. */
  meta?: ReactNode;
  tone?: "light" | "instrument";
  className?: string;
  children: ReactNode;
};

/**
 * Large analytical instrument surface — not a SaaS card.
 * Question-led; contains heat maps, charts, distributions.
 */
export function ExecutiveEvidenceSurface({
  index,
  label,
  question,
  meta,
  tone = "instrument",
  className,
  children,
}: ExecutiveEvidenceSurfaceProps) {
  const idx =
    index === undefined ? null : String(index).padStart(2, "0");

  return (
    <section
      data-exds-evidence-surface="true"
      className={cn(
        "exds-reveal-up flex min-h-[var(--exds-instrument-min-h)] flex-col",
        tone === "instrument" &&
          "rounded-[calc(var(--exds-card-radius)+2px)] border border-[var(--exds-evidence-surface-border)] bg-[var(--exds-evidence-surface-bg)] p-[var(--eos-space-xl)] shadow-[var(--eos-shadow-1)]",
        className,
      )}
    >
      <header className="mb-[var(--eos-space-lg)] flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0 max-w-2xl space-y-2">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            {idx ? (
              <span
                className="tabular-nums text-[length:0.95rem] font-semibold tracking-tight"
                style={{ color: "var(--exds-electric, var(--exds-intelligence))" }}
                data-exds-evidence-index={idx}
              >
                {idx}
              </span>
            ) : null}
            {label ? <p className="exds-editorial-label">{label}</p> : null}
          </div>
          <h2 className="exds-editorial-question">{question}</h2>
        </div>
        {meta ? <div className="shrink-0">{meta}</div> : null}
      </header>
      <div className="min-h-0 flex-1">{children}</div>
    </section>
  );
}
