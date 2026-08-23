import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type Props = {
  label: string;
  icon?: LucideIcon;
  trailing?: ReactNode;
  className?: string;
};

export function ExsSectionHeader({
  label,
  icon: Icon,
  trailing,
  className,
}: Props) {
  return (
    <div
      className={cn(
        "mb-2 flex shrink-0 items-center justify-between gap-2",
        className,
      )}
    >
      <p className="exs-label flex items-center gap-1.5">
        {Icon ? (
          <Icon
            className="h-3.5 w-3.5 text-[var(--exs-text-muted)]"
            strokeWidth={1.75}
            aria-hidden="true"
          />
        ) : null}
        {label}
      </p>
      {trailing}
    </div>
  );
}
