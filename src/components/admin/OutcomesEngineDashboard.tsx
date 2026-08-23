"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { MetricCard } from "@/components/ui/metric-card";
import { ResponsiveGrid } from "@/components/ui/responsive-grid";
import { StatusBadge } from "@/components/ui/status-badge";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import {
  advanceRecommendationAction,
  updateOutcomeStatusAction,
} from "@/outcomes/actions";
import type { OutcomesDashboard } from "@/outcomes";

type Props = {
  dashboard: OutcomesDashboard;
  reportMarkdown?: string;
};

export function OutcomesEngineDashboard({ dashboard, reportMarkdown }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const { analytics, decisionImpact, value, roi, confidence } = dashboard;

  return (
    <div className="space-y-8">
      <PageHeader
        overline="Administration"
        title="Executive Outcomes"
        description="Demonstrate measurable executive value — recommendations, actions, business outcomes, and learning. Tenant business outcomes are never compared across customers."
      />

      <ResponsiveGrid columns={4}>
        <MetricCard
          label="Decision influence"
          value={decisionImpact.influenceScore}
          hint="/100"
        />
        <MetricCard
          label="Estimated value (mid)"
          value={value.businessValueCreated.mid.toLocaleString()}
          hint={`${value.businessValueCreated.unit} · conf ${value.businessValueCreated.confidence}%`}
        />
        <MetricCard
          label="ROI mid"
          value={`${roi.estimatedRoi.mid}%`}
          hint={`conf ${roi.estimatedRoi.confidence}%`}
        />
        <MetricCard
          label="Outcomes confidence"
          value={confidence.overall}
          hint="/100"
        />
      </ResponsiveGrid>

      <ResponsiveGrid columns={4}>
        <MetricCard
          label="Recs adopted"
          value={`${value.recommendationsAdopted}/${value.recommendationsGenerated}`}
        />
        <MetricCard
          label="Actions taken"
          value={decisionImpact.actionsTaken}
        />
        <MetricCard
          label="Outcomes confirmed"
          value={decisionImpact.outcomesConfirmed}
        />
        <MetricCard
          label="Learning trend"
          value={analytics.learningTrend}
        />
      </ResponsiveGrid>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card padding="md">
          <SectionHeader
            title="Recommendations by status"
            description="Lifecycle from generated to confirmed."
          />
          <ul className="mt-3 space-y-1 text-sm">
            {Object.entries(analytics.recommendationsByStatus).map(
              ([status, count]) =>
                count > 0 ? (
                  <li
                    key={status}
                    className="flex justify-between text-[var(--eos-text-secondary)]"
                  >
                    <span>{status.replace(/_/g, " ")}</span>
                    <span className="font-medium text-[var(--eos-text)]">
                      {count}
                    </span>
                  </li>
                ) : null,
            )}
          </ul>
        </Card>

        <Card padding="md">
          <SectionHeader
            title="Business outcomes"
            description={confidence.explanation}
          />
          <ul className="mt-3 space-y-1 text-sm">
            {Object.entries(analytics.outcomesByStatus).map(([status, count]) => (
              <li
                key={status}
                className="flex justify-between text-[var(--eos-text-secondary)]"
              >
                <span>{status}</span>
                <span className="font-medium text-[var(--eos-text)]">{count}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-[var(--eos-text-muted)]">
            Value ranges: {value.businessValueCreated.low.toLocaleString()}–
            {value.businessValueCreated.high.toLocaleString()}{" "}
            {value.businessValueCreated.unit}. {value.explanation}
          </p>
        </Card>
      </div>

      <Card padding="md">
        <SectionHeader
          title="Open recommendations"
          description="Advance lifecycle as executives act."
        />
        <ul className="mt-3 space-y-3">
          {dashboard.openRecommendations.length === 0 ? (
            <li className="text-sm text-[var(--eos-text-secondary)]">
              No open recommendations tracked yet.
            </li>
          ) : (
            dashboard.openRecommendations.map((rec) => (
              <li
                key={rec.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded border border-[var(--eos-border)] p-3"
              >
                <div>
                  <p className="text-sm font-medium text-[var(--eos-text)]">
                    {rec.title}
                  </p>
                  <p className="text-xs text-[var(--eos-text-muted)]">
                    {rec.businessQuestion}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge label={rec.status} variant="neutral" />
                  {rec.status === "generated" || rec.status === "viewed" ? (
                    <button
                      type="button"
                      disabled={pending}
                      className="text-xs underline disabled:opacity-50"
                      onClick={() => {
                        startTransition(async () => {
                          await advanceRecommendationAction({
                            id: rec.id,
                            status: "accepted",
                            note: "Accepted via Outcomes admin",
                          });
                          router.refresh();
                        });
                      }}
                    >
                      Accept
                    </button>
                  ) : null}
                </div>
              </li>
            ))
          )}
        </ul>
      </Card>

      <Card padding="md">
        <SectionHeader
          title="Recent outcomes"
          description="Confirm to feed the learning loop."
        />
        <ul className="mt-3 space-y-3">
          {dashboard.recentOutcomes.length === 0 ? (
            <li className="text-sm text-[var(--eos-text-secondary)]">
              No outcomes recorded yet.
            </li>
          ) : (
            dashboard.recentOutcomes.map((outcome) => (
              <li
                key={outcome.id}
                className="rounded border border-[var(--eos-border)] p-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-[var(--eos-text)]">
                    {outcome.name}
                  </p>
                  <StatusBadge label={outcome.status} variant="neutral" />
                  <span className="text-xs text-[var(--eos-text-muted)]">
                    conf {outcome.confidence}%
                  </span>
                </div>
                <p className="mt-1 text-xs text-[var(--eos-text-secondary)]">
                  {outcome.businessQuestion}
                  {outcome.observedOutcome
                    ? ` — ${outcome.observedOutcome}`
                    : ""}
                </p>
                {outcome.status === "open" || outcome.status === "observed" ? (
                  <button
                    type="button"
                    disabled={pending}
                    className="mt-2 text-xs underline disabled:opacity-50"
                    onClick={() => {
                      startTransition(async () => {
                        await updateOutcomeStatusAction({
                          id: outcome.id,
                          tenantId: dashboard.tenantId,
                          status: "confirmed",
                          observedOutcome:
                            outcome.observedOutcome ||
                            "Confirmed via Outcomes admin",
                          evidence: ["Admin confirmation"],
                        });
                        router.refresh();
                      });
                    }}
                  >
                    Confirm outcome
                  </button>
                ) : null}
              </li>
            ))
          )}
        </ul>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card padding="md">
          <SectionHeader
            title="Scenario contribution"
            description="Which scenarios produce outcomes."
          />
          <ul className="mt-3 space-y-1 text-sm">
            {analytics.scenarioContribution.length === 0 ? (
              <li className="text-[var(--eos-text-secondary)]">
                No scenario-linked outcomes yet.
              </li>
            ) : (
              analytics.scenarioContribution.map((s) => (
                <li key={s.scenarioId} className="flex justify-between">
                  <span className="text-[var(--eos-text-secondary)]">
                    {s.scenarioId}
                  </span>
                  <span>
                    {s.confirmed}/{s.outcomes} confirmed
                  </span>
                </li>
              ))
            )}
          </ul>
        </Card>

        <Card padding="md">
          <SectionHeader
            title="Recent actions"
            description={decisionImpact.explanation}
          />
          <ul className="mt-3 space-y-2 text-sm">
            {dashboard.recentActions.length === 0 ? (
              <li className="text-[var(--eos-text-secondary)]">
                No executive actions captured yet.
              </li>
            ) : (
              dashboard.recentActions.map((a) => (
                <li key={a.id} className="text-[var(--eos-text-secondary)]">
                  {a.label}
                </li>
              ))
            )}
          </ul>
        </Card>
      </div>

      {reportMarkdown ? (
        <Card padding="md">
          <SectionHeader
            title="Pilot success report"
            description="Shareable evidence of executive value."
          />
          <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap text-xs text-[var(--eos-text-muted)]">
            {reportMarkdown}
          </pre>
        </Card>
      ) : null}

      <Card padding="md">
        <SectionHeader title="ROI assumptions" description={roi.explanation} />
        <ul className="mt-3 space-y-1 text-xs text-[var(--eos-text-muted)]">
          {roi.assumptions.map((a) => (
            <li key={a}>• {a}</li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
