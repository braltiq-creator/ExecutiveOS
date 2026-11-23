import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Phase2PreviewClient } from "./Phase2PreviewClient";

/**
 * Development / review preview for Phase 2 immersion instruments.
 * Uses the manufacturing fixture through real analysis — not mock Northline.
 * Unavailable in production builds.
 */
export default function Phase2PreviewPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0a0c10] p-8 text-[#8b93a7]">
          Preparing Phase 2 preview…
        </div>
      }
    >
      <Phase2PreviewClient />
    </Suspense>
  );
}
