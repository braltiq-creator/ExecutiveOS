import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type BriefingSectionProps = {
  id: string;
  overline: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
};

export function BriefingSection({
  id,
  overline,
  title,
  description,
  children,
  className,
  actions,
}: BriefingSectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={cn("scroll-mt-24", className)}
    >
      <div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted">
            {overline}
          </p>
          <h2
            id={`${id}-title`}
            className="mt-2 font-display text-xl font-semibold tracking-tight text-foreground sm:text-2xl"
          >
            {title}
          </h2>
          {description ? (
            <p className="mt-2 max-w-3xl text-sm leading-6 text-secondary">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}
