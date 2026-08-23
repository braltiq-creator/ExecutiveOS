"use client";

import { DecisionChapter } from "@/components/decisions/workspace/DecisionChapter";
import type { DecisionWorkspaceModel } from "@/lib/decisions/workspace";
import {
  ExecutiveBadge,
  ExecutiveDivider,
  ExecutiveHeading,
  ExecutiveSummary,
  ds,
} from "@/design-system";
import { cn } from "@/lib/utils/cn";

export function StrategicRisks({ model }: { model: DecisionWorkspaceModel }) {
  return (
    <DecisionChapter
      id="strategic-risks"
      overline="Strategic risks"
      title="What can go wrong"
    >
      <ul className={cn(ds.spaceY.xl, "max-w-2xl")}>
        {model.risks.map((risk) => (
          <li key={risk.id}>
            <ExecutiveHeading as="h3" size="heading">
              {risk.title}
            </ExecutiveHeading>
            <ExecutiveSummary className="mt-[var(--eos-space-md)]">
              {risk.explanation}
            </ExecutiveSummary>
          </li>
        ))}
      </ul>

      <div
        className={cn(
          ds.spaceY.xl,
          "mt-[var(--eos-space-3xl)] max-w-2xl",
        )}
      >
        <ExecutiveDivider soft />
        <div>
          <ExecutiveBadge>If we wait</ExecutiveBadge>
          <ExecutiveSummary className="mt-[var(--eos-space-md)]">
            {model.ifWait}
          </ExecutiveSummary>
        </div>
        <div>
          <ExecutiveBadge>If we approve</ExecutiveBadge>
          <ExecutiveSummary className="mt-[var(--eos-space-md)]">
            {model.ifApprove}
          </ExecutiveSummary>
        </div>
        <div>
          <ExecutiveBadge>If we reject</ExecutiveBadge>
          <ExecutiveSummary className="mt-[var(--eos-space-md)]">
            {model.ifReject}
          </ExecutiveSummary>
        </div>
      </div>
    </DecisionChapter>
  );
}
