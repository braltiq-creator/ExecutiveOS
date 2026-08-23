import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { ds } from "@/design-system/tokens";

type ExecutiveCardProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  interactive?: boolean;
  as?: "div" | "article" | "li";
};

/**
 * Sparse card — elevation without dashboard chrome.
 * Prefer ExecutiveTile when borders are unnecessary.
 */
export function ExecutiveCard({
  as: Tag = "article",
  interactive = false,
  className,
  children,
  ...props
}: ExecutiveCardProps) {
  return (
    <Tag
      className={cn(
        ds.elevation.floating,
        "p-[var(--eos-space-lg)]",
        interactive && ds.motion.cards,
        interactive && "hover:-translate-y-px",
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}
