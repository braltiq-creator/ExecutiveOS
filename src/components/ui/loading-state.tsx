import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { Spinner } from "@/components/ui/spinner";

type LoadingStateProps = {
  title?: string;
  description?: string;
  className?: string;
};

export function LoadingState({
  title = "Loading",
  description = "Please wait while we prepare this surface.",
  className,
}: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex flex-col items-center justify-center rounded-[var(--eos-radius-lg)] border border-border bg-surface px-6 py-16 text-center",
        className,
      )}
    >
      <Spinner size="lg" label={title} />
      <p className="mt-4 text-sm font-medium text-foreground">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-secondary">{description}</p>
    </div>
  );
}

export function PageLoadingState() {
  return (
    <LoadingState
      title="Loading ExecutiveOS"
      description="Preparing your executive workspace."
      className="min-h-[50vh] border-none bg-transparent shadow-none"
    />
  );
}

export function InlineLoading({ label }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-secondary">
      <Spinner size="sm" label={label ?? "Loading"} />
      {label}
    </span>
  );
}

export function LoadingOverlay({ children }: { children?: ReactNode }) {
  return (
    <div className="relative">
      <div className="absolute inset-0 z-10 flex items-center justify-center rounded-[var(--eos-radius-lg)] bg-canvas/70 backdrop-blur-[1px]">
        <Spinner size="md" />
      </div>
      {children}
    </div>
  );
}
