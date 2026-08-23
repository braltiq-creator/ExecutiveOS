import type { AgentContribution, OrchestrationPlan } from "@/lib/agents/types";

type AdvisorReasoningPanelProps = {
  plan: OrchestrationPlan | null;
  contributions: AgentContribution[];
  reasoningSummary: string | null;
};

export function AdvisorReasoningPanel({
  plan,
  contributions,
  reasoningSummary,
}: AdvisorReasoningPanelProps) {
  if (!plan || contributions.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-200/80 bg-white/90 p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-zinc-900">Agent Reasoning</h2>
        <p className="mt-2 text-sm text-zinc-600">
          Ask a question to see which advisors contribute and how they reason.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white/90 p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-zinc-900">Agent Reasoning</h2>
        <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-zinc-600">
          {plan.mode === "collaborative" ? "Collaborative" : "Single advisor"}
        </span>
      </div>

      {reasoningSummary ? (
        <p className="mt-2 text-xs leading-5 text-zinc-600">{reasoningSummary}</p>
      ) : null}

      <p className="mt-3 text-xs text-zinc-500">{plan.rationale}</p>

      <div className="mt-4 space-y-3">
        {contributions.map((contribution) => (
          <div
            key={contribution.agentId}
            className="rounded-lg border border-zinc-100 bg-zinc-50/70 px-3 py-3"
          >
            <p className="text-xs font-semibold text-zinc-900">
              {contribution.agentName}
            </p>
            <p className="mt-1 text-xs font-medium text-zinc-700">
              {contribution.summary.headline}
            </p>
            <ul className="mt-2 space-y-1">
              {contribution.summary.bullets.map((bullet) => (
                <li key={bullet} className="text-xs leading-5 text-zinc-600">
                  • {bullet}
                </li>
              ))}
            </ul>
            <details className="mt-2">
              <summary className="cursor-pointer text-[11px] font-medium text-zinc-500">
                View analysis
              </summary>
              <p className="mt-2 text-xs leading-5 text-zinc-600">
                {contribution.reasoning.analysis}
              </p>
            </details>
          </div>
        ))}
      </div>
    </div>
  );
}
