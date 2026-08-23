"use client";

import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { useDecisions } from "@/components/providers/DecisionProvider";
import {
  ExecutiveBadge,
  ExecutiveDivider,
  ExecutiveHeading,
  ExecutiveSummary,
  ds,
} from "@/design-system";
import { cn } from "@/lib/utils/cn";

export function DecisionsFoundation() {
  const { decisions } = useDecisions();

  return (
    <div className={ds.spaceY.xl}>
      <header>
        <ExecutiveBadge>Decisions</ExecutiveBadge>
        <ExecutiveHeading
          as="h1"
          size="xl"
          className="mt-[var(--eos-space-sm)]"
        >
          Decision register
        </ExecutiveHeading>
        <ExecutiveSummary className="mt-[var(--eos-space-md)] max-w-3xl">
          Leadership judgement linked to Outcomes. Open a Decision to review
          stakes — commit flows deepen next.
        </ExecutiveSummary>
      </header>

      {decisions.length === 0 ? (
        <EmptyState
          title="No Decisions yet"
          description="Decisions will appear here once Outcomes are framed and judgement calls are captured."
        />
      ) : (
        <ul
          className={cn(
            "border-y border-[var(--eos-color-divider)]",
          )}
        >
          {decisions.map((decision, index) => (
            <li key={decision.id}>
              {index > 0 ? <ExecutiveDivider soft /> : null}
              <Link
                href={`/decisions/${decision.id}`}
                className={cn(
                  "group block max-w-3xl py-[var(--eos-space-xl)]",
                  ds.focusRing,
                )}
              >
                <p
                  className={cn(
                    ds.type.subheading,
                    "text-[var(--eos-color-text)] group-hover:underline",
                  )}
                >
                  {decision.question}
                </p>
                <p className={cn(ds.type.supporting, "mt-[var(--eos-space-sm)]")}>
                  {decision.status.replaceAll("_", " ")} · {decision.owner} ·{" "}
                  {decision.deadline}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
