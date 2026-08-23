"use client";

import { PageHeader } from "@/components/ui/page-header";
import { MetricCard } from "@/components/ui/metric-card";
import { ResponsiveGrid } from "@/components/ui/responsive-grid";
import { StatusBadge } from "@/components/ui/status-badge";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import type { StrategyDashboard } from "@/strategy";

type Props = {
  dashboard: StrategyDashboard;
};

export function StrategicOutcomesDashboard({ dashboard }: Props) {
  const { outcomes, initiatives, progress, validation, alignment, roadmaps } =
    dashboard;

  return (
    <div className="space-y-8">
      <PageHeader
        overline="Administration"
        title="Strategic Outcomes"
        description="Trace every recommendation and decision to the strategic outcomes the organisation is trying to achieve. Optimise for strategic progress, not activity."
      />

      <ResponsiveGrid columns={4}>
        <MetricCard label="Outcomes" value={outcomes.length} />
        <MetricCard
          label="Overall progress"
          value={`${progress.overallProgressPct}%`}
        />
        <MetricCard
          label="Rec. contribution"
          value={`${validation.recommendationContribution}%`}
        />
        <MetricCard
          label="Strategy confidence"
          value={validation.confidence}
          hint="/100"
        />
      </ResponsiveGrid>

      <Card padding="md">
        <SectionHeader
          title="Outcome health"
          description={progress.explanation}
        />
        <ul className="mt-3 space-y-3">
          {outcomes.length === 0 ? (
            <li className="text-sm text-[var(--eos-text-secondary)]">
              No strategic outcomes yet. Capture three in Executive Discovery.
            </li>
          ) : (
            outcomes.map((outcome) => {
              const row = progress.outcomes.find(
                (o) => o.outcomeId === outcome.id,
              );
              return (
                <li
                  key={outcome.id}
                  className="rounded border border-[var(--eos-border)] p-3"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-[var(--eos-text)]">
                      {outcome.name}
                    </p>
                    <StatusBadge
                      label={outcome.currentHealth.replace(/_/g, " ")}
                      variant={
                        outcome.currentHealth === "on_track" ||
                        outcome.currentHealth === "achieved"
                          ? "success"
                          : outcome.currentHealth === "at_risk" ||
                              outcome.currentHealth === "off_track"
                            ? "danger"
                            : "warning"
                      }
                    />
                    <span className="text-xs text-[var(--eos-text-muted)]">
                      Owner: {outcome.executiveOwner}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[var(--eos-text-secondary)]">
                    {outcome.description}
                  </p>
                  <p className="mt-1 text-xs text-[var(--eos-text-muted)]">
                    Progress {row?.progressPct ?? 0}% · Confidence{" "}
                    {outcome.confidence}% · Importance{" "}
                    {outcome.strategicImportance}
                    {outcome.evidence[0] ? ` · ${outcome.evidence[0]}` : ""}
                  </p>
                </li>
              );
            })
          )}
        </ul>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card padding="md">
          <SectionHeader
            title="Initiatives"
            description="Linked execution against strategic outcomes."
          />
          <ul className="mt-3 space-y-2 text-sm">
            {initiatives.length === 0 ? (
              <li className="text-[var(--eos-text-secondary)]">
                No initiatives linked yet.
              </li>
            ) : (
              initiatives.map((i) => (
                <li key={i.id} className="flex justify-between gap-2">
                  <span>
                    <span className="font-medium text-[var(--eos-text)]">
                      {i.name}
                    </span>
                    <span className="block text-xs text-[var(--eos-text-muted)]">
                      {i.status} · {i.progressPct}% · {i.owner}
                    </span>
                  </span>
                  <StatusBadge
                    label={
                      alignment.driftingInitiatives.some((d) => d.id === i.id)
                        ? "drifting"
                        : i.status
                    }
                    variant={
                      alignment.driftingInitiatives.some((d) => d.id === i.id)
                        ? "warning"
                        : "neutral"
                    }
                  />
                </li>
              ))
            )}
          </ul>
        </Card>

        <Card padding="md">
          <SectionHeader
            title="Recommendation alignment"
            description={alignment.explanation}
          />
          <ul className="mt-3 space-y-2 text-sm">
            {alignment.recommendationAlignments.length === 0 ? (
              <li className="text-[var(--eos-text-secondary)]">
                No recommendation alignments in this view.
              </li>
            ) : (
              alignment.recommendationAlignments.slice(0, 8).map((link) => (
                <li key={link.id}>
                  <p className="font-medium text-[var(--eos-text)]">
                    {link.recommendationTitle}
                  </p>
                  <p className="text-xs text-[var(--eos-text-muted)]">
                    → {link.outcomeName} · ~{link.estimatedContribution}% · conf{" "}
                    {link.confidence}%
                  </p>
                </li>
              ))
            )}
          </ul>
        </Card>
      </div>

      <Card padding="md">
        <SectionHeader
          title="Validation"
          description={validation.explanation}
        />
        <ResponsiveGrid columns={4}>
          <MetricCard
            label="Outcome progress"
            value={`${validation.outcomeProgress}%`}
          />
          <MetricCard
            label="Initiative health"
            value={`${validation.initiativeHealth}%`}
          />
          <MetricCard
            label="Decisions linked"
            value={validation.executiveDecisionsLinked}
          />
          <MetricCard
            label="Business outcomes"
            value={validation.businessOutcomesLinked}
          />
        </ResponsiveGrid>
      </Card>

      <Card padding="md">
        <SectionHeader
          title="Roadmap"
          description="Now / next / later relative to strategic outcomes."
        />
        <ul className="mt-3 space-y-1 text-sm">
          {roadmaps.map((item) => (
            <li key={item.id} className="flex justify-between gap-2">
              <span className="text-[var(--eos-text)]">{item.title}</span>
              <span className="text-xs text-[var(--eos-text-muted)]">
                {item.horizon} · {item.status}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
