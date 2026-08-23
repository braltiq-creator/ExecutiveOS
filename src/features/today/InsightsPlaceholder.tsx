import Link from "next/link";
import { SectionShell } from "@/components/shared/SectionShell";
import { MOCK_INSIGHTS } from "@/lib/mock/insights";

export function InsightsPlaceholder() {
  const top = MOCK_INSIGHTS.slice(0, 2);

  return (
    <SectionShell
      id="today-insights"
      label="Insights"
      description="Sparse explained intelligence — full depth lives under Insights."
    >
      <ul className="max-w-2xl space-y-4">
        {top.map((insight) => (
          <li key={insight.id}>
            <p className="text-sm font-medium text-foreground">{insight.title}</p>
            <p className="mt-1 text-sm leading-6 text-secondary">
              {insight.summary}
            </p>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm">
        <Link
          href="/insights"
          className="text-secondary underline-offset-4 hover:text-foreground hover:underline"
        >
          Open Insights
        </Link>
      </p>
    </SectionShell>
  );
}
