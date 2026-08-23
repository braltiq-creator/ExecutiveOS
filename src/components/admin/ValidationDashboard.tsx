"use client";

import { PageHeader } from "@/components/ui/page-header";
import { MetricCard } from "@/components/ui/metric-card";
import { ResponsiveGrid } from "@/components/ui/responsive-grid";
import { StatusBadge } from "@/components/ui/status-badge";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import type { DesignPartnerDashboard, ExplainedScore } from "@/validation";

type ValidationDashboardProps = {
  dashboard: DesignPartnerDashboard;
};

function trendVariant(
  trend?: "up" | "flat" | "down",
): "success" | "warning" | "danger" | "neutral" {
  if (trend === "up") return "success";
  if (trend === "down") return "danger";
  if (trend === "flat") return "warning";
  return "neutral";
}

function ScoreBlock({ score }: { score: ExplainedScore }) {
  return (
    <Card padding="md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[var(--eos-text)]">
            {score.label}
          </p>
          <p className="mt-1 text-xs leading-5 text-[var(--eos-text-secondary)]">
            {score.explanation}
          </p>
        </div>
        <div className="text-right">
          <p className="font-display text-2xl font-semibold tracking-tight text-[var(--eos-text)]">
            {score.score}
          </p>
          {score.trend ? (
            <StatusBadge
              label={score.trend}
              variant={trendVariant(score.trend)}
            />
          ) : null}
        </div>
      </div>
      {score.gaps.length > 0 ? (
        <ul className="mt-3 space-y-1">
          {score.gaps.slice(0, 3).map((gap) => (
            <li
              key={gap}
              className="text-xs leading-5 text-[var(--eos-text-muted)]"
            >
              {gap}
            </li>
          ))}
        </ul>
      ) : null}
    </Card>
  );
}

