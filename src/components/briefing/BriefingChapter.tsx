import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type BriefingChapterProps = {
  id: string;
  overline: string;
  title?: string;
  bridge?: string;
  children: ReactNode;
  className?: string;
};

/**
 * Continuous Briefing chapter — typography and whitespace only.
 * No cards, no boxed widgets.
 */
export function BriefingChapter({
  id,
  overline,
  title,
  bridge,
  children,
  className,
}: BriefingChapterProps) {
  return (
    <section
      id={id}
      aria-labelledby={title ? `${id}-title` : `${id}-overline`}
      className={cn("scroll-mt-28 py-12 sm:py-14", className)}
    >
      {bridge ? (
        <p className="mb-8 max-w-2xl text-base leading-7 text-secondary sm:text-[17px] sm:leading-8">
          {bridge}
        </p>
      ) : null}
      <p
        id={`${id}-overline`}
        className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted"
      >
        {overline}
      </p>
      {title ? (
        <h2
          id={`${id}-title`}
          className="mt-3 max-w-2xl font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
        >
          {title}
        </h2>
      ) : null}
      <div className={cn(title || bridge ? "mt-8" : "mt-6")}>{children}</div>
    </section>
  );
}
