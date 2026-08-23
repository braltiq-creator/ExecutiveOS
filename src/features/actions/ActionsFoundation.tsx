"use client";

import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { useOutcomes } from "@/components/providers/OutcomeProvider";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  blocked: "Blocked",
  in_progress: "In progress",
  done: "Done",
};

/** Actions derived from Outcome portfolio pendingActions (SoT). */
export function ActionsFoundation() {
  const { portfolio } = useOutcomes();
  const actions = portfolio.outcomes.flatMap((outcome) =>
    outcome.pendingActions.map((action) => ({
      ...action,
      outcomeName: outcome.name,
    })),
  );

  return (
    <div className="space-y-8">
      <PageHeader
        overline="Actions"
        title="Actions"
        description="Commitments that execute judgement toward Outcomes."
      />

      {actions.length === 0 ? (
        <EmptyState
          title="No actions yet"
          description="Commitments will appear here when Decisions spawn execution or recommendations are accepted."
        />
      ) : (
        <ul className="max-w-3xl divide-y divide-border border-y border-border">
          {actions.map((action) => (
            <li key={action.id} className="py-5">
              <p className="text-base font-medium text-foreground">
                {action.actionLabel}
              </p>
              <p className="mt-2 text-sm text-secondary">
                {STATUS_LABEL[action.status] ?? action.status} ·{" "}
                {action.recommendation.owner} ·{" "}
                {action.recommendation.deadline}
              </p>
              <p className="mt-1 text-sm text-muted">{action.outcomeName}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
