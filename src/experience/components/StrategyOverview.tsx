"use client";

import type { StrategyDashboard } from "@/strategy/framework/types";
import { ExperiencePage } from "@/experience/layouts/ExperiencePage";
import { BriefSection } from "@/experience/layouts/BriefSection";
import { ExperienceCardShell } from "@/experience/design-system/Card";
import { ExperienceBadge } from "@/experience/design-system/Badge";
import { ExperienceIndicator } from "@/experience/design-system/Indicator";
import { ExperienceEmptyState } from "@/experience/design-system/EmptyState";
import { ConfidenceBar } from "@/experience/motion/ConfidenceBar";
import { Reveal } from "@/experience/motion/Reveal";
import { statusToTone } from "@/experience/components/StatusTone";

type StrategyOverviewProps = {
  dashboard: StrategyDashboard;
};

/** Executive-facing strategy surface — presentation over Core strategy data. */
export function StrategyOverview({ dashboard }: StrategyOverviewProps) {
  const alignmentCount = dashboard.alignment.recommendationAlignments.length;

  return (
    <ExperiencePage width="brief" className="pb-16">
      <Reveal>
        <header className="space-y-3 pt-2">
          <ExperienceBadge tone="accent">Strategy</ExperienceBadge>
          <h1 className="ex-display">Strategic Outcomes</h1>
          <p className="ex-body max-w-xl">
            Progress against the few outcomes that define organisational success.
          </p>
        </header>
      </Reveal>

      <BriefSection
        id="outcomes"
        label="Outcomes"
        description="Keep this list short. Clarity beats coverage."
        delay={1}
      >
        {dashboard.outcomes.length === 0 ? (
          <ExperienceEmptyState
            title="Define three strategic outcomes"
            description="Discovery captures the outcomes that matter. Once set, recommendations and decisions align here."
          />
        ) : (
          <ul className="space-y-4">
            {dashboard.outcomes.map((outcome) => (
              <li key={outcome.id}>
                <ExperienceCardShell className="space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <ExperienceBadge
                        tone={statusToTone(outcome.currentHealth)}
                      >
                        {outcome.currentHealth.replace(/_/g, " ")}
                      </ExperienceBadge>
                      <h2 className="ex-heading mt-3">{outcome.name}</h2>
                      <p className="ex-body mt-2">{outcome.description}</p>
                    </div>
                    <ConfidenceBar
                      value={outcome.confidence}
                      className="w-32"
                    />
                  </div>
                  <p className="ex-caption normal-case tracking-normal">
                    Owner {outcome.executiveOwner}
                    {outcome.targetDate
                      ? ` · Target ${new Date(outcome.targetDate).toLocaleDateString()}`
                      : ""}
                  </p>
                  {outcome.successMeasures.length > 0 ? (
                    <ul className="space-y-1">
                      {outcome.successMeasures.slice(0, 3).map((measure) => (
                        <li key={measure} className="ex-body">
                          · {measure}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </ExperienceCardShell>
              </li>
            ))}
          </ul>
        )}
      </BriefSection>

      <BriefSection id="progress" label="Strategic Progress" delay={2}>
        <ExperienceCardShell className="space-y-4">
          <div className="flex flex-wrap gap-6">
            <div>
              <p className="ex-caption">Overall progress</p>
              <p className="ex-heading mt-1">
                {dashboard.progress.overallProgressPct}%
              </p>
            </div>
            <div>
              <p className="ex-caption">Aligned recommendations</p>
              <p className="ex-heading mt-1">{alignmentCount}</p>
            </div>
            <ConfidenceBar
              value={dashboard.validation.confidence}
              className="w-32"
              label="Validation confidence"
            />
          </div>
          <p className="ex-body">{dashboard.progress.explanation}</p>
          {dashboard.alignment.explanation ? (
            <p className="ex-body text-[var(--ex-text-muted)]">
              {dashboard.alignment.explanation}
            </p>
          ) : null}
        </ExperienceCardShell>
      </BriefSection>

      <BriefSection
        id="initiatives"
        label="Supporting Initiatives"
        description="Activity only matters when it moves an outcome."
        delay={3}
      >
        {dashboard.initiatives.length === 0 ? (
          <ExperienceEmptyState
            title="No initiatives linked yet"
            description="Initiatives appear here when they are explicitly tied to a strategic outcome."
          />
        ) : (
          <ul className="space-y-3">
            {dashboard.initiatives.map((initiative) => (
              <li key={initiative.id}>
                <ExperienceCardShell className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="ex-heading text-base">{initiative.name}</p>
                    <p className="ex-body mt-1">
                      Owner {initiative.owner} · {initiative.progressPct}%
                    </p>
                  </div>
                  <ExperienceIndicator
                    tone={statusToTone(initiative.status)}
                    label={initiative.status}
                  />
                </ExperienceCardShell>
              </li>
            ))}
          </ul>
        )}
      </BriefSection>
    </ExperiencePage>
  );
}
