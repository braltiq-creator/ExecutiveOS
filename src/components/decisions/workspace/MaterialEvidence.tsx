"use client";

import { DecisionChapter } from "@/components/decisions/workspace/DecisionChapter";
import type { DecisionWorkspaceModel } from "@/lib/decisions/workspace";
import {
  ExecutiveHeading,
  ExecutiveSummary,
  ds,
} from "@/design-system";
import { cn } from "@/lib/utils/cn";

export function MaterialEvidence({ model }: { model: DecisionWorkspaceModel }) {
  return (
    <DecisionChapter
      id="evidence"
      overline="Evidence"
      title="What materially affects this call"
    >
      {model.evidence.length === 0 ? (
        <ExecutiveSummary className="max-w-2xl">
          No material evidence attached yet. Prefer a named gap over invented
          certainty.
        </ExecutiveSummary>
      ) : (
        <ul className={cn(ds.spaceY["2xl"], "max-w-2xl")}>
          {model.evidence.map((item) => (
            <li key={item.id}>
              <ExecutiveHeading as="h3" size="heading">
                {item.title}
              </ExecutiveHeading>
              <p className={cn(ds.type.caption, "mt-[var(--eos-space-sm)]")}>
                {item.source} · {item.asOf}
              </p>
              <ExecutiveSummary className="mt-[var(--eos-space-md)]">
                {item.summary}
              </ExecutiveSummary>
              <p
                className={cn(
                  ds.type.supporting,
                  "mt-[var(--eos-space-md)] text-[var(--eos-color-text)]/80",
                )}
              >
                Why it matters: {item.whyItMatters}
              </p>
            </li>
          ))}
        </ul>
      )}
    </DecisionChapter>
  );
}
