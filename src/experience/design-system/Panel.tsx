import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type ExperiencePanelProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  label?: string;
};

export function ExperiencePanel({
  children,
  label,
  className,
  ...props
}: ExperiencePanelProps) {
  return (
    <section
      className={cn("space-y-4", className)}
      aria-label={label}
      {...props}
    >
      {label ? <h2 className="ex-heading">{label}</h2> : null}
      <div className="ex-surface p-[var(--ex-card-padding)]">{children}</div>
    </section>
  );
}
