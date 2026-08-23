import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type ExperienceCardShellProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  as?: "article" | "div" | "section" | "li";
};

/** Calm surface — subtle elevation, no dashboard chrome. */
export function ExperienceCardShell({
  as: Tag = "article",
  children,
  className,
  ...props
}: ExperienceCardShellProps) {
  return (
    <Tag
      className={cn(
        "ex-surface p-[var(--ex-card-padding)]",
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}
