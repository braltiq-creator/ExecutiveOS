"use client";

import { PageHeader } from "@/components/ui/page-header";
import { MetricCard } from "@/components/ui/metric-card";
import { ResponsiveGrid } from "@/components/ui/responsive-grid";
import { StatusBadge } from "@/components/ui/status-badge";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import type { MemoryDashboard } from "@/memory";

type Props = {
  dashboard: MemoryDashboard;
};

export function OrganisationalMemoryDashboard({ dashboard }: Props) {
  const { growth, timeline, decisions, patterns, lessons, playbooks, insights } =
    dashboard;

  return (
    <div className="space-y-8">
      <PageHeader
        overline="Administration"
        title="Organisational Memory"
        description="Institutional memory for this tenant — episodes, decisions, patterns, lessons, and living playbooks. Never shared across customers."
      />

      <ResponsiveGrid columns={4}>
        <MetricCard label="Episodes" value={growth.episodeCount} />
        <MetricCard label="Decisions" value={growth.decisionCount} />
        <MetricCard label="Patterns" value={growth.patternCount} />
        <MetricCard
          label="Recall quality"
          value={growth.recallQuality}
          hint="%"
        />
      </ResponsiveGrid>

      <ResponsiveGrid columns={4}>
        <MetricCard label="Lessons" value={growth.lessonCount} />
        <MetricCard label="Playbooks" value={growth.playbookCount} />
        <MetricCard label="Timeline events" value={growth.timelineEventCount} />
        <MetricCard
          label="Insights"
          value={insights.length}
          hint={growth.explanation}
        />
      </ResponsiveGrid>

      <Card padding="md">
        <SectionHeader
          title="Organisational timeline"
          description="Important events, decisions, and memory episodes."
        />
        <ul className="mt-3 space-y-2">
          {timeline.length === 0 ? (
            <li className="text-sm text-[var(--eos-text-secondary)]">
              No timeline events yet.
            </li>
          ) : (
            timeline.slice(0, 12).map((event) => (
              <li
                key={event.id}
                className="flex flex-wrap items-start justify-between gap-2 border-b border-[var(--eos-border)] py-2 text-sm last:border-0"
              >
                <div>
                  <p className="font-medium text-[var(--eos-text)]">
                    {event.title}
                  </p>
                  <p className="text-xs text-[var(--eos-text-muted)]">
                    {event.detail}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge
                    label={event.kind.replace(/_/g, " ")}
                    variant="neutral"
                  />
                  <span className="text-xs text-[var(--eos-text-muted)]">
                    {event.at.slice(0, 10)}
                  </span>
                </div>
              </li>
            ))
          )}
        </ul>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card padding="md">
          <SectionHeader
            title="Decision history"
            description="Significant executive decisions linked to scenarios and outcomes."
          />
          <ul className="mt-3 space-y-2 text-sm">
            {decisions.length === 0 ? (
              <li className="text-[var(--eos-text-secondary)]">
                No decisions recorded.
              </li>
            ) : (
              decisions.map((d) => (
                <li key={d.id}>
                  <p className="font-medium text-[var(--eos-text)]">{d.title}</p>
                  <p className="text-xs text-[var(--eos-text-muted)]">
                    {d.kind.replace(/_/g, " ")} · {d.summary}
                  </p>
                </li>
              ))
            )}
          </ul>
        </Card>

        <Card padding="md">
          <SectionHeader
            title="Recurring patterns"
            description="Reusable knowledge from repeated situations."
          />
          <ul className="mt-3 space-y-2 text-sm">
            {patterns.length === 0 ? (
              <li className="text-[var(--eos-text-secondary)]">
                No patterns detected yet — record more episodes.
              </li>
            ) : (
              patterns.map((p) => (
                <li key={p.id}>
                  <div className="flex items-center gap-2">
                    <p className="font-medium capitalize text-[var(--eos-text)]">
                      {p.name}
                    </p>
                    <StatusBadge
                      label={`${p.occurrenceCount}×`}
                      variant="warning"
                    />
                  </div>
                  <p className="text-xs text-[var(--eos-text-muted)]">
                    {p.reusableGuidance} · conf {p.confidence}%
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
            title="Lessons learned"
            description="What worked, what failed, future recommendations."
          />
          <ul className="mt-3 space-y-3 text-sm">
            {lessons.length === 0 ? (
              <li className="text-[var(--eos-text-secondary)]">
                No lessons captured yet.
              </li>
            ) : (
              lessons.map((l) => (
                <li
                  key={l.id}
                  className="rounded border border-[var(--eos-border)] p-3"
                >
                  {l.whatWorked[0] ? (
                    <p className="text-[var(--eos-text-secondary)]">
                      Worked: {l.whatWorked[0]}
                    </p>
                  ) : null}
                  {l.whatFailed[0] ? (
                    <p className="text-[var(--eos-text-secondary)]">
                      Failed: {l.whatFailed[0]}
                    </p>
                  ) : null}
                  {l.futureRecommendations[0] ? (
                    <p className="text-xs text-[var(--eos-text-muted)]">
                      Next: {l.futureRecommendations[0]}
                    </p>
                  ) : null}
                </li>
              ))
            )}
          </ul>
        </Card>

        <Card padding="md">
          <SectionHeader
            title="Living playbooks"
            description="Evolved from confirmed organisational experience."
          />
          <ul className="mt-3 space-y-3 text-sm">
            {playbooks.map((pb) => (
              <li
                key={pb.id}
                className="rounded border border-[var(--eos-border)] p-3"
              >
                <div className="flex items-center gap-2">
                  <p className="font-medium text-[var(--eos-text)]">{pb.title}</p>
                  <StatusBadge
                    label={`${pb.confidence}%`}
                    variant="neutral"
                  />
                </div>
                <p className="mt-1 text-xs text-[var(--eos-text-muted)]">
                  {pb.summary}
                </p>
                <ol className="mt-2 list-decimal space-y-1 pl-4 text-xs text-[var(--eos-text-secondary)]">
                  {pb.steps.slice(0, 4).map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
