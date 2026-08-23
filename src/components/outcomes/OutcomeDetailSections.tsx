"use client";

import Link from "next/link";
import { RecommendationMeta } from "@/components/briefing/RecommendationMeta";
import { SignalFrame } from "@/components/briefing/SignalFrame";
import { useDecisions } from "@/components/providers/DecisionProvider";
import type { Outcome } from "@/lib/outcomes/types";
import { cn } from "@/lib/utils/cn";

function Section({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24">
      <h2
        id={`${id}-title`}
        className="font-display text-xl font-semibold tracking-tight text-foreground"
      >
        {title}
      </h2>
      {description ? (
        <p className="mt-2 max-w-3xl text-sm leading-6 text-secondary">
          {description}
        </p>
      ) : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function OutcomeTimelineSection({ outcome }: { outcome: Outcome }) {
  return (
    <Section
      id="timeline"
      title="Outcome timeline"
      description="What moved this outcome — newest first."
    >
      <ol className="space-y-3 border-l border-border pl-4">
        {outcome.timeline.map((event) => (
          <li key={event.id} className="relative">
            <span
              aria-hidden="true"
              className="absolute -left-[1.3rem] top-1.5 size-2.5 rounded-full bg-accent"
            />
            <p className="font-mono text-xs text-muted">
              {new Intl.DateTimeFormat(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              }).format(new Date(event.at))}
            </p>
            <p className="mt-1 font-medium text-foreground">{event.title}</p>
            <p className="mt-1 text-sm text-secondary">{event.detail}</p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-muted">
              {event.kind}
            </p>
          </li>
        ))}
      </ol>
    </Section>
  );
}

export function OutcomeContributorsSection({ outcome }: { outcome: Outcome }) {
  return (
    <Section id="contributors" title="Outcome contributors">
      <ul className="grid gap-3 sm:grid-cols-2">
        {outcome.contributors.map((person) => (
          <li
            key={person.id}
            className="rounded-[var(--eos-radius-lg)] border border-border bg-surface p-4"
          >
            <p className="font-medium text-foreground">{person.name}</p>
            <p className="text-sm text-muted">{person.role}</p>
            <p className="mt-2 text-sm leading-6 text-secondary">
              {person.contribution}
            </p>
          </li>
        ))}
      </ul>
    </Section>
  );
}

export function OutcomeBlockersSection({ outcome }: { outcome: Outcome }) {
  if (outcome.blockers.length === 0) {
    return (
      <Section id="blockers" title="Outcome blockers">
        <p className="text-sm text-secondary">No active blockers.</p>
      </Section>
    );
  }

  return (
    <Section id="blockers" title="Outcome blockers">
      <ul className="space-y-3">
        {outcome.blockers.map((blocker) => (
          <li
            key={blocker.id}
            className="rounded-[var(--eos-radius-lg)] border border-border bg-surface p-4"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
                  blocker.severity === "critical" &&
                    "border-critical/40 bg-critical-surface text-critical",
                  blocker.severity === "attention" &&
                    "border-warning/40 bg-warning-surface text-warning",
                  blocker.severity === "watch" &&
                    "border-border bg-surface-inset text-secondary",
                )}
              >
                {blocker.severity}
              </span>
              <span className="font-mono text-xs text-muted">
                Since {blocker.since}
              </span>
            </div>
            <p className="mt-2 font-medium text-foreground">{blocker.title}</p>
            <p className="mt-1 text-sm leading-6 text-secondary">
              {blocker.description}
            </p>
            <p className="mt-2 text-sm text-secondary">Owner: {blocker.owner}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}

export function OutcomeRecommendationsSection({
  outcome,
}: {
  outcome: Outcome;
}) {
  return (
    <Section
      id="recommendations"
      title="Outcome recommendations"
      description="Explain before recommend — each item includes full recommendation fields."
    >
      <div className="space-y-4">
        {outcome.recommendations.map((item) => (
          <SignalFrame
            key={item.id}
            title={item.title}
            whatChanged={item.whatChanged}
            why={item.why}
            outcomeId={outcome.id}
            whatShouldHappenNext={item.whatShouldHappenNext}
            recommendation={item.recommendation}
            compactMeta
          />
        ))}
      </div>
    </Section>
  );
}

export function OutcomeForecastSection({ outcome }: { outcome: Outcome }) {
  return (
    <Section id="forecast" title="Outcome forecast">
      <div className="rounded-[var(--eos-radius-lg)] border border-border bg-surface p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
              {outcome.forecast.horizonLabel}
            </p>
            <p className="mt-1 font-mono text-3xl font-semibold tabular-nums text-foreground">
              {outcome.forecast.expectedScore}
              <span className="text-lg text-muted">/100</span>
            </p>
          </div>
          <p className="text-sm font-medium capitalize text-secondary">
            {outcome.forecast.direction}
          </p>
        </div>
        <p className="mt-4 text-sm leading-6 text-secondary">
          {outcome.forecast.narrative}
        </p>
        <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-secondary">
          {outcome.forecast.assumptions.map((assumption) => (
            <li key={assumption}>{assumption}</li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

export function OutcomeHistorySection({ outcome }: { outcome: Outcome }) {
  return (
    <Section
      id="history"
      title="Outcome history"
      description="Health over recent sessions — values only, no charts."
    >
      <div className="overflow-x-auto rounded-[var(--eos-radius-lg)] border border-border">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-surface-inset text-[11px] uppercase tracking-[0.14em] text-muted">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">
                Date
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Health
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Note
              </th>
            </tr>
          </thead>
          <tbody>
            {[...outcome.history].reverse().map((point) => (
              <tr key={point.id} className="border-t border-border">
                <td className="px-4 py-3 font-mono text-secondary">
                  {point.date}
                </td>
                <td className="px-4 py-3 font-mono text-foreground">
                  {point.healthScore}
                </td>
                <td className="px-4 py-3 text-secondary">{point.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

export function OutcomeRelationshipsSection({
  outcome,
}: {
  outcome: Outcome;
}) {
  return (
    <Section id="relationships" title="Outcome relationships">
      <ul className="space-y-3">
        {outcome.relationships.map((rel) => (
          <li
            key={rel.id}
            className="rounded-[var(--eos-radius-lg)] border border-border bg-surface p-4"
          >
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
              {rel.relationship.replaceAll("_", " ")}
            </p>
            <p className="mt-1">
              <Link
                href={`/outcomes/${rel.relatedOutcomeId}`}
                className="font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {rel.relatedOutcomeName}
              </Link>
            </p>
            <p className="mt-2 text-sm leading-6 text-secondary">
              {rel.explanation}
            </p>
          </li>
        ))}
      </ul>
    </Section>
  );
}

export function OutcomeContributingDecisionsSection({
  outcome,
}: {
  outcome: Outcome;
}) {
  const { getDecisionsForOutcome } = useDecisions();
  const decisions = getDecisionsForOutcome(outcome.id);

  return (
    <Section
      id="decisions"
      title="Linked decisions"
      description="From Decision Engine — every decision belongs to one or more outcomes."
    >
      {decisions.length === 0 ? (
        <p className="text-sm text-secondary">No linked decisions.</p>
      ) : (
        <div className="space-y-4">
          {decisions.map((decision) => (
            <article
              key={decision.id}
              className="rounded-[var(--eos-radius-lg)] border border-border bg-surface p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h3 className="font-display text-lg font-semibold text-foreground">
                  <Link
                    href={`/decisions/${decision.id}`}
                    className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {decision.question}
                  </Link>
                </h3>
                <span className="rounded-full border border-border bg-surface-inset px-2.5 py-0.5 text-xs capitalize text-secondary">
                  {decision.status.replaceAll("_", " ")}
                </span>
              </div>
              <SignalFrame
                className="mt-4 border-0 bg-transparent p-0 shadow-none"
                whatChanged={decision.whatChanged}
                why={decision.why}
                outcomeId={outcome.id}
                whatShouldHappenNext={decision.whatShouldHappenNext}
                recommendation={{
                  businessImpact: decision.businessImpact,
                  expectedOutcomeImpact: decision.expectedOutcomeImpact,
                  confidence: decision.confidence,
                  owner: decision.owner,
                  deadline: decision.deadline,
                }}
                compactMeta
              />
            </article>
          ))}
        </div>
      )}
    </Section>
  );
}

export function OutcomeContributingInsightsSection({
  outcome,
}: {
  outcome: Outcome;
}) {
  return (
    <Section id="insights" title="Contributing insights">
      {outcome.contributingInsights.length === 0 ? (
        <p className="text-sm text-secondary">No contributing insights.</p>
      ) : (
        <div className="space-y-4">
          {outcome.contributingInsights.map((insight) => (
            <SignalFrame
              key={insight.id}
              whatChanged={insight.whatChanged}
              why={insight.why}
              outcomeId={outcome.id}
              whatShouldHappenNext={insight.whatShouldHappenNext}
              recommendation={insight.recommendation}
              compactMeta
              eyebrow={
                <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
                  {insight.sourceLabel}
                </span>
              }
            />
          ))}
        </div>
      )}
    </Section>
  );
}

export function OutcomePendingActionsSection({
  outcome,
}: {
  outcome: Outcome;
}) {
  return (
    <Section id="actions" title="Pending actions">
      {outcome.pendingActions.length === 0 ? (
        <p className="text-sm text-secondary">No pending actions.</p>
      ) : (
        <div className="space-y-4">
          {outcome.pendingActions.map((action) => (
            <article
              key={action.id}
              className="rounded-[var(--eos-radius-lg)] border border-border bg-surface p-5"
            >
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-display text-lg font-semibold text-foreground">
                  {action.actionLabel}
                </h3>
                <span className="rounded-full border border-border bg-surface-inset px-2.5 py-0.5 text-xs capitalize text-secondary">
                  {action.status.replaceAll("_", " ")}
                </span>
              </div>
              <dl className="mt-4 grid gap-3 md:grid-cols-2">
                <div>
                  <dt className="text-[11px] uppercase tracking-[0.14em] text-muted">
                    What changed
                  </dt>
                  <dd className="mt-1 text-sm text-foreground">
                    {action.whatChanged}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-[0.14em] text-muted">
                    Why
                  </dt>
                  <dd className="mt-1 text-sm text-secondary">{action.why}</dd>
                </div>
                <div className="md:col-span-2">
                  <dt className="text-[11px] uppercase tracking-[0.14em] text-muted">
                    What should happen next
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-foreground">
                    {action.whatShouldHappenNext}
                  </dd>
                </div>
              </dl>
              <RecommendationMeta
                recommendation={action.recommendation}
                compact
                className="mt-5"
              />
            </article>
          ))}
        </div>
      )}
    </Section>
  );
}
