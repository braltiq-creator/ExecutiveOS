import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type RevealProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  /** Stagger index 0–8 (~80–150ms steps) */
  delay?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
};

/** Subtle fade-up — respects prefers-reduced-motion via CSS. */
export function Reveal({
  children,
  delay = 0,
  className,
  ...props
}: RevealProps) {
  return (
    <div
      className={cn(
        "ex-motion ex-reveal",
        delay > 0 && `ex-reveal-${delay}`,
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
