"use client";

import { DecisionChapter } from "@/components/decisions/workspace/DecisionChapter";
import type { DecisionWorkspaceModel } from "@/lib/decisions/workspace";
import { ExecutiveSummary, ds } from "@/design-system";
import { cn } from "@/lib/utils/cn";

export function ExecutiveContext({ model }: { model: DecisionWorkspaceModel }) {
  return (
    <DecisionChapter
      id="executive-context"
      overline="Executive context"
      title="Why this decision exists"
    >
      <div className={cn(ds.spaceY.lg, "max-w-2xl")}>
        <ExecutiveSummary className="text-[var(--eos-color-text)]">
          {model.whyNow}
        </ExecutiveSummary>
        <ExecutiveSummary>{model.whatChanged}</ExecutiveSummary>
        <ExecutiveSummary>{model.businessImpact}</ExecutiveSummary>
      </div>
    </DecisionChapter>
  );
}
