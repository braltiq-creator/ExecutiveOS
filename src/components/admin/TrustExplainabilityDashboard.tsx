"use client";

import type { TrustDashboard } from "@/trust";
import { REVIEW_VERDICT_LABELS } from "@/trust";
import { ExperiencePage } from "@/experience/layouts/ExperiencePage";
import { ExperienceCardShell } from "@/experience/design-system/Card";
import { ExperienceBadge } from "@/experience/design-system/Badge";
import { ExperienceTable } from "@/experience/design-system/Table";
import { DecisionPath } from "@/experience/components/DecisionPath";

type TrustExplainabilityDashboardProps = {
  dashboard: TrustDashboard;
};

export function TrustExplainabilityDashboard({
  dashboard,
}: TrustExplainabilityDashboardProps) {
  return (
    <ExperiencePage width="wide" className="space-y-8 pb-16">
      <header className="space-y-3">
        <ExperienceBadge tone="accent">Trust & Explainability</ExperienceBadge>
        <h1 className="ex-display">Governance view</h1>
        <p className="ex-body max-w-2xl">
          Recommendation history, evidence, reasoning, confidence evolution, and
          executive review — suitable for board and design-partner assurance.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Explanations" value={String(dashboard.explanationCount)} />
        <Metric
          label="Avg confidence"
          value={`${dashboard.averageConfidence}%`}
        />
        <Metric
          label="High confidence"
          value={String(dashboard.highConfidenceCount)}
        />
        <Metric label="Agree rate" value={`${dashboard.agreeRate}%`} />
      </div>

      <ExperienceCardShell className="space-y-3">
        <h2 className="ex-heading">Governance policy</h2>
        <p className="ex-body">
          Require evidence: {dashboard.governance.requireEvidence ? "yes" : "no"}{" "}
          · Min sources: {dashboard.governance.minEvidenceSources} · High band ≥{" "}
          {dashboard.governance.minConfidenceForHighBand}% · Audit retention{" "}
          {dashboard.governance.auditRetentionDays} days
        </p>
      </ExperienceCardShell>

      <section className="space-y-3">
        <h2 className="ex-heading">Recent explanations</h2>
        <ul className="space-y-4">
          {dashboard.recentExplanations.map((explanation) => (
            <li key={explanation.id}>
              <ExperienceCardShell className="space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <ExperienceBadge
                      tone={
                        explanation.confidence.band === "high"
                          ? "success"
                          : explanation.confidence.band === "low"
                            ? "attention"
                            : "accent"
                      }
                    >
                      {explanation.confidence.band} ·{" "}
                      {explanation.confidence.score}%
                    </ExperienceBadge>
                    <h3 className="ex-heading mt-3">{explanation.recommendation}</h3>
                    <p className="ex-body mt-2">{explanation.whyWeBelieveThis}</p>
                  </div>
                </div>
                <p className="ex-caption normal-case tracking-normal">
                  Q: {explanation.executiveQuestion}
                </p>
                <DecisionPath
                  steps={explanation.reasoningPath.map((step) => step.label)}
                />
                <div>
                  <p className="ex-caption">Evidence</p>
                  <ul className="mt-2 space-y-1">
                    {explanation.evidenceSources.slice(0, 4).map((source) => (
                      <li key={source.id} className="ex-body">
                        · {source.label} ({source.provider}, {source.confidence}
                        %)
                      </li>
                    ))}
                  </ul>
                </div>
              </ExperienceCardShell>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="ex-heading">Executive reviews</h2>
        {dashboard.recentReviews.length === 0 ? (
          <p className="ex-body">No executive reviews recorded yet.</p>
        ) : (
          <ExperienceTable
            caption="Executive review history"
            getRowKey={(row) => row.id}
            rows={dashboard.recentReviews}
            columns={[
              {
                key: "verdict",
                header: "Verdict",
                render: (row) => REVIEW_VERDICT_LABELS[row.verdict],
              },
              {
                key: "recommendation",
                header: "Recommendation",
                render: (row) => row.recommendationId,
              },
              {
                key: "by",
                header: "By",
                render: (row) => row.recordedBy,
              },
              {
                key: "at",
                header: "When",
                render: (row) => new Date(row.recordedAt).toLocaleString(),
              },
            ]}
          />
        )}
      </section>

      <section className="space-y-3">
        <h2 className="ex-heading">Audit trail</h2>
        <ExperienceTable
          caption="Trust audit history"
          getRowKey={(row) => row.id}
          rows={dashboard.recentAudit}
          columns={[
            {
              key: "kind",
              header: "Kind",
              render: (row) => row.kind,
            },
            {
              key: "summary",
              header: "Summary",
              render: (row) => row.summary,
            },
            {
              key: "confidence",
              header: "Confidence",
              render: (row) =>
                row.confidenceScore != null ? `${row.confidenceScore}%` : "—",
            },
            {
              key: "at",
              header: "When",
              render: (row) => new Date(row.at).toLocaleString(),
            },
          ]}
        />
      </section>
    </ExperiencePage>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <ExperienceCardShell>
      <p className="ex-caption">{label}</p>
      <p className="ex-heading mt-2 text-2xl">{value}</p>
    </ExperienceCardShell>
  );
}
