import { DecisionStatusBadge } from "@/components/decisions/DecisionStatusBadge";
import type { ExecutiveDecisionRecord } from "@/lib/decisions/types";
import { formatDecisionRiskLevel } from "@/lib/decisions/types";

type DecisionTimelineProps = {
  decisions: ExecutiveDecisionRecord[];
};

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function DecisionTimeline({ decisions }: DecisionTimelineProps) {
  if (decisions.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="mb-6 text-lg font-semibold tracking-tight text-zinc-900 sm:text-xl">
        Decision Timeline
      </h2>
      <div className="relative space-y-0">
        {decisions.map((decision, index) => (
          <div key={decision.id} className="relative flex gap-4 pb-8 last:pb-0">
            {index < decisions.length - 1 ? (
              <span
                aria-hidden="true"
                className="absolute left-[11px] top-6 h-full w-px bg-zinc-200"
              />
            ) : null}
            <span className="relative z-10 mt-1.5 size-[22px] shrink-0 rounded-full border-2 border-zinc-900 bg-white" />
            <div className="min-w-0 flex-1 rounded-xl border border-zinc-200/80 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <time
                  dateTime={decision.decision_date}
                  className="text-sm font-medium text-zinc-900"
                >
                  {formatDate(decision.decision_date)}
                </time>
                <DecisionStatusBadge status={decision.status} />
                <span className="text-xs text-zinc-500">
                  {formatDecisionRiskLevel(decision.risk_level)} risk
                </span>
              </div>
              <h3 className="mt-2 text-base font-semibold text-zinc-900">
                {decision.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                {decision.summary}
              </p>
              {decision.review_date ? (
                <p className="mt-3 text-xs text-zinc-500">
                  Review scheduled: {formatDate(decision.review_date)}
                </p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
