import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { MOCK_INSIGHTS } from "@/lib/mock/insights";

export function InsightsFoundation() {
  return (
    <div className="space-y-8">
      <PageHeader
        overline="Insights"
        title="Insights"
        description="Explained intelligence depth. Advisor craft lives here — not as the product home."
      />

      {MOCK_INSIGHTS.length === 0 ? (
        <EmptyState
          title="No insights yet"
          description="Insights will appear as Observe and Understand produce explained artefacts."
        />
      ) : (
        <ul className="max-w-3xl space-y-8">
          {MOCK_INSIGHTS.map((insight) => (
            <li key={insight.id} className="border-b border-border pb-8 last:border-0">
              <p className="text-base font-medium text-foreground">
                {insight.title}
              </p>
              <p className="mt-2 text-sm leading-6 text-secondary">
                {insight.summary}
              </p>
              <p className="mt-3 text-xs text-muted">
                {insight.sourceLabel} · Confidence {insight.confidence}%
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
