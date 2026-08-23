import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { EXDS_TONE_VAR } from "../colour";
import type { ExdsSemanticTone } from "../types";

export type ExecutiveOvernightItem = {
  id: string;
  title: string;
  detail: string;
  impact?: string;
  tone: ExdsSemanticTone;
  href?: string;
};

type ExecutiveOvernightChangesProps = {
  title?: string;
  items: ExecutiveOvernightItem[];
  className?: string;
};

const TONE_MARK: Record<ExdsSemanticTone, string> = {
  attention: "↑",
  watching: "!",
  decision: "→",
  intelligence: "●",
  improving: "↑",
  historical: "–",
  strategy: "◇",
};

/**
 * Morning briefing — What changed? Visual movements, not a card stack.
 */
export function ExecutiveOvernightChanges({
  title = "What changed?",
  items,
  className,
}: ExecutiveOvernightChangesProps) {
  return (
    <section
      data-exds-overnight="true"
      className={cn(
        "exds-reveal-up overflow-hidden",
        className,
      )}
      aria-label={title}
    >
      <p
        className="exds-editorial-label"
        style={{ color: "var(--exds-electric, var(--exds-intelligence))" }}
      >
        {title}
      </p>
      <ul className="mt-4 space-y-0">
        {items.map((item) => {
          const body = (
            <div className="grid grid-cols-[2.25rem_minmax(0,1fr)_auto] items-start gap-3">
              <span
                aria-hidden="true"
                className="flex h-8 w-8 items-center justify-center rounded-full border text-[length:0.95rem] font-semibold"
                style={{
                  color: EXDS_TONE_VAR[item.tone],
                  borderColor: EXDS_TONE_VAR[item.tone],
                }}
              >
                {TONE_MARK[item.tone]}
              </span>
              <div className="min-w-0">
                <p className="text-[length:0.95rem] font-semibold uppercase tracking-[0.04em] text-[var(--eos-color-text)]">
                  {item.title}
                </p>
                <p className="eos-type-supporting mt-1 tabular-nums text-[var(--eos-color-text-secondary)]">
                  {item.detail}
                </p>
              </div>
              {item.impact ? (
                <div className="shrink-0 text-right">
                  <p className="exds-editorial-label text-[var(--eos-color-text-muted)]">
                    Impact
                  </p>
                  <p
                    className="mt-1 text-[length:0.8rem] font-semibold uppercase tracking-[0.08em]"
                    style={{ color: EXDS_TONE_VAR[item.tone] }}
                  >
                    {item.impact}
                  </p>
                </div>
              ) : null}
            </div>
          );

          return (
            <li
              key={item.id}
              className="border-b py-4 last:border-b-0"
              style={{ borderColor: "rgba(47, 122, 229, 0.18)" }}
            >
              {item.href ? (
                <Link
                  href={item.href}
                  className="exds-focus-ring exds-interactive block"
                >
                  {body}
                </Link>
              ) : (
                body
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
