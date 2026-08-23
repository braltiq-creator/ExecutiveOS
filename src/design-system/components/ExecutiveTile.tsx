import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { ds } from "@/design-system/tokens";

type ExecutiveTileProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  interactive?: boolean;
  as?: "div" | "li" | "article";
};

/** Compact momentum tile — whitespace over chrome. */
export function ExecutiveTile({
  as: Tag = "div",
  interactive = false,
  className,
  children,
  ...props
}: ExecutiveTileProps) {
  return (
    <Tag
      className={cn(
        "rounded-[var(--eos-radius-md)]",
        "py-[var(--eos-space-xs)]",
        interactive && ds.motion.cards,
        interactive && "hover:bg-[var(--eos-elevation-focus-bg)] hover:-translate-y-px",
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}
