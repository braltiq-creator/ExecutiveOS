import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { Reveal } from "@/experience/motion/Reveal";

type BriefSectionProps = {
  id: string;
  label: string;
  children: ReactNode;
  description?: string;
  delay?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  className?: string;
};

/** One job per section — calm hierarchy for the Executive Brief. */
export function BriefSection({
  id,
  label,
  children,
  description,
  delay = 0,
  className,
}: BriefSectionProps) {
  return (
    <Reveal delay={delay} className={className}>
      <section
        id={id}
        aria-labelledby={`${id}-heading`}
        className="space-y-4"
        style={{ marginBlock: "var(--ex-section-gap)" }}
      >
        <header className="space-y-1">
          <p className="ex-caption">{label}</p>
          <h2 id={`${id}-heading`} className="sr-only">
            {label}
          </h2>
          {description ? (
            <p className={cn("ex-body max-w-2xl")}>{description}</p>
          ) : null}
        </header>
        {children}
      </section>
    </Reveal>
  );
}