export function ValidationDashboard({ dashboard }: ValidationDashboardProps) {
  const maturityComponents = Object.values(dashboard.maturity.components).filter(
    (c) => c.id !== "overall",
  );

  return (
    <div className="space-y-8">
      <PageHeader
        overline="Administration"
        title="Validation"
        description="How accurately ExecutiveOS understands the organisation — confidence, coverage, and daily improvement."
      />

      <ResponsiveGrid columns={4}>
        <MetricCard
          label="Executive Intelligence"
          value={dashboard.executiveIntelligenceScore.score}
          hint={dashboard.executiveIntelligenceScore.trend ?? "score"}
        />
        <MetricCard
          label="Organisation coverage"
          value={`${dashboard.organisationCoverage.score}%`}
        />
        <MetricCard
          label="Recommendation usefulness"
          value={`${dashboard.recommendationQuality.usefulnessPct}%`}
        />
        <MetricCard
          label="Learning trend"
          value={dashboard.learningTrend}
        />
      </ResponsiveGrid>

      <section className="space-y-3">
        <SectionHeader title="Platform maturity" />
        <ResponsiveGrid columns={2}>
          <ScoreBlock score={dashboard.executiveIntelligenceScore} />
          <ScoreBlock score={dashboard.connectorHealth} />
        </ResponsiveGrid>
      </section>

      <section className="space-y-3">
        <SectionHeader title="Executive Maturity Model" />
        <ResponsiveGrid columns={2}>
          {maturityComponents.map((component) => (
            <ScoreBlock key={component.id} score={component} />
          ))}
        </ResponsiveGrid>
      </section>

      <section className="space-y-3">
        <SectionHeader title="Discovery coverage" />
        <Card padding="md">
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {dashboard.coverage.dimensions.map((dim) => (
              <li key={dim.id} className="text-sm">
                <p className="font-medium text-[var(--eos-text)]">{dim.label}</p>
                <p className="mt-1 text-xs text-[var(--eos-text-muted)]">
                  {dim.discovered} of ~{dim.estimated} · {dim.coveragePct}%
                </p>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <section className="space-y-3">
        <SectionHeader title="Connector health" />
        <ResponsiveGrid columns={2}>
          {dashboard.providers.providers.map((provider) => (
            <Card key={provider.providerId} padding="md">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--eos-text)]">
                    {provider.label}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[var(--eos-text-secondary)]">
                    {provider.explanation}
                  </p>
                </div>
                <StatusBadge
                  label={provider.status}
                  variant={
                    provider.status === "healthy"
                      ? "success"
                      : provider.status === "degraded"
                        ? "warning"
                        : "danger"
                  }
                />
              </div>
            </Card>
          ))}
        </ResponsiveGrid>
      </section>

      <section className="space-y-3">
        <SectionHeader title="Knowledge Graph & profile" />
        <ResponsiveGrid columns={2}>
          <Card padding="md">
            <p className="text-sm font-semibold text-[var(--eos-text)]">
              Knowledge Graph
            </p>
            <p className="mt-1 text-xs text-[var(--eos-text-secondary)]">
              {dashboard.graphHealth.explanation}
            </p>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-[var(--eos-text-muted)]">
              <div>Entities {dashboard.graphHealth.entities}</div>
              <div>Relationships {dashboard.graphHealth.relationships}</div>
              <div>Growth +{dashboard.graphHealth.growth}</div>
              <div>Confidence {dashboard.graphHealth.confidence}%</div>
            </dl>
          </Card>
          <Card padding="md">
            <p className="text-sm font-semibold text-[var(--eos-text)]">
              Executive profile
            </p>
            <p className="mt-1 text-xs text-[var(--eos-text-secondary)]">
              {dashboard.profileHealth.explanation}
            </p>
            <dl className="mt-3 space-y-1 text-xs text-[var(--eos-text-muted)]">
              <div>Decision style — {dashboard.profileHealth.decisionStyle}</div>
              <div>Risk — {dashboard.profileHealth.riskProfile}</div>
              <div>
                Briefing confidence {dashboard.profileHealth.briefingConfidence}%
              </div>
            </dl>
          </Card>
        </ResponsiveGrid>
      </section>

      <section className="space-y-3">
        <SectionHeader title="Daily improvements" />
        <Card padding="md">
          <ul className="space-y-2">
            {dashboard.dailyImprovements.map((item) => (
              <li
                key={item}
                className="text-sm text-[var(--eos-text-secondary)]"
              >
                {item}
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <section className="space-y-3">
        <SectionHeader title="Outstanding validation requests" />
        <Card padding="md">
          {dashboard.outstandingValidationRequests.length === 0 ? (
            <p className="text-sm text-[var(--eos-text-muted)]">
              No outstanding validation requests.
            </p>
          ) : (
            <ul className="space-y-3">
              {dashboard.outstandingValidationRequests.map((req) => (
                <li key={req.id} className="text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-[var(--eos-text)]">
                      {req.label}
                    </p>
                    <StatusBadge
                      label={req.priority}
                      variant={
                        req.priority === "high"
                          ? "danger"
                          : req.priority === "medium"
                            ? "warning"
                            : "neutral"
                      }
                    />
                  </div>
                  <p className="mt-1 text-xs text-[var(--eos-text-muted)]">
                    {req.reason} · confidence {req.confidence}%
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>

      <section className="space-y-3">
        <SectionHeader title="Success metrics" />
        <ResponsiveGrid columns={4}>
          <MetricCard
            label="Time to first brief"
            value={
              dashboard.successMetrics.timeToFirstBriefSeconds != null
                ? `${Math.round(dashboard.successMetrics.timeToFirstBriefSeconds / 60)}m`
                : "—"
            }
          />
          <MetricCard
            label="Days to 80% understanding"
            value={
              dashboard.successMetrics.timeTo80PctUnderstandingDays ?? "—"
            }
          />
          <MetricCard
            label="Connector uptime"
            value={`${dashboard.successMetrics.connectorUptimePct}%`}
          />
          <MetricCard
            label="Learning velocity"
            value={dashboard.successMetrics.learningVelocity}
          />
        </ResponsiveGrid>
      </section>

      <section className="space-y-3">
        <SectionHeader title="Learning history (14 days)" />
        <Card padding="md">
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {dashboard.history.daily.slice(-8).map((point) => (
              <li
                key={point.at}
                className="rounded-lg border border-[var(--eos-border)] px-3 py-2 text-xs"
              >
                <p className="text-[var(--eos-text-muted)]">
                  {new Date(point.at).toLocaleDateString()}
                </p>
                <p className="mt-1 font-medium text-[var(--eos-text)]">
                  Score {point.overallScore}
                </p>
                <p className="text-[var(--eos-text-muted)]">
                  Coverage {point.organisationCoverage}% · KG{" "}
                  {point.knowledgeGraphEntities}
                </p>
              </li>
            ))}
          </ul>
        </Card>
      </section>
    </div>
  );
}
