"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { SnapshotAction } from "@/lib/snapshot/types";
import { ds } from "@/design-system";
import { cn } from "@/lib/utils/cn";

type RecommendedActionsStripProps = {
  actions: SnapshotAction[];
};

export function RecommendedActionsStrip({
  actions,
}: RecommendedActionsStripProps) {
  if (actions.length === 0) {
    return <p className={ds.type.supporting}>No Actions need attention now.</p>;
  }

  return (
    <ul className={ds.spaceY.sm}>
      {actions.map((action) => (
        <li key={action.id}>
          <Link
            href={action.href}
            className={cn(
              "group flex items-start gap-[var(--eos-space-sm)] py-[var(--eos-space-xs)]",
              ds.focusRing,
            )}
          >
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  ds.type.subheading,
                  "text-[var(--eos-color-text)] group-hover:underline group-hover:decoration-[var(--eos-color-divider)] group-hover:underline-offset-4",
                )}
              >
                {action.title}
              </p>
              {action.supportsOutcome ? (
                <p
                  className={cn(
                    ds.type.caption,
                    "mt-[var(--eos-space-xs)] text-[var(--eos-color-text-muted)]",
                  )}
                >
                  Supports: {action.supportsOutcome}
                  {typeof action.estimatedContribution === "number" ? (
                    <>
                      <span className="text-[var(--eos-color-divider)]"> · </span>
                      ~{action.estimatedContribution}% contribution
                    </>
                  ) : null}
                  {typeof action.strategyConfidence === "number" ? (
                    <>
                      <span className="text-[var(--eos-color-divider)]"> · </span>
                      {action.strategyConfidence}% conf
                    </>
                  ) : null}
                </p>
              ) : null}
              {action.expectedImpact ? (
                <p
                  className={cn(
                    ds.type.caption,
                    "mt-[var(--eos-space-xs)] truncate opacity-60",
                  )}
                >
                  Impact: {action.expectedImpact}
                  {action.potentialRisk ? (
                    <>
                      <span className="text-[var(--eos-color-divider)]"> · </span>
                      Risk: {action.potentialRisk}
                    </>
                  ) : null}
                </p>
              ) : null}
              {action.businessQuestion ? (
                <p
                  className={cn(
                    ds.type.caption,
                    "mt-[var(--eos-space-xs)] text-[var(--eos-color-text-muted)]",
                  )}
                >
                  Answers: {action.businessQuestion}
                  {action.scenarioName ? (
                    <>
                      <span className="text-[var(--eos-color-divider)]"> · </span>
                      {action.scenarioName}
                    </>
                  ) : null}
                  {typeof action.confidence === "number" ? (
                    <>
                      <span className="text-[var(--eos-color-divider)]"> · </span>
                      {action.confidence}% confidence
                    </>
                  ) : null}
                </p>
              ) : null}
              <p
                className={cn(
                  ds.type.caption,
                  "mt-[var(--eos-space-xs)] truncate opacity-65",
                )}
              >
                {action.why}
                <span className="text-[var(--eos-color-divider)]"> · </span>
                <span className="text-[var(--eos-color-text-muted)]">
                  {action.expectedOutcome}
                </span>
              </p>
              {(action.strategyEvidence && action.strategyEvidence.length > 0) ||
              (action.evidence && action.evidence.length > 0) ? (
                <p
                  className={cn(
                    ds.type.caption,
                    "mt-[var(--eos-space-xs)] truncate opacity-50",
                  )}
                >
                  Evidence:{" "}
                  {(action.strategyEvidence ?? action.evidence ?? [])
                    .slice(0, 2)
                    .join(" · ")}
                </p>
              ) : null}
              {action.previousSituations &&
              action.previousSituations.length > 0 ? (
                <p
                  className={cn(
                    ds.type.caption,
                    "mt-[var(--eos-space-xs)] truncate opacity-50",
                  )}
                >
                  Memory: {action.previousSituations[0]}
                  {typeof action.similarityConfidence === "number"
                    ? ` · ${action.similarityConfidence}% similar`
                    : ""}
                  {action.lessonsLearned?.[0]
                    ? ` · ${action.lessonsLearned[0]}`
                    : ""}
                </p>
              ) : null}
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
