import { EXECUTIVE_ICONS } from "@/experience/icons";
import { ExsOpenLink, ExsSectionHeader } from "@/experience/exs";
import { Reveal } from "@/experience/motion/Reveal";
import type { KnowledgeWorkspaceView } from "@/experience/knowledge-workspace/types";
import { cn } from "@/lib/utils/cn";

type FocusProps = { focused?: boolean };

export function ExecutiveQuestion({
  question,
  focused,
}: { question: string } & FocusProps) {
  return (
    <Reveal delay={1}>
      <section
        id="executive-question"
        aria-label="Executive Question"
        className={cn(
          "scroll-mt-6",
          focused && "exs-entry-focus rounded-[var(--exs-radius)]",
        )}
      >
        <ExsSectionHeader
          label="Executive Question"
          icon={EXECUTIVE_ICONS.priorities}
        />
        <article className="exs-card p-[var(--exs-space-5)]">
          <h2 className="exs-title text-[length:1.25rem]">{question}</h2>
        </article>
      </section>
    </Reveal>
  );
}

export function ExecutiveAnswer({
  answer,
  focused,
}: {
  answer: KnowledgeWorkspaceView["answer"];
} & FocusProps) {
  return (
    <Reveal delay={2}>
      <section
        id="executive-answer"
        aria-label="Executive Answer"
        className={cn(
          "scroll-mt-6",
          focused && "exs-entry-focus rounded-[var(--exs-radius)]",
        )}
      >
        <ExsSectionHeader
          label="Executive Answer"
          icon={EXECUTIVE_ICONS.pulse}
        />
        <article className="exs-card space-y-3 p-[var(--exs-space-5)]">
          <p className="exs-body text-[var(--exs-text)]">{answer.summary}</p>
          <div>
            <p className="exs-label mb-1.5">Key drivers</p>
            <ul className="space-y-1">
              {answer.drivers.map((d) => (
                <li key={d} className="exs-body text-[length:0.85rem]">
                  · {d}
                </li>
              ))}
            </ul>
          </div>
          <p className="exs-body text-[length:0.85rem]">
            <span className="font-medium text-[var(--exs-text)]">
              Business impact.{" "}
            </span>
            {answer.impact}
          </p>
          <p className="exs-body text-[length:0.85rem]">
            <span className="font-medium text-[var(--exs-text)]">
              Recommended focus.{" "}
            </span>
            {answer.focus}
          </p>
          <p className="exs-value text-[length:1.1rem]">
            {answer.confidence}%
            <span className="ml-1 exs-label font-normal">confidence</span>
          </p>
        </article>
      </section>
    </Reveal>
  );
}

export function ConfidencePanel({
  confidence,
  focused,
}: {
  confidence: KnowledgeWorkspaceView["confidence"];
} & FocusProps) {
  return (
    <Reveal delay={3}>
      <section
        id="confidence"
        aria-label="Confidence"
        className={cn(
          "scroll-mt-6",
          focused && "exs-entry-focus rounded-[var(--exs-radius)]",
        )}
      >
        <ExsSectionHeader
          label="Confidence"
          icon={EXECUTIVE_ICONS.organisation_health}
        />
        <article className="exs-card space-y-3 p-[var(--exs-space-5)]">
          <p className="exs-value text-[length:2rem] leading-none">
            {confidence.score}%
          </p>
          <dl className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <Metric label="Evidence strength" value={confidence.strength} />
            <Metric label="Evidence freshness" value={confidence.freshness} />
            <Metric label="Coverage" value={confidence.coverage} />
            <Metric label="Data quality" value={confidence.quality} />
          </dl>
          <p className="exs-body text-[length:0.85rem]">
            {confidence.explanation}
          </p>
        </article>
      </section>
    </Reveal>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="exs-label">{label}</dt>
      <dd className="exs-title mt-0.5 text-[length:0.95rem]">{value}</dd>
    </div>
  );
}

