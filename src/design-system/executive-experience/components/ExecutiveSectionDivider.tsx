import { cn } from "@/lib/utils/cn";

type ExecutiveSectionDividerProps = {
  label?: string;
  className?: string;
};

/** Quiet editorial divider between light / dark bands. */
export function ExecutiveSectionDivider({
  label,
  className,
}: ExecutiveSectionDividerProps) {
  return (
    <div
      data-exds-section-divider="true"
      className={cn("flex items-center gap-3 py-1", className)}
      role="separator"
      aria-label={label}
    >
      <span className="h-px flex-1 bg-[var(--eos-color-divider)]" />
      {label ? (
        <span className="exds-editorial-label shrink-0">{label}</span>
      ) : null}
      <span className="h-px flex-1 bg-[var(--eos-color-divider)]" />
    </div>
  );
}
