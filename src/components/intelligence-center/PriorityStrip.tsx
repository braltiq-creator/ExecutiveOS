import type { ExecutiveInsightCard } from "@/lib/intelligence-center/types";
import { InsightCard } from "@/components/intelligence-center/InsightCard";

type PriorityStripProps = {
  insights: ExecutiveInsightCard[];
};

export function PriorityStrip({ insights }: PriorityStripProps) {
  if (insights.length === 0) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-zinc-900/10 bg-zinc-900 p-5 text-white sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-400">
            Priority Intelligence
          </p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight sm:text-xl">
            {insights[0].title}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-300">
            {insights[0].summary}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <div className="rounded-xl bg-white/10 px-4 py-3 text-center">
            <p className="text-[10px] uppercase tracking-wider text-zinc-400">Score</p>
            <p className="text-2xl font-semibold">{insights[0].priorityScore}</p>
          </div>
          {insights[0].badge ? (
            <span className="rounded-full border border-white/20 px-3 py-1 text-xs capitalize text-zinc-200">
              {insights[0].badge}
            </span>
          ) : null}
        </div>
      </div>

      {insights.length > 1 ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {insights.slice(1, 4).map((insight) => (
            <div
              key={insight.id}
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-3"
            >
              <p className="text-xs font-medium text-zinc-300">{insight.categoryLabel}</p>
              <p className="mt-1 text-sm font-medium text-white">{insight.title}</p>
              <p className="mt-1 text-[11px] text-zinc-400">Score {insight.priorityScore}</p>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export function PriorityInsightGrid({ insights }: PriorityStripProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {insights.map((insight) => (
        <InsightCard key={insight.id} card={insight} />
      ))}
    </div>
  );
}
