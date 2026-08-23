import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { ds } from "@/design-system/tokens";

type ExecutivePanelProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  as?: "div" | "section" | "aside";
};

/** Soft floating panel for grouped executive content. */
export function ExecutivePanel({
  as: Tag = "section",
  className,
  children,
  ...props
}: ExecutivePanelProps) {
  return (
    <Tag
      className={cn(
        ds.elevation.floating,
        "p-[var(--eos-space-lg)]",
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}
