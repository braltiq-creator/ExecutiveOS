"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { MetricCard } from "@/components/ui/metric-card";
import { ResponsiveGrid } from "@/components/ui/responsive-grid";
import { StatusBadge } from "@/components/ui/status-badge";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { PilotProvisionForm } from "@/components/admin/PilotProvisionForm";
import { advancePilotStageAction } from "@/pilot/actions";
import { PILOT_LIFECYCLE_STAGES } from "@/pilot/types";
import type {
  PilotExportDocument,
  PilotHealthSnapshot,
  PilotPlaybook,
  PilotRecord,
  SupportGuidance,
} from "@/pilot";

type PilotDashboardRow = {
  pilot: PilotRecord;
  health: PilotHealthSnapshot;
  playbook: PilotPlaybook;
  support: SupportGuidance;
  exports: PilotExportDocument[];
};

type PilotReadinessDashboardProps = {
  rows: PilotDashboardRow[];
};

function severityVariant(
  severity: "critical" | "high" | "moderate" | "low",
): "danger" | "warning" | "neutral" | "success" {
  if (severity === "critical") return "danger";
  if (severity === "high") return "warning";
  if (severity === "moderate") return "neutral";
  return "success";
}

function stageLabel(stage: string): string {
  return stage.replace(/_/g, " ");
}

