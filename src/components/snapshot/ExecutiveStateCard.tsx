"use client";

import Link from "next/link";
import type { ExecutiveState } from "@/lib/snapshot/types";
import { ExecutiveBadge, ExecutiveSummary, ds } from "@/design-system";
import { cn } from "@/lib/utils/cn";

type ExecutiveStateCardProps = {
  state: ExecutiveState;
};

export function ExecutiveStateCard({ state }: ExecutiveStateCardProps) {
  return (
    <section aria-labelledby="executive-state-label">
      <ExecutiveBadge id="executive-state-label">Executive State</ExecutiveBadge>
      <Link
        href={state.href}
        className={cn(
          "group mt-[var(--eos-space-sm)] block",
          ds.focusRing,
        )}
      >
        <ExecutiveSummary className="text-[var(--eos-color-text)] group-hover:underline group-hover:decoration-[var(--eos-color-divider)] group-hover:underline-offset-4">
          {state.summary}
        </ExecutiveSummary>
      </Link>
    </section>
  );
}
