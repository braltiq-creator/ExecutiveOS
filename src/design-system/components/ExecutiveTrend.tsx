import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type ExecutiveTrendDirection = "up" | "down" | "flat";

type ExecutiveTrendProps = HTMLAttributes<HTMLSpanElement> & {
  direction: ExecutiveTrendDirection;
  children?: ReactNode;
};

const GLYPH = { up: "▲", down: "▼", flat: "→" } as const;

const COLOR = {
  up: "text-[var(--eos-color-momentum-positive)]",
  down: "text-[var(--eos-color-momentum-negative)]",
  flat: "text-[var(--eos-color-momentum-stable)]",
} as const;

/** Momentum direction — glyph + optional label. */
export function ExecutiveTrend({
  direction,
  className,
  children,
  ...props
}: ExecutiveTrendProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-[var(--eos-space-xs)]",
        "font-mono text-[length:var(--eos-type-caption-size)] tabular-nums",
        COLOR[direction],
        className,
      )}
      {...props}
    >
      <span aria-hidden="true">{GLYPH[direction]}</span>
      {children}
    </span>
  );
}
