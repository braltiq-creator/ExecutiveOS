"use client";

import type { ExperimentationDashboard } from "@/experiments";
import { PageHeader } from "@/components/ui/page-header";
import { cn } from "@/lib/utils/cn";

type ExperimentationDashboardProps = {
  dashboard: ExperimentationDashboard;
};

export function ExperimentationDashboardView({
  dashboard,
}: ExperimentationDashboardProps) {
  return (
    <div className="space-y-10">
      <PageHeader
        overline="Administration"
        title="Pilot Intelligence & Experimentation"
        description="Braltiq-internal only. Anonymised Design Partner learning signals — never customer business data."
      />

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric
          label="Partners"
          value={String(dashboard.portfolio.partnerCount)}
        />
        <Metric
          label="Running experiments"
          value={String(dashboard.portfolio.runningExperiments)}
        />
        <Metric
          label="Avg success probability"
          value={`${dashboard.portfolio.avgSuccessProbability}%`}
        />
        <Metric
          label="Avg adoption"
          value={`${dashboard.portfolio.avgAdoption}%`}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">
          Pilot intelligence
        </h2>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[48rem] text-left text-sm">
            <thead className="border-b border-border bg-surface-inset/40 text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-3 py-2 font-medium">Partner</th>
                <th className="px-3 py-2 font-medium">Profile</th>
                <th className="px-3 py-2 font-medium">Adoption</th>
                <th className="px-3 py-2 font-medium">Engagement</th>
                <th className="px-3 py-2 font-medium">Acceptance</th>
                <th className="px-3 py-2 font-medium">Health</th>
                <th className="px-3 py-2 font-medium">Success %</th>
              </tr>
            </thead>
            <tbody>
              {dashboard.pilotIntelligence.map((row) => (
                <tr
                  key={row.tenantId}
                  className="border-b border-border last:border-0"
                >
                  <td className="px-3 py-2.5">{row.partnerLabel}</td>
                  <td className="px-3 py-2.5 text-secondary">
                    {row.profileId.replace(/_/g, " ")}
                  </td>
                  <td className="px-3 py-2.5">
                    {row.metrics.executiveAdoption.value}%
                  </td>
                  <td className="px-3 py-2.5">
                    {row.metrics.executiveEngagement.value}%
                  </td>
                  <td className="px-3 py-2.5">
                    {row.metrics.recommendationAcceptance.value}%
                  </td>
                  <td className="px-3 py-2.5">
                    {row.metrics.pilotHealth.value}
                  </td>
                  <td className="px-3 py-2.5 font-medium">
                    {row.metrics.successProbability.value}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {dashboard.pilotIntelligence[0] ? (
          <p className="text-sm text-secondary">
            {dashboard.pilotIntelligence[0].metrics.successProbability.explanation}
          </p>
        ) : null}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Experiments</h2>
        <ul className="space-y-3">
          {dashboard.experiments.length === 0 ? (
            <li className="text-sm text-secondary">No experiments yet.</li>
          ) : (
            dashboard.experiments.map((exp) => (
              <li
                key={exp.id}
                className="rounded-lg border border-border px-4 py-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <StatusChip status={exp.status} />
                  <span className="text-xs uppercase tracking-wide text-muted">
                    {exp.result}
                  </span>
                </div>
                <p className="mt-2 font-medium">{exp.hypothesis}</p>
                <p className="mt-1 text-sm text-secondary">{exp.objective}</p>
                {exp.learning ? (
                  <p className="mt-2 text-sm">Learning: {exp.learning}</p>
                ) : null}
                {exp.recommendedAction ? (
                  <p className="mt-1 text-sm text-secondary">
                    Action: {exp.recommendedAction}
                  </p>
                ) : null}
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-3">
          <h2 className="text-lg font-semibold tracking-tight">
            Product insights
          </h2>
          <ul className="space-y-2">
            {dashboard.insights.slice(0, 8).map((insight) => (
              <li
                key={insight.id}
                className="rounded-lg border border-border px-3 py-2.5"
              >
                <p className="text-xs uppercase tracking-wide text-muted">
                  {insight.priority} · {insight.kind.replace(/_/g, " ")} ·{" "}
                  {insight.confidence}% conf
                </p>
                <p className="mt-1 font-medium">{insight.title}</p>
                <p className="mt-1 text-sm text-secondary">{insight.detail}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold tracking-tight">
            Roadmap intelligence
          </h2>
          <ul className="space-y-2">
            {dashboard.roadmap.map((item) => (
              <li
                key={item.id}
                className="rounded-lg border border-border px-3 py-2.5"
              >
                <p className="text-xs uppercase tracking-wide text-muted">
                  {item.confidence}% confidence · {item.sources.join(" · ")}
                </p>
                <p className="mt-1 font-medium">{item.title}</p>
                <p className="mt-1 text-sm text-secondary">{item.rationale}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-3">
          <h2 className="text-lg font-semibold tracking-tight">
            Profile analytics
          </h2>
          <ul className="space-y-2">
            {dashboard.profiles.map((profile) => (
              <li
                key={profile.profileId}
                className="rounded-lg border border-border px-3 py-2.5"
              >
                <p className="font-medium">
                  {profile.profileId.replace(/_/g, " ")}
                </p>
                <p className="mt-1 text-sm text-secondary">
                  {profile.partnerCount} partners · adoption{" "}
                  {profile.avgAdoption}% · acceptance {profile.avgAcceptance}% ·
                  success {profile.avgSuccessProbability}%
                </p>
                <p className="mt-1 text-xs text-muted">{profile.explanation}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold tracking-tight">Cohorts</h2>
          <ul className="space-y-2">
            {dashboard.cohorts.map((cohort) => (
              <li
                key={cohort.cohortId}
                className="rounded-lg border border-border px-3 py-2.5"
              >
                <p className="font-medium">{cohort.label}</p>
                <p className="mt-1 text-sm text-secondary">
                  n={cohort.partnerCount} · activation {cohort.activationPct}% ·
                  retention {cohort.retentionPct}% · rec eff{" "}
                  {cohort.recommendationEffectivenessPct}%
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">
          Executive interviews
        </h2>
        {dashboard.interviews.length === 0 ? (
          <p className="text-sm text-secondary">No interviews recorded.</p>
        ) : (
          <ul className="space-y-2">
            {dashboard.interviews.map((interview) => (
              <li
                key={interview.id}
                className="rounded-lg border border-border px-3 py-2.5"
              >
                <p className="font-medium">
                  {interview.executiveLabel} · {interview.executiveRole}
                </p>
                <p className="mt-1 text-sm text-secondary">
                  Satisfaction {interview.overallSatisfaction}/10
                </p>
                {interview.painPoints[0] ? (
                  <p className="mt-1 text-sm">Pain: {interview.painPoints[0]}</p>
                ) : null}
                {interview.featureRequests[0] ? (
                  <p className="mt-1 text-sm text-secondary">
                    Request: {interview.featureRequests[0]}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
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

function StatusChip({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "rounded-md px-2 py-0.5 text-xs font-medium capitalize",
        status === "running"
          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
          : status === "completed"
            ? "bg-sky-500/10 text-sky-700 dark:text-sky-300"
            : "bg-surface-inset text-secondary",
      )}
    >
      {status}
    </span>
  );
}
