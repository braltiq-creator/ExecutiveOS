import Link from "next/link";
import type { AdvisorInsightSummary } from "@/lib/intelligence-center/types";

type AdvisorInsightCardProps = {
  advisor: AdvisorInsightSummary;
};

const ACCENT_DOT: Record<string, string> = {
  zinc: "bg-zinc-500",
  indigo: "bg-indigo-500",
  violet: "bg-violet-500",
  emerald: "bg-emerald-500",
  sky: "bg-sky-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  orange: "bg-orange-500",
  cyan: "bg-cyan-500",
  fuchsia: "bg-fuchsia-500",
};

export function AdvisorInsightCard({ advisor }: AdvisorInsightCardProps) {
  const dot = ACCENT_DOT[advisor.accentColor] ?? ACCENT_DOT.zinc;

  return (
    <Link
      href="/advisors"
      className="block rounded-xl border border-zinc-200/80 bg-white p-4 transition-all hover:border-zinc-300 hover:shadow-sm"
    >
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${dot}`} />
        <p className="text-xs font-semibold text-zinc-900">{advisor.agentName}</p>
        <span className="ml-auto text-[10px] font-medium text-zinc-500">
          {advisor.confidence}% confidence
        </span>
      </div>
      <p className="mt-1 text-[11px] text-zinc-500">{advisor.agentTitle}</p>
      <p className="mt-3 line-clamp-2 text-xs leading-5 text-zinc-700">
        {advisor.insight}
      </p>
      <p className="mt-2 line-clamp-2 text-xs leading-5 text-zinc-500">
        → {advisor.recommendation}
      </p>
    </Link>
  );
}
