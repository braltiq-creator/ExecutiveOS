import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { ds } from "@/design-system/tokens";

type ExecutiveMetricProps = HTMLAttributes<HTMLDivElement> & {
  label: string;
  value: ReactNode;
  emphasis?: boolean;
};

/** Single dominant metric — Executive Blue when emphasised. */
export function ExecutiveMetric({
  label,
  value,
  emphasis = false,
  className,
  ...props
}: ExecutiveMetricProps) {
  return (
    <div className={cn(ds.motion.cards, "group", className)} {...props}>
      <p className={ds.type.label}>{label}</p>
      <p
        className={cn(
          ds.type.metric,
          "mt-[var(--eos-space-xs)]",
          emphasis
            ? "text-[var(--eos-color-primary)]"
            : "text-[var(--eos-color-text-secondary)]",
          "group-hover:text-[var(--eos-color-text)]",
        )}
      >
        {value}
      </p>
    </div>
  );
}
