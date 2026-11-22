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

  return <Phase2PreviewClient />;
}
