import { EXECUTIVE_ICONS } from "@/experience/icons";
import { ExsOpenLink, ExsSectionHeader } from "@/experience/exs";
import { Reveal } from "@/experience/motion/Reveal";
import type {
  DwDependency,
  DwEvidence,
  DwKnowledge,
  DwStakeholder,
  DwStrategyLink,
  DwTimelineEvent,
} from "@/experience/decision-workspace/types";
import { cn } from "@/lib/utils/cn";

export function SupportingEvidence({
  items,
  focused,
}: {
  items: DwEvidence[];
  focused?: boolean;
}) {
  return (
    <Reveal delay={4}>
      <section
        id="supporting-evidence"
        className={cn("scroll-mt-6", focused && "exs-entry-focus rounded-[var(--exs-radius)]")}
        aria-label="Supporting Evidence"
      >
        <ExsSectionHeader
          label="Supporting Evidence"
          icon={EXECUTIVE_ICONS.knowledge}
        />
        {items.length === 0 ? (
          <EmptyCard text="No material evidence attached to this decision." />
        ) : (
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.id}>
                <article className="exs-card">
                  <header className="flex items-start justify-between gap-3">
                    <div>
                      <p className="exs-label">{item.source}</p>
                      <h3 className="exs-title mt-1 text-[length:0.9rem]">
                        {item.title}
                      </h3>
                    </div>
                    <ExsOpenLink href={item.href}>Open Knowledge →</ExsOpenLink>
                  </header>
                  <p className="exs-body mt-2 text-[length:0.8rem]">
                    {item.summary}
                  </p>
                </article>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Reveal>
  );
}

export function Stakeholders({ items }: { items: DwStakeholder[] }) {
  return (
    <Reveal delay={5}>
      <section id="stakeholders" className="scroll-mt-6" aria-label="Stakeholders">
        <ExsSectionHeader label="Stakeholders" icon={EXECUTIVE_ICONS.people_health} />
        {items.length === 0 ? (
          <EmptyCard text="No stakeholders listed for this decision." />
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((s) => (
              <li key={s.id}>
                <article className="exs-card h-full">
                  <p className="exs-title text-[length:0.9rem]">{s.name}</p>
                  <p className="exs-label mt-1 capitalize">
                    {s.role} · {s.stance}
                  </p>
                  <p className="exs-body mt-2 text-[length:0.8rem]">{s.note}</p>
                </article>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Reveal>
  );
}

export function Dependencies({ items }: { items: DwDependency[] }) {
  return (
    <Reveal delay={5}>
      <section id="dependencies" className="scroll-mt-6" aria-label="Dependencies">
        <ExsSectionHeader label="Dependencies" icon={EXECUTIVE_ICONS.priorities} />
        {items.length === 0 ? (
          <EmptyCard text="No decision dependencies recorded." />
        ) : (
          <ul className="space-y-2">
            {items.map((d) => (
              <li key={d.id}>
                <article className="exs-card flex items-start justify-between gap-3">
                  <div>
                    <p className="exs-label capitalize">{d.relationship}</p>
                    <p className="exs-title mt-1 text-[length:0.9rem]">{d.label}</p>
                    <p className="exs-body mt-1 text-[length:0.8rem]">
                      {d.explanation}
                    </p>
                  </div>
                  <ExsOpenLink href={d.href}>Open →</ExsOpenLink>
                </article>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Reveal>
  );
}

export function RelatedStrategy({
  items,
  focused,
}: {
  items: DwStrategyLink[];
  focused?: boolean;
}) {
  return (
    <Reveal delay={6}>
      <section
        id="related-strategy"
        className={cn("scroll-mt-6", focused && "exs-entry-focus rounded-[var(--exs-radius)]")}
        aria-label="Related Strategy"
      >
        <ExsSectionHeader
          label="Related Strategy"
          icon={EXECUTIVE_ICONS.strategy}
        />
        {items.length === 0 ? (
          <EmptyCard text="Link this decision to a strategic outcome." />
        ) : (
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.id}>
                <article className="exs-card flex items-start justify-between gap-3">
                  <div>
                    <p className="exs-title text-[length:0.9rem]">
                      {item.outcomeName}
                    </p>
                    <p className="exs-body mt-1 text-[length:0.8rem]">
                      {item.impact}
                    </p>
                  </div>
                  <ExsOpenLink href={item.href}>Open Strategy →</ExsOpenLink>
                </article>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Reveal>
  );
}

export function RelatedKnowledge({ items }: { items: DwKnowledge[] }) {
  return (
    <Reveal delay={7}>
      <section
        id="related-knowledge"
        className="scroll-mt-6"
        aria-label="Related Knowledge"
      >
        <ExsSectionHeader
          label="Related Knowledge"
          icon={EXECUTIVE_ICONS.knowledge}
        />
        {items.length === 0 ? (
          <EmptyCard text="No related knowledge surfaced yet." />
        ) : (
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.id}>
                <article className="exs-card flex items-start justify-between gap-3">
                  <div>
                    <p className="exs-label">{item.kind}</p>
                    <p className="exs-title mt-1 text-[length:0.9rem]">
                      {item.title}
                    </p>
                  </div>
                  <ExsOpenLink href={item.href}>Open Knowledge →</ExsOpenLink>
                </article>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Reveal>
  );
}

export function DecisionTimeline({ items }: { items: DwTimelineEvent[] }) {
  return (
    <Reveal delay={8}>
      <section
        id="decision-timeline"
        className="scroll-mt-6"
        aria-label="Decision Timeline"
      >
        <ExsSectionHeader
          label="Decision Timeline"
          icon={EXECUTIVE_ICONS.activity}
        />
        {items.length === 0 ? (
          <EmptyCard text="Timeline events will appear as the decision moves." />
        ) : (
          <ol className="space-y-0 rounded-[var(--exs-radius)] border border-[var(--exs-border)] bg-[var(--exs-surface)] shadow-[var(--exs-shadow-1)]">
            {items.map((event) => (
              <li
                key={event.id}
                className="grid grid-cols-[6.5rem_1fr] gap-3 border-b border-[var(--exs-divider)] px-3 py-3 last:border-b-0"
              >
                <time className="exs-label tabular-nums">
                  {formatTimelineAt(event.at)}
                </time>
                <div>
                  <p className="exs-title text-[length:0.85rem]">{event.title}</p>
                  <p className="exs-body mt-0.5 text-[length:0.8rem]">
                    {event.detail}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </Reveal>
  );
}

function EmptyCard({ text }: { text: string }) {
  return (
    <article className="exs-card">
      <p className="exs-body">{text}</p>
    </article>
  );
}

function formatTimelineAt(at: string): string {
  const d = new Date(at);
  if (Number.isNaN(d.getTime())) return at;
  return d.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
