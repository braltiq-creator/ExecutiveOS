import { cn } from "@/lib/utils/cn";

type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-pulse rounded-[var(--eos-radius-md)] bg-surface-inset",
        className,
      )}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-[var(--eos-radius-lg)] border border-border bg-surface p-5">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="mt-3 h-6 w-2/3" />
      <Skeleton className="mt-4 h-16 w-full" />
    </div>
  );
}

export function SkeletonGrid({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
}

/** Today shell loading skeleton — preserves section rhythm. */
export function TodayShellSkeleton() {
  return (
    <div className="space-y-10" aria-busy="true" aria-label="Loading Today">
      <div className="max-w-2xl space-y-3">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="space-y-3 border-b border-border pb-8">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-4 w-full max-w-xl" />
          <Skeleton className="h-16 w-full max-w-2xl" />
        </div>
      ))}
    </div>
  );
}
