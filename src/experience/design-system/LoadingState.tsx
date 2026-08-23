import { cn } from "@/lib/utils/cn";

type ExperienceLoadingStateProps = {
  rows?: number;
  className?: string;
  label?: string;
};

export function ExperienceLoadingState({
  rows = 3,
  className,
  label = "Loading",
}: ExperienceLoadingStateProps) {
  return (
    <div
      className={cn("space-y-3", className)}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }, (_, index) => (
        <div
          key={index}
          className="ex-skeleton h-14 w-full"
          style={{ opacity: 1 - index * 0.12 }}
        />
      ))}
    </div>
  );
}
