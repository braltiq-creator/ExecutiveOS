import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { ds } from "@/design-system/tokens";

type ExecutiveSummaryProps = HTMLAttributes<HTMLParagraphElement> & {
  children: ReactNode;
  size?: "body" | "supporting";
};

/** Plain-English summary line — advisor voice, not report prose. */
export function ExecutiveSummary({
  size = "body",
  className,
  children,
  ...props
}: ExecutiveSummaryProps) {
  return (
    <p
      className={cn(
        size === "body" ? ds.type.body : ds.type.supporting,
        "max-w-prose text-[var(--eos-color-text-secondary)]",
        className,
      )}
      {...props}
    >
      {children}
    </p>
  );
}
