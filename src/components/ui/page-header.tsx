import type { ReactNode } from "react";
import {
  ExecutiveBadge,
  ExecutiveHeading,
  ExecutiveSummary,
  ds,
} from "@/design-system";
import { cn } from "@/lib/utils/cn";

type PageHeaderProps = {
  overline?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
};

export function PageHeader({
  overline: overlineText,
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col sm:flex-row sm:items-end sm:justify-between",
        ds.gap.lg,
        className,
      )}
    >
      <div>
        {overlineText ? <ExecutiveBadge>{overlineText}</ExecutiveBadge> : null}
        <ExecutiveHeading
          as="h1"
          size="xl"
          className={cn(overlineText && "mt-[var(--eos-space-sm)]")}
        >
          {title}
        </ExecutiveHeading>
        {description ? (
          <ExecutiveSummary className="mt-[var(--eos-space-md)] max-w-3xl">
            {description}
          </ExecutiveSummary>
        ) : null}
      </div>
      {actions ? (
        <div className={cn("flex flex-wrap", ds.gap.sm)}>{actions}</div>
      ) : null}
    </header>
  );
}
