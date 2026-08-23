import { DecisionStatusBadge } from "@/components/decisions/DecisionStatusBadge";
import type { ExecutiveDecisionRecord } from "@/lib/decisions/types";
import { formatDecisionRiskLevel } from "@/lib/decisions/types";

type DecisionCardProps = {
  decision: ExecutiveDecisionRecord;
  onEdit: (decision: ExecutiveDecisionRecord) => void;
  onArchive: (decisionId: string) => void;
  archiving?: boolean;
};

function formatDate(value: string | null): string {
  if (!value) {
    return "Not set";
  }

  return new Date(value).toLocaleDateString(undefined, {
    dateStyle: "medium",
  });
}

export function DecisionCard({
  decision,
  onEdit,
  onArchive,
  archiving = false,
}: DecisionCardProps) {
  return (
    <article className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <DecisionStatusBadge status={decision.status} />
          <h3 className="text-lg font-semibold tracking-tight text-zinc-900">
            {decision.title}
          </h3>
        </div>
        <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 text-xs font-medium text-zinc-600">
          {formatDecisionRiskLevel(decision.risk_level)} risk
        </span>
      </div>

      <p className="mt-4 text-sm leading-6 text-zinc-600">{decision.summary}</p>

      <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-zinc-500">Owner</dt>
          <dd className="font-medium text-zinc-900">{decision.owner}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">Decision date</dt>
          <dd className="font-medium text-zinc-900">
            {formatDate(decision.decision_date)}
          </dd>
        </div>
        <div>
          <dt className="text-zinc-500">Review date</dt>
          <dd className="font-medium text-zinc-900">
            {formatDate(decision.review_date)}
          </dd>
        </div>
        <div>
          <dt className="text-zinc-500">Expected outcome</dt>
          <dd className="font-medium text-zinc-900">{decision.expected_outcome}</dd>
        </div>
      </dl>

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onEdit(decision)}
          className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-200 bg-white px-3.5 text-sm font-medium text-zinc-900 transition-colors hover:border-zinc-300 hover:bg-zinc-50"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => onArchive(decision.id)}
          disabled={archiving}
          className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-200 bg-white px-3.5 text-sm font-medium text-zinc-600 transition-colors hover:border-zinc-300 hover:bg-zinc-50 disabled:opacity-60"
        >
          Archive
        </button>
      </div>
    </article>
  );
}
