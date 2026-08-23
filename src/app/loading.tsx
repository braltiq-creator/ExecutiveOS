import { TodayShellSkeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-canvas px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <TodayShellSkeleton />
      </div>
    </div>
  );
}