export function EvidenceStack({
  items,
  focused,
}: {
  items: KnowledgeWorkspaceView["evidence"];
} & FocusProps) {
  const buckets = Array.from(new Set(items.map((i) => i.bucket)));

  return (
    <Reveal delay={4}>
      <section
        id="evidence-stack"
        aria-label="Evidence Stack"
        className={cn(
          "scroll-mt-6",
          focused && "exs-entry-focus rounded-[var(--exs-radius)]",
        )}
      >
        <ExsSectionHeader
          label="Evidence Stack"
          icon={EXECUTIVE_ICONS.knowledge}
        />
        {items.length === 0 ? (
          <article className="exs-card">
            <p className="exs-body">No evidence stacked for this question yet.</p>
          </article>
        ) : (
          <div className="space-y-4">
            {buckets.map((bucket) => (
              <div key={bucket}>
                <p className="exs-label mb-2">{bucket}</p>
                <ul className="space-y-2">
                  {items
                    .filter((i) => i.bucket === bucket)
                    .map((item) => (
                      <li key={item.id}>
                        <article className="exs-card">
                          <header className="flex items-start justify-between gap-3">
                            <div>
                              <p className="exs-label">
                                {item.source} · {item.date}
                              </p>
                              <p className="exs-title mt-1 text-[length:0.9rem]">
                                {item.relevance}
                              </p>
                            </div>
                            <ExsOpenLink href={item.href}>Open →</ExsOpenLink>
                          </header>
                          <p className="exs-body mt-2 text-[length:0.75rem]">
                            Confidence contribution {item.contribution}
                          </p>
                        </article>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </Reveal>
  );
}

export function KnowledgeRelationships({
  items,
}: {
  items: KnowledgeWorkspaceView["relationships"];
}) {
  return (
    <Reveal delay={5}>
      <section
        id="knowledge-relationships"
        aria-label="Knowledge Relationships"
        className="scroll-mt-6"
      >
        <ExsSectionHeader
          label="Knowledge Relationships"
          icon={EXECUTIVE_ICONS.priorities}
        />
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <li key={item.id}>
              <a href={item.href} className="exs-card block h-full">
                <p className="exs-label">{item.kind}</p>
                <p className="exs-title mt-1 text-[length:0.9rem]">
                  {item.label}
                </p>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </Reveal>
  );
}

export function RelatedLinks({
  id,
  label,
  icon,
  items,
  focused,
  openLabel,
}: {
  id: string;
  label: string;
  icon: typeof EXECUTIVE_ICONS.strategy;
  items: KnowledgeWorkspaceView["relatedStrategy"];
  openLabel: string;
} & FocusProps) {
  return (
    <Reveal delay={6}>
      <section
        id={id}
        aria-label={label}
        className={cn(
          "scroll-mt-6",
          focused && "exs-entry-focus rounded-[var(--exs-radius)]",
        )}
      >
        <ExsSectionHeader label={label} icon={icon} />
        {items.length === 0 ? (
          <article className="exs-card">
            <p className="exs-body">Nothing linked for this question yet.</p>
          </article>
        ) : (
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.id}>
                <article className="exs-card flex items-start justify-between gap-3">
                  <div>
                    <p className="exs-title text-[length:0.9rem]">{item.title}</p>
                    <p className="exs-body mt-1 text-[length:0.8rem]">
                      {item.detail}
                    </p>
                  </div>
                  <ExsOpenLink href={item.href} className="shrink-0">
                    {openLabel}
                  </ExsOpenLink>
                </article>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Reveal>
  );
}

export function SourceExplorer({
  items,
}: {
  items: KnowledgeWorkspaceView["sources"];
}) {
  return (
    <Reveal delay={7}>
      <section
        id="source-explorer"
        aria-label="Source Explorer"
        className="scroll-mt-6"
      >
        <ExsSectionHeader
          label="Source Explorer"
          icon={EXECUTIVE_ICONS.reports}
        />
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id}>
              <article className="exs-card flex items-start justify-between gap-3">
                <div>
                  <p className="exs-title text-[length:0.9rem]">{item.label}</p>
                  <p className="exs-body mt-1 text-[length:0.8rem]">
                    {item.summary}
                  </p>
                </div>
                <ExsOpenLink href={item.href} className="shrink-0">
                  Open →
                </ExsOpenLink>
              </article>
            </li>
          ))}
        </ul>
        <p className="exs-label mt-3">
          <a
            href="/today"
            className="text-[var(--exs-nav)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--eos-ring)]"
          >
            Return to Today →
          </a>
        </p>
      </section>
    </Reveal>
  );
}

export function KnowledgeTimeline({
  items,
}: {
  items: KnowledgeWorkspaceView["timeline"];
}) {
  return (
    <Reveal delay={8}>
      <section id="timeline" aria-label="Timeline" className="scroll-mt-6">
        <ExsSectionHeader
          label="Timeline"
          icon={EXECUTIVE_ICONS.activity}
        />
        <ol className="space-y-0 rounded-[var(--exs-radius)] border border-[var(--exs-border)] bg-[var(--exs-surface)] shadow-[var(--exs-shadow-1)]">
          {items.map((event) => (
            <li
              key={event.id}
              className="grid grid-cols-[6.5rem_1fr] gap-3 border-b border-[var(--exs-divider)] px-3 py-3 last:border-b-0"
            >
              <p className="exs-label capitalize">{event.kind}</p>
              <div>
                <p className="exs-title text-[length:0.85rem]">{event.title}</p>
                <p className="exs-body mt-0.5 text-[length:0.8rem]">
                  {event.detail}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </Reveal>
  );
}
