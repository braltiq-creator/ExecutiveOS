"use client";

import Link from "next/link";
import { DecisionChapter } from "@/components/decisions/workspace/DecisionChapter";
import type { DecisionWorkspaceModel } from "@/lib/decisions/workspace";
import {
  ExecutiveBadge,
  ExecutiveHeading,
  ExecutiveSummary,
  ds,
} from "@/design-system";
import { cn } from "@/lib/utils/cn";

export function OutcomeImpact({ model }: { model: DecisionWorkspaceModel }) {
  return (
    <DecisionChapter
      id="outcome-impact"
      overline="Outcome impact"
      title="What improves or declines"
    >
      <ul className={cn(ds.spaceY["3xl"], "max-w-2xl")}>
        {model.outcomeImpacts.map((item) => (
          <li key={item.outcomeId}>
            <ExecutiveHeading as="h3" size="l">
              <Link
                href={`/outcomes/${item.outcomeId}`}
                className={cn(
                  "hover:underline",
                  ds.focusRing,
                )}
              >
                {item.outcomeName}
              </Link>
            </ExecutiveHeading>
            <p className={cn(ds.type.caption, "mt-[var(--eos-space-sm)]")}>
              Health {item.healthScore}/100 · {item.status.replaceAll("_", " ")}
            </p>
            <div className={cn(ds.spaceY.md, "mt-[var(--eos-space-lg)]")}>
              <div>
                <ExecutiveBadge>If you approve</ExecutiveBadge>
                <ExecutiveSummary className="mt-[var(--eos-space-sm)]">
                  {item.ifApprove}
                </ExecutiveSummary>
              </div>
              <div>
                <ExecutiveBadge>If you reject</ExecutiveBadge>
                <ExecutiveSummary className="mt-[var(--eos-space-sm)]">
                  {item.ifReject}
                </ExecutiveSummary>
              </div>
              <div>
                <ExecutiveBadge>If you wait</ExecutiveBadge>
                <ExecutiveSummary className="mt-[var(--eos-space-sm)]">
                  {item.ifWait}
                </ExecutiveSummary>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </DecisionChapter>
  );
}
