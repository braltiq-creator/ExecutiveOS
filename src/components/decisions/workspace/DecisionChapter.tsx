import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { ExecutiveBadge, ExecutiveHeading } from "@/design-system";

type DecisionChapterProps = {
  id: string;
  overline: string;
  title?: string;
  children: ReactNode;
  className?: string;
};

/** Narrative chapter — Design System section rhythm. */
export function DecisionChapter({
  id,
  overline,
  title,
  children,
  className,
}: DecisionChapterProps) {
  return (
    <section
      id={id}
      aria-labelledby={title ? `${id}-title` : `${id}-overline`}
      className={cn(
        "scroll-mt-28 py-[var(--eos-space-2xl)] sm:py-[var(--eos-space-3xl)]",
        className,
      )}
    >
      <ExecutiveBadge id={`${id}-overline`}>{overline}</ExecutiveBadge>
      {title ? (
        <ExecutiveHeading
          id={`${id}-title`}
          as="h2"
          size="l"
          className="mt-[var(--eos-space-md)] max-w-2xl"
        >
          {title}
        </ExecutiveHeading>
      ) : null}
      <div
        className={cn(
          title ? "mt-[var(--eos-space-xl)]" : "mt-[var(--eos-space-lg)]",
        )}
      >
        {children}
      </div>
    </section>
  );
}
