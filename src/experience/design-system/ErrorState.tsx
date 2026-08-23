import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { ExperienceBadge } from "@/experience/design-system/Badge";

type ExperienceErrorStateProps = {
  title?: string;
  description: string;
  action?: ReactNode;
  className?: string;
};

export function ExperienceErrorState({
  title = "Something needs attention",
  description,
  action,
  className,
}: ExperienceErrorStateProps) {
  return (
    <div
      className={cn("ex-surface space-y-3 p-[var(--ex-card-padding)]", className)}
      role="alert"
    >
      <ExperienceBadge tone="critical">{title}</ExperienceBadge>
      <p className="ex-body">{description}</p>
      {action}
    </div>
  );
}
