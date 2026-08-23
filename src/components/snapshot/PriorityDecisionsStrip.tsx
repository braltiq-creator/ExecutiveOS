"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { SnapshotDecision } from "@/lib/snapshot/types";
import { ds } from "@/design-system";
import { cn } from "@/lib/utils/cn";

type PriorityDecisionsStripProps = {
  decisions: SnapshotDecision[];
};

export function PriorityDecisionsStrip({
  decisions,
}: PriorityDecisionsStripProps) {
  if (decisions.length === 0) {
    return <p className={ds.type.supporting}>No Decisions require you now.</p>;
  }

  return (
    <ul className={ds.spaceY.sm}>
      {decisions.map((decision) => (
        <li key={decision.id}>
          <Link
            href={decision.href}
            className={cn(
              "group flex items-start gap-[var(--eos-space-sm)] py-[var(--eos-space-xs)]",
              ds.focusRing,
            )}
          >
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  ds.type.subheading,
                  "text-[length:var(--eos-type-body-size)] leading-snug",
                  "text-[var(--eos-color-text)]",
                  "group-hover:underline group-hover:decoration-[var(--eos-color-divider)] group-hover:underline-offset-4",
                )}
              >
                {decision.title}
              </p>
              <p
                className={cn(
                  ds.type.caption,
                  "mt-[var(--eos-space-xs)] truncate opacity-65",
                )}
              >
                {decision.owner}
                <span aria-hidden="true"> · </span>
                {decision.decisionTimeLabel}
                <span aria-hidden="true"> · </span>
                <span className="text-[var(--eos-color-text-muted)]">
                  {decision.businessImpact}
                </span>
              </p>
            </div>
            <ChevronRight
              className="mt-[var(--eos-space-xs)] size-[var(--eos-icon-md)] shrink-0 text-[var(--eos-color-text-muted)] opacity-50 transition-transform duration-[var(--eos-duration-fast)] group-hover:translate-x-0.5 group-hover:text-[var(--eos-color-primary)] group-hover:opacity-100"
              strokeWidth={1.75}
              aria-hidden="true"
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}
