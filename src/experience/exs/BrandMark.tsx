import Link from "next/link";
import { LedgerMark } from "@/components/layout/LedgerMark";
import { cn } from "@/lib/utils/cn";

type BrandMarkProps = {
  href?: string;
  /** Compact for mobile header; full for sidebar. */
  density?: "full" | "compact";
  className?: string;
};

/**
 * ExecutiveOS brand hierarchy — wordmark + identity line.
 * Hero of the shell without dominating the workspace.
 */
export function BrandMark({
  href = "/today",
  density = "full",
  className,
}: BrandMarkProps) {
  const inner =
    density === "full" ? (
      <>
        <LedgerMark className="size-7 shrink-0 text-[var(--exs-nav,var(--eos-color-primary))]" />
        <span className="min-w-0 leading-tight">
          <span className="block font-display text-[length:1.05rem] font-semibold tracking-[-0.03em] text-[var(--exs-text,var(--eos-color-text))]">
            ExecutiveOS
          </span>
          <span className="mt-0.5 block text-[length:0.65rem] font-medium tracking-[0.01em] text-[var(--exs-text-muted,var(--eos-color-text-muted))]">
            Confidence Through Clarity
          </span>
        </span>
      </>
    ) : (
      <>
        <LedgerMark className="size-5 shrink-0 text-[var(--exs-nav,var(--eos-color-primary))]" />
        <span className="font-display text-sm font-semibold tracking-tight text-[var(--exs-text,var(--eos-color-text))]">
          ExecutiveOS
        </span>
      </>
    );

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2.5 rounded-[var(--exs-radius-sm,var(--eos-radius-md))]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--eos-ring)]",
        density === "full" ? "min-h-12 px-1.5 py-1" : "gap-2",
        className,
      )}
      aria-label="ExecutiveOS — Confidence Through Clarity"
    >
      {inner}
    </Link>
  );
}
