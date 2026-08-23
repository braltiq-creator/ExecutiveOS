"use client";

import { ExecutiveSummary } from "@/design-system";

type SnapshotNarrativeProps = {
  narrative: string;
};

/** Single CoS paragraph — max 60 words enforced upstream. */
export function SnapshotNarrative({ narrative }: SnapshotNarrativeProps) {
  return (
    <ExecutiveSummary className="max-w-3xl">{narrative}</ExecutiveSummary>
  );
}