export function PilotReadinessDashboard({ rows }: PilotReadinessDashboardProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const avgReadiness =
    rows.length === 0
      ? 0
      : Math.round(
          rows.reduce((sum, r) => sum + r.health.readiness.overall, 0) /
            rows.length,
        );
  const criticalCount = rows.reduce(
    (sum, r) =>
      sum + r.health.diagnostics.filter((d) => d.severity === "critical").length,
    0,
  );

  return (
    <div className="space-y-8">
      <PageHeader
        overline="Administration"
        title="Pilot Readiness"
        description="Provision Design Partners, track lifecycle, readiness score, diagnostics, and playbooks for implementation teams."
      />

      <ResponsiveGrid columns={4}>
        <MetricCard label="Active pilots" value={rows.length} />
        <MetricCard label="Avg readiness" value={avgReadiness} hint="/100" />
        <MetricCard label="Critical diagnostics" value={criticalCount} />
        <MetricCard
          label="Ready for Active Pilot"
          value={rows.filter((r) => r.health.readiness.readyForActivePilot).length}
        />
      </ResponsiveGrid>

      <PilotProvisionForm />

      {rows.length === 0 ? (
        <Card padding="md">
          <p className="text-sm text-[var(--eos-text-secondary)]">
            No Design Partner pilots yet. Provision one above to begin the
            lifecycle.
          </p>
        </Card>
      ) : null}

      {rows.map(({ pilot, health, playbook, support, exports: docs }) => (
        <div key={pilot.id} className="space-y-4">
          <Card padding="md">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <SectionHeader
                  title={pilot.partnerName}
                  description={`${pilot.industry} · ${pilot.intelligenceProfileId.replace(/_/g, " ")} · ${pilot.tenantId}`}
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  <StatusBadge
                    label={stageLabel(pilot.stage)}
                    variant="neutral"
                  />
                  <StatusBadge
                    label={`Readiness ${health.readiness.overall}`}
                    variant={
                      health.readiness.readyForActivePilot
                        ? "success"
                        : "warning"
                    }
                  />
                  <StatusBadge
                    label={`${health.providersHealthy}/${health.providersRequired} providers`}
                    variant={
                      health.providersHealthy === health.providersRequired
                        ? "success"
                        : "warning"
                    }
                  />
                </div>
              </div>
              <label className="text-sm">
                <span className="text-[var(--eos-text-secondary)]">
                  Advance stage
                </span>
                <select
                  className="mt-1 block rounded border border-[var(--eos-border)] bg-[var(--eos-surface)] px-3 py-2 text-[var(--eos-text)]"
                  disabled={pending}
                  value={pilot.stage}
                  onChange={(e) => {
                    const stage = e.target.value as (typeof PILOT_LIFECYCLE_STAGES)[number];
                    startTransition(async () => {
                      await advancePilotStageAction({
                        pilotId: pilot.id,
                        stage,
                        note: `Advanced via admin dashboard`,
                      });
                      router.refresh();
                    });
                  }}
                >
                  {PILOT_LIFECYCLE_STAGES.map((stage) => (
                    <option key={stage} value={stage}>
                      {stageLabel(stage)}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <p className="mt-3 text-sm text-[var(--eos-text-secondary)]">
              {health.readiness.explanation}
            </p>
          </Card>

          <ResponsiveGrid columns={4}>
            {health.readiness.components.slice(0, 4).map((c) => (
              <MetricCard
                key={c.id}
                label={c.label}
                value={c.score}
                hint={c.explanation}
              />
            ))}
          </ResponsiveGrid>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card padding="md">
              <SectionHeader
                title="Provider checklists"
                description="Connection, permissions, sync, discovery, validation, first brief."
              />
              <div className="mt-3 space-y-3">
                {health.checklist.map((list) => (
                  <div key={list.providerId}>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-[var(--eos-text)]">
                        {list.label}
                        {list.required ? "" : " (optional)"}
                      </p>
                      <StatusBadge
                        label={list.overallStatus.replace(/_/g, " ")}
                        variant={
                          list.overallStatus === "complete"
                            ? "success"
                            : list.overallStatus === "blocked"
                              ? "danger"
                              : "warning"
                        }
                      />
                    </div>
                    <ul className="mt-1 space-y-1">
                      {list.items.map((item) => (
                        <li
                          key={item.id}
                          className="text-xs text-[var(--eos-text-muted)]"
                        >
                          [{item.status === "complete" ? "x" : " "}] {item.label}
                          — {item.detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Card>

            <Card padding="md">
              <SectionHeader
                title="Diagnostics"
                description={support.summary}
              />
              <ul className="mt-3 space-y-3">
                {health.diagnostics.length === 0 ? (
                  <li className="text-sm text-[var(--eos-text-secondary)]">
                    No open diagnostics.
                  </li>
                ) : (
                  health.diagnostics.slice(0, 6).map((d) => (
                    <li key={d.id}>
                      <div className="flex items-center gap-2">
                        <StatusBadge
                          label={d.severity}
                          variant={severityVariant(d.severity)}
                        />
                        <p className="text-sm font-medium text-[var(--eos-text)]">
                          {d.title}
                        </p>
                      </div>
                      <p className="mt-1 text-xs text-[var(--eos-text-muted)]">
                        {d.detail}
                      </p>
                      <p className="mt-1 text-xs text-[var(--eos-text-secondary)]">
                        → {d.remediation[0]}
                      </p>
                    </li>
                  ))
                )}
              </ul>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card padding="md">
              <SectionHeader
                title="Success metrics"
                description={health.success.explanation}
              />
              <ResponsiveGrid columns={2}>
                <MetricCard
                  label="Time to first brief"
                  value={health.success.timeToFirstBriefMinutes ?? "—"}
                  hint="min"
                />
                <MetricCard
                  label="Engagement"
                  value={`${health.success.executiveEngagementPct}%`}
                />
                <MetricCard
                  label="DAU"
                  value={health.success.dailyActiveUsers}
                />
                <MetricCard
                  label="Usefulness"
                  value={`${health.success.recommendationUsefulnessPct}%`}
                />
              </ResponsiveGrid>
            </Card>

            <Card padding="md">
              <SectionHeader
                title={playbook.title}
                description="Preparation · Deployment · Validation"
              />
              <ol className="mt-3 list-decimal space-y-1 pl-5 text-xs text-[var(--eos-text-secondary)]">
                {playbook.deployment.slice(0, 5).map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              <p className="mt-3 text-xs font-medium text-[var(--eos-text)]">
                Success criteria
              </p>
              <ul className="mt-1 space-y-1 text-xs text-[var(--eos-text-muted)]">
                {playbook.successCriteria.slice(0, 3).map((c) => (
                  <li key={c}>• {c}</li>
                ))}
              </ul>
            </Card>
          </div>

          <Card padding="md">
            <SectionHeader
              title="Partner exports"
              description="Shareable markdown reports for Design Partner reviews."
            />
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {docs.map((doc) => (
                <details
                  key={doc.kind}
                  className="rounded border border-[var(--eos-border)] p-3"
                >
                  <summary className="cursor-pointer text-sm font-medium text-[var(--eos-text)]">
                    {doc.title}
                  </summary>
                  <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap text-xs text-[var(--eos-text-muted)]">
                    {doc.markdown}
                  </pre>
                </details>
              ))}
            </div>
          </Card>
        </div>
      ))}
    </div>
  );
}
