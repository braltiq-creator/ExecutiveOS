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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { acknowledgeAlertAction } from "@/operations/actions";
import type {
  HealthState,
  OperationsCentreDashboard,
  TrafficLight,
} from "@/operations";

type Props = {
  dashboard: OperationsCentreDashboard;
};

function lightVariant(
  light: TrafficLight,
): "success" | "warning" | "danger" {
  if (light === "green") return "success";
  if (light === "amber") return "warning";
  return "danger";
}

function healthVariant(
  state: HealthState,
): "success" | "warning" | "danger" | "neutral" {
  if (state === "healthy") return "success";
  if (state === "degraded") return "warning";
  if (state === "critical") return "danger";
  return "neutral";
}

function Light({ value }: { value: TrafficLight }) {
  return (
    <StatusBadge
      label={value}
      variant={lightVariant(value)}
    />
  );
}

export function OperationsCentreDashboardView({ dashboard }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const { analytics, partners, openAlerts, supportPatterns, healthByTenant } =
    dashboard;
  const ex = dashboard.excellence;

  return (
    <div className="space-y-8">
      <PageHeader
        overline="Administration → Operations"
        title="Operational Excellence"
        description="Braltiq-only observability across platform health, providers, commercial performance, customer health, releases, and incidents. Core intelligence unchanged. No customer business data."
      />

      <ResponsiveGrid columns={4}>
        <MetricCard
          label="Platform health"
          value={ex.platform.overall}
          hint={`${ex.platform.uptimePct}% uptime`}
        />
        <MetricCard
          label="MRR"
          value={`$${ex.commercial.mrr.toLocaleString()}`}
          hint={`ARR $${ex.commercial.arr.toLocaleString()}`}
        />
        <MetricCard
          label="Portfolio EVS"
          value={ex.valueHealth.portfolioEvs}
          hint={ex.valueHealth.state}
        />
        <MetricCard
          label="Critical alerts"
          value={ex.criticalAlerts.length}
          hint={`${ex.openIncidents.length} open incidents`}
        />
      </ResponsiveGrid>

      <Card padding="md">
        <SectionHeader
          title="Platform health"
          description={ex.platform.explanation}
        />
        <ResponsiveGrid columns={4}>
          {ex.platform.components.map((c) => (
            <div key={c.id} className="space-y-1">
              <MetricCard
                label={c.label}
                value={c.latencyMs != null ? `${c.latencyMs}ms` : c.state}
                hint={c.message}
              />
              <StatusBadge label={c.state} variant={healthVariant(c.state)} />
            </div>
          ))}
        </ResponsiveGrid>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card padding="md">
          <SectionHeader
            title="Provider status"
            description="Notify before customer impact."
          />
          <ul className="mt-3 space-y-3">
            {ex.providers.map((p) => (
              <li
                key={p.providerId}
                className="rounded border border-[var(--eos-border)] p-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge
                    label={p.state}
                    variant={healthVariant(p.state)}
                  />
                  <span className="text-sm font-medium">{p.label}</span>
                  {p.notifyBeforeImpact ? (
                    <StatusBadge label="pre-impact" variant="warning" />
                  ) : null}
                </div>
                <p className="mt-1 text-xs text-[var(--eos-text-muted)]">
                  {p.explanation}
                </p>
              </li>
            ))}
          </ul>
        </Card>

        <Card padding="md">
          <SectionHeader
            title="Commercial metrics"
            description={ex.commercial.explanation}
          />
          <ResponsiveGrid columns={2}>
            <MetricCard label="Churn" value={`${ex.commercial.churnPct}%`} />
            <MetricCard
              label="Activation"
              value={`${ex.commercial.activationRatePct}%`}
            />
            <MetricCard
              label="CLV"
              value={`$${ex.commercial.customerLifetimeValue.toLocaleString()}`}
            />
            <MetricCard
              label="Expansion $"
              value={`$${ex.commercial.expansionRevenue.toLocaleString()}`}
            />
          </ResponsiveGrid>
          {ex.commercial.revenueByProfile.length > 0 ? (
            <ul className="mt-3 space-y-1 text-sm">
              {ex.commercial.revenueByProfile.map((row) => (
                <li key={row.profileId}>
                  {row.label}: ${row.mrr.toLocaleString()} MRR
                </li>
              ))}
            </ul>
          ) : null}
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card padding="md">
          <SectionHeader
            title="Customer health"
            description={ex.customerHealth.explanation}
          />
          <ResponsiveGrid columns={2}>
            <MetricCard
              label="TTFV (median)"
              value={`${ex.customerHealth.medianTimeToFirstValueMinutes}m`}
            />
            <MetricCard
              label="Engagement"
              value={`${ex.customerHealth.engagementIndex}%`}
            />
            <MetricCard
              label="Rec. adoption"
              value={`${ex.customerHealth.recommendationAdoptionPct}%`}
            />
            <MetricCard
              label="Renewal risks"
              value={ex.customerHealth.renewalRiskCount}
            />
          </ResponsiveGrid>
          {ex.customerHealth.interventions.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {ex.customerHealth.interventions.slice(0, 5).map((item) => (
                <li key={item.tenantId} className="text-sm">
                  <span className="font-medium">{item.companyName}</span>
                  <span className="text-[var(--eos-text-muted)]">
                    {" "}
                    — {item.reason}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </Card>

        <Card padding="md">
          <SectionHeader
            title="Deployment status"
            description={ex.releases.explanation}
          />
          <ResponsiveGrid columns={2}>
            <MetricCard
              label="Version"
              value={ex.deploymentStatus.version}
              hint={
                ex.deploymentStatus.rollbackReady
                  ? "Rollback ready"
                  : "Rollback not ready"
              }
            />
            <MetricCard
              label="Open incidents"
              value={ex.openIncidents.length}
            />
          </ResponsiveGrid>
          <ul className="mt-3 space-y-2 text-sm">
            {ex.releases.featureFlags.map((flag) => (
              <li key={flag.id} className="flex items-center gap-2">
                <StatusBadge
                  label={flag.enabled ? "on" : "off"}
                  variant={flag.enabled ? "success" : "neutral"}
                />
                {flag.name}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card padding="md">
          <SectionHeader
            title="Critical alerts"
            description="Configurable thresholds — platform, providers, commercial, value."
          />
          <ul className="mt-3 space-y-3">
            {ex.criticalAlerts.length === 0 ? (
              <li className="text-sm text-[var(--eos-text-secondary)]">
                No critical platform alerts.
              </li>
            ) : (
              ex.criticalAlerts.slice(0, 8).map((alert) => (
                <li
                  key={alert.id}
                  className="rounded border border-[var(--eos-border)] p-3"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge
                      label={alert.severity}
                      variant={
                        alert.severity === "critical" || alert.severity === "high"
                          ? "danger"
                          : "warning"
                      }
                    />
                    <span className="text-sm font-medium">{alert.title}</span>
                  </div>
                  <p className="mt-1 text-xs text-[var(--eos-text-muted)]">
                    {alert.detail}
                  </p>
                </li>
              ))
            )}
          </ul>
        </Card>

        <Card padding="md">
          <SectionHeader
            title="Open incidents"
            description="Severity, timeline, provider linkage, post-incident learning."
          />
          <ul className="mt-3 space-y-3">
            {ex.openIncidents.length === 0 ? (
              <li className="text-sm text-[var(--eos-text-secondary)]">
                No open incidents.
              </li>
            ) : (
              ex.openIncidents.map((inc) => (
                <li
                  key={inc.id}
                  className="rounded border border-[var(--eos-border)] p-3 text-sm"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge label={inc.severity} variant="danger" />
                    <StatusBadge label={inc.status} variant="warning" />
                    <span className="font-medium">{inc.title}</span>
                  </div>
                  <p className="mt-1 text-xs text-[var(--eos-text-muted)]">
                    {inc.timeline[inc.timeline.length - 1]?.note}
                    {inc.providerId ? ` · Provider ${inc.providerId}` : ""}
                  </p>
                </li>
              ))
            )}
          </ul>
        </Card>
      </div>

      <SectionHeader
        title="Design Partner portfolio"
        description="Partner-level adoption, engagement, and health (existing Operations Centre)."
      />

      <ResponsiveGrid columns={4}>
        <MetricCard label="Partners" value={analytics.partnerCount} />
        <MetricCard
          label="Avg readiness"
          value={analytics.averageReadiness}
          hint="/100"
        />
        <MetricCard
          label="Avg engagement"
          value={`${analytics.averageEngagement}%`}
        />
        <MetricCard
          label="Partner alerts"
          value={openAlerts.length}
        />
      </ResponsiveGrid>

      <ResponsiveGrid columns={4}>
        <MetricCard
          label="Completion rate"
          value={`${analytics.pilotCompletionRate}%`}
        />
        <MetricCard
          label="Avg intelligence"
          value={analytics.averageIntelligenceScore}
        />
        <MetricCard
          label="Provider reliability"
          value={`${analytics.providerReliability}%`}
        />
        <MetricCard
          label="Rec. performance"
          value={`${analytics.recommendationPerformance}%`}
        />
      </ResponsiveGrid>

      {analytics.strugglingPartners.length > 0 ? (
        <Card padding="md">
          <SectionHeader
            title="Needs attention"
            description="Partners identified early for CS intervention."
          />
          <ul className="mt-3 space-y-2">
            {analytics.strugglingPartners.map((p) => (
              <li
                key={p.tenantId}
                className="flex flex-wrap items-center justify-between gap-2 text-sm"
              >
                <span className="font-medium text-[var(--eos-text)]">
                  {p.companyName}
                </span>
                <StatusBadge
                  label={`Health ${p.healthScore}`}
                  variant="danger"
                />
                <span className="w-full text-xs text-[var(--eos-text-muted)]">
                  {p.reason}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <Card padding="md">
        <SectionHeader
          title="Design Partner portfolio"
          description="Traffic-light health across every pilot organisation."
        />
        {partners.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--eos-text-secondary)]">
            No pilots yet. Provision partners from Administration → Pilots.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Profile</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Readiness</TableHead>
                  <TableHead>Intelligence</TableHead>
                  <TableHead>Active execs</TableHead>
                  <TableHead>Providers</TableHead>
                  <TableHead>KG growth</TableHead>
                  <TableHead>Rec. accuracy</TableHead>
                  <TableHead>Validation</TableHead>
                  <TableHead>Health</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {partners.map((p) => (
                  <TableRow key={p.tenantId}>
                    <TableCell>
                      <div className="font-medium">{p.companyName}</div>
                      <div className="text-xs text-[var(--eos-text-muted)]">
                        {p.industry}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">
                      {p.intelligenceProfileId.replace(/_/g, " ")}
                    </TableCell>
                    <TableCell className="text-xs">
                      {p.pilotStage.replace(/_/g, " ")}
                    </TableCell>
                    <TableCell>
                      <Light value={p.trafficLights.readiness} />{" "}
                      <span className="text-xs">{p.readinessScore}</span>
                    </TableCell>
                    <TableCell>
                      <Light value={p.trafficLights.intelligence} />{" "}
                      <span className="text-xs">
                        {p.executiveIntelligenceScore}
                      </span>
                    </TableCell>
                    <TableCell>{p.activeExecutives}</TableCell>
                    <TableCell>
                      <Light value={p.providerStatus} />
                    </TableCell>
                    <TableCell>{p.knowledgeGraphGrowth}</TableCell>
                    <TableCell>{p.recommendationAccuracy}%</TableCell>
                    <TableCell>{p.validationProgress}%</TableCell>
                    <TableCell>
                      <Light value={p.overallHealth} />{" "}
                      <span className="text-xs">{p.overallHealthScore}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card padding="md">
          <SectionHeader
            title="Alerts"
            description="Acknowledge and track operational signals."
          />
          <ul className="mt-3 space-y-3">
            {openAlerts.length === 0 ? (
              <li className="text-sm text-[var(--eos-text-secondary)]">
                No open alerts.
              </li>
            ) : (
              openAlerts.slice(0, 10).map((alert) => (
                <li
                  key={alert.id}
                  className="rounded border border-[var(--eos-border)] p-3"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge
                      label={alert.severity}
                      variant={
                        alert.severity === "critical" || alert.severity === "high"
                          ? "danger"
                          : "warning"
                      }
                    />
                    <span className="text-sm font-medium text-[var(--eos-text)]">
                      {alert.title}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[var(--eos-text-muted)]">
                    {alert.detail}
                  </p>
                  <button
                    type="button"
                    disabled={pending}
                    className="mt-2 text-xs font-medium text-[var(--eos-text)] underline disabled:opacity-50"
                    onClick={() => {
                      startTransition(async () => {
                        await acknowledgeAlertAction({
                          id: alert.id,
                          by: "ops-centre",
                        });
                        router.refresh();
                      });
                    }}
                  >
                    Acknowledge
                  </button>
                </li>
              ))
            )}
          </ul>
        </Card>

        <Card padding="md">
          <SectionHeader
            title="Support patterns"
            description="Recurring issues across the portfolio."
          />
          <ul className="mt-3 space-y-3">
            {supportPatterns.length === 0 ? (
              <li className="text-sm text-[var(--eos-text-secondary)]">
                No recurring patterns detected.
              </li>
            ) : (
              supportPatterns.map((pattern) => (
                <li key={pattern.id} className="text-sm">
                  <div className="flex items-center gap-2">
                    <StatusBadge
                      label={pattern.severity}
                      variant={
                        pattern.severity === "critical" ? "danger" : "warning"
                      }
                    />
                    <span className="font-medium">{pattern.pattern}</span>
                  </div>
                  <p className="mt-1 text-xs text-[var(--eos-text-muted)]">
                    {pattern.occurrences} occurrences · {pattern.recommendation}
                  </p>
                </li>
              ))
            )}
          </ul>
        </Card>
      </div>

      {partners.map((p) => {
        const health = healthByTenant[p.tenantId];
        if (!health) return null;
        return (
          <Card key={`health-${p.tenantId}`} padding="md">
            <SectionHeader
              title={`${p.companyName} — pilot health`}
              description={health.overall.explanation}
            />
            <ResponsiveGrid columns={4}>
              {health.components.slice(0, 8).map((c) => (
                <div key={c.id} className="space-y-1">
                  <MetricCard
                    label={c.label}
                    value={c.score}
                    hint={c.explanation}
                  />
                  <Light value={c.trafficLight} />
                </div>
              ))}
            </ResponsiveGrid>
            <p className="mt-3 text-xs text-[var(--eos-text-muted)]">
              Last executive login: {p.lastExecutiveLoginAt ?? "—"} · Success
              probability {health.successProbability.score}/100
            </p>
          </Card>
        );
      })}

      <Card padding="md">
        <SectionHeader
          title="Customer health trends"
          description={analytics.explanation}
        />
        <ul className="mt-3 space-y-2">
          {analytics.customerHealthTrends.map((row) => (
            <li
              key={row.tenantId}
              className="flex flex-wrap items-center gap-3 text-sm"
            >
              <span className="min-w-[10rem] font-medium">{row.companyName}</span>
              <Light value={row.trafficLight} />
              <span>{row.healthScore}</span>
              <StatusBadge label={row.trend} variant="neutral" />
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
