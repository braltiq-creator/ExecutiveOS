import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type ExperienceEmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function ExperienceEmptyState({
  title,
  description,
  action,
  className,
}: ExperienceEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-start gap-3 py-8",
        className,
      )}
      role="status"
    >
      <p className="ex-heading">{title}</p>
      {description ? <p className="ex-body max-w-prose">{description}</p> : null}
      {action}
    </div>
  );
}
