"use client";

import { ExecutiveSection } from "@/design-system";
import { cn } from "@/lib/utils/cn";

type SnapshotSectionProps = {
  id: string;
  question: string;
  children: React.ReactNode;
  className?: string;
};

/** One question per section — orientation, not explanation. */
export function SnapshotSection({
  id,
  question,
  children,
  className,
}: SnapshotSectionProps) {
  return (
    <ExecutiveSection
      id={id}
      label={question}
      className={cn("min-w-0", className)}
    >
      {children}
    </ExecutiveSection>
  );
}
