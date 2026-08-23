import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { ds } from "@/design-system/tokens";
import { ExecutiveHeading } from "@/design-system/components/ExecutiveHeading";

type ExecutiveSectionProps = HTMLAttributes<HTMLElement> & {
  id?: string;
  label: string;
  title?: string;
  children: ReactNode;
};

/** One question / one purpose section. */
export function ExecutiveSection({
  id,
  label,
  title,
  className,
  children,
  ...props
}: ExecutiveSectionProps) {
  const labelId = id ? `${id}-label` : undefined;
  const titleId = id && title ? `${id}-title` : undefined;

  return (
    <section
      id={id}
      aria-labelledby={titleId ?? labelId}
      className={cn("min-w-0", className)}
      {...props}
    >
      <p id={labelId} className={ds.type.label}>
        {label}
      </p>
      {title ? (
        <ExecutiveHeading id={titleId} className="mt-[var(--eos-space-sm)]">
          {title}
        </ExecutiveHeading>
      ) : null}
      <div className={cn(title ? "mt-[var(--eos-space-lg)]" : "mt-[var(--eos-space-sm)]")}>
        {children}
      </div>
    </section>
  );
}
