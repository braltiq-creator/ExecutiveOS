"use client";

import type { AdaptiveDashboard } from "@/adaptive";
import { PageHeader } from "@/components/ui/page-header";

type Props = {
  dashboard: AdaptiveDashboard;
};

export function AdaptiveIntelligenceDashboard({ dashboard }: Props) {
  return (
    <div className="space-y-10">
      <PageHeader
        overline="Administration"
        title="Adaptive Intelligence"
        description="Explainable learning that refines presentation and prioritisation — Core intelligence unchanged."
      />

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Learning health" value={`${dashboard.learningHealth}%`} />
        <Metric
          label="Adaptive confidence"
          value={`${dashboard.adaptiveConfidence}%`}
        />
        <Metric
          label="Personalisation active"
          value={String(dashboard.personalisationActive)}
        />
        <Metric
          label="Benchmark participants"
          value={String(dashboard.benchmarkParticipants)}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">
          Adaptive profiles
        </h2>
        <ul className="space-y-2">
          {dashboard.profiles.map((profile) => (
            <li
              key={profile.id}
              className="rounded-lg border border-border px-3 py-2.5"
            >
              <p className="font-medium">
                {profile.executiveId} ·{" "}
                {profile.enabled ? "learning on" : "disabled"}
              </p>
              <p className="mt-1 text-sm text-secondary">
                Acceptance {profile.recommendationAcceptanceRate}% · Detail{" "}
                {profile.preferredDetailLevel} · Confidence threshold{" "}
                {profile.preferredConfidenceThreshold}% · Learning{" "}
                {profile.learningConfidence}%
              </p>
              <p className="mt-1 text-xs text-muted">
                {profile.explanations[0]}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-3">
          <h2 className="text-lg font-semibold tracking-tight">
            Recommendation evolution
          </h2>
          <ul className="space-y-2">
            {dashboard.recommendationEvolution.slice(0, 8).map((rec) => (
              <li
                key={`${rec.tenantId}-${rec.recommendationId}`}
                className="rounded-lg border border-border px-3 py-2.5"
              >
                <p className="font-medium text-sm">{rec.recommendationId}</p>
                <p className="mt-1 text-sm text-secondary">
                  Boost {rec.priorityBoost} · Conf Δ {rec.confidenceAdjust} ·{" "}
                  {rec.presentationHint}
                </p>
                <p className="mt-1 text-xs text-muted">{rec.explanation}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold tracking-tight">
            Benchmark participation
          </h2>
          <ul className="space-y-2">
            {dashboard.benchmarks.map((b) => (
              <li
                key={b.metricId}
                className="rounded-lg border border-border px-3 py-2.5"
              >
                <p className="font-medium text-sm">{b.label}</p>
                <p className="mt-1 text-sm text-secondary">
                  Percentile {b.percentile} · {b.band.replace(/_/g, " ")}
                </p>
                <p className="mt-1 text-xs text-muted">{b.explanation}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">
          Improvement opportunities
        </h2>
        <ul className="space-y-2">
          {dashboard.improvements.map((item) => (
            <li
              key={item.id}
              className="rounded-lg border border-border px-3 py-2.5"
            >
              <p className="text-xs uppercase tracking-wide text-muted">
                {item.kind.replace(/_/g, " ")} · {item.confidence}%
                {item.feedToProductIntelligence ? " · product feed" : ""}
              </p>
              <p className="mt-1 font-medium">{item.title}</p>
              <p className="mt-1 text-sm text-secondary">{item.detail}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">
          Value learning confidence
        </h2>
        <ul className="space-y-2">
          {dashboard.valueLearning.length === 0 ? (
            <li className="text-sm text-secondary">
              No value learning snapshots yet.
            </li>
          ) : (
            dashboard.valueLearning.map((v) => (
              <li
                key={v.tenantId}
                className="rounded-lg border border-border px-3 py-2.5"
              >
                <p className="font-medium">
                  Accuracy {v.estimatedValueAccuracy}% · ROI confirms{" "}
                  {v.confirmedRoiCount}
                </p>
                <p className="mt-1 text-sm text-secondary">{v.explanation}</p>
                <p className="mt-1 text-xs text-muted">
                  Trend points: {v.confidenceTrend.length}
                </p>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}
