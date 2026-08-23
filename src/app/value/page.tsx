import Link from "next/link";
import { requireAppAccess } from "@/lib/auth/access";
import { AppFrame } from "@/components/layout/AppFrame";
import { ExperiencePage } from "@/experience/layouts/ExperiencePage";
import { ExperienceCardShell } from "@/experience/design-system/Card";
import { ExperienceBadge } from "@/experience/design-system/Badge";
import { Expandable } from "@/experience/motion/Expandable";
import {
  computeExecutiveValueScore,
  generateExecutiveValueReport,
  generateValueNotifications,
  listValueEstimates,
  recommendUpgrades,
  synthesiseValueEstimates,
} from "@/growth";

export default async function ValuePage() {
  await requireAppAccess({ requireOnboarding: false });

  const organizationId = "tenant-northline";
  if (listValueEstimates(organizationId).length === 0) {
    synthesiseValueEstimates({ organizationId });
  }
  const evs = computeExecutiveValueScore({ organizationId });
  const estimates = listValueEstimates(organizationId).filter(
    (e) => e.timePeriod === "30d",
  );
  const report = generateExecutiveValueReport({ organizationId });
  const notifications = generateValueNotifications(organizationId);
  const upgrades = recommendUpgrades(organizationId);

  return (
    <AppFrame title="Executive Value" density="snapshot">
      <ExperiencePage width="brief" className="space-y-8 pb-16">
        <header className="space-y-3 pt-2">
          <ExperienceBadge tone="success">Executive Value Score</ExperienceBadge>
          <h1 className="ex-display">EVS {evs.score}</h1>
          <p className="ex-body max-w-xl">
            Today ${evs.todayValue.toLocaleString()} · 7 days $
            {evs.last7Days.toLocaleString()} · 30 days $
            {evs.last30Days.toLocaleString()} · 12 months $
            {evs.last12Months.toLocaleString()} · Lifetime $
            {evs.lifetimeValue.toLocaleString()}
          </p>
          <p className="ex-caption normal-case tracking-normal">
            Confidence {evs.confidence}% · Trend {evs.trend} · Benchmark Δ{" "}
            {evs.benchmarkDelta > 0 ? "+" : ""}
            {evs.benchmarkDelta}
          </p>
        </header>

        <ExperienceCardShell className="space-y-3">
          <h2 className="ex-heading">ROI report</h2>
          <p className="ex-body">{report.narrative}</p>
          <p className="ex-caption normal-case tracking-normal">
            Suitable for {report.suitableFor.join(" · ").replace(/_/g, " ")}
          </p>
          <Link
            href="/settings/billing"
            className="ex-body text-[var(--ex-accent)] underline-offset-4 hover:underline"
          >
            Manage subscription
          </Link>
        </ExperienceCardShell>

        <section className="space-y-3">
          <h2 className="ex-heading">Value estimates</h2>
          <ul className="space-y-3">
            {estimates.map((estimate) => (
              <li key={estimate.id}>
                <ExperienceCardShell>
                  <Expandable
                    summary={
                      <span className="ex-heading text-base">
                        {estimate.label}:{" "}
                        {estimate.unit === "aud"
                          ? `$${estimate.amount.toLocaleString()}`
                          : estimate.unit === "hours"
                            ? `${estimate.amount}h`
                            : `${estimate.amount}${estimate.unit === "percent" ? "%" : ""}`}
                      </span>
                    }
                  >
                    <dl className="space-y-2">
                      <div>
                        <dt className="ex-caption">Explanation</dt>
                        <dd className="ex-body mt-1">{estimate.explanation}</dd>
                      </div>
                      <div>
                        <dt className="ex-caption">Confidence</dt>
                        <dd className="ex-body mt-1">{estimate.confidence}%</dd>
                      </div>
                      <div>
                        <dt className="ex-caption">Evidence</dt>
                        <dd className="ex-body mt-1">
                          {estimate.evidence.join(" · ")}
                        </dd>
                      </div>
                      {estimate.relatedRecommendationTitle ? (
                        <div>
                          <dt className="ex-caption">Related recommendation</dt>
                          <dd className="ex-body mt-1">
                            {estimate.relatedRecommendationTitle}
                          </dd>
                        </div>
                      ) : null}
                      {estimate.relatedStrategicOutcome ? (
                        <div>
                          <dt className="ex-caption">Strategic outcome</dt>
                          <dd className="ex-body mt-1">
                            {estimate.relatedStrategicOutcome}
                          </dd>
                        </div>
                      ) : null}
                      <div>
                        <dt className="ex-caption">Time period</dt>
                        <dd className="ex-body mt-1">{estimate.timePeriod}</dd>
                      </div>
                    </dl>
                  </Expandable>
                </ExperienceCardShell>
              </li>
            ))}
          </ul>
        </section>

        {notifications.length > 0 ? (
          <section className="space-y-3">
            <h2 className="ex-heading">Value alerts</h2>
            <ul className="space-y-2">
              {notifications.slice(0, 5).map((n) => (
                <li key={n.id}>
                  <ExperienceCardShell>
                    <p className="ex-heading text-base">{n.title}</p>
                    <p className="ex-body mt-1">{n.summary}</p>
                  </ExperienceCardShell>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {upgrades.length > 0 ? (
          <section className="space-y-3">
            <h2 className="ex-heading">Expansion</h2>
            <ul className="space-y-2">
              {upgrades.map((u) => (
                <li key={u.id}>
                  <ExperienceCardShell>
                    <p className="ex-heading text-base">
                      {u.fromPlan} → {u.toPlan}
                    </p>
                    <p className="ex-body mt-1">{u.rationale}</p>
                    <Link
                      href="/subscribe"
                      className="mt-2 inline-block ex-body text-[var(--ex-accent)] underline-offset-4 hover:underline"
                    >
                      Review plans
                    </Link>
                  </ExperienceCardShell>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </ExperiencePage>
    </AppFrame>
  );
}
