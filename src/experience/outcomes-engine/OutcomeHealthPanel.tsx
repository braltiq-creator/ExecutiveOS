import { EXECUTIVE_ICONS } from "@/experience/icons";
import { ExsOpenLink, ExsSectionHeader, ExsTrend } from "@/experience/exs";
import { Reveal } from "@/experience/motion/Reveal";
import type { OutcomeHealthView } from "@/experience/outcomes-engine/types";
import { cn } from "@/lib/utils/cn";

type Props = {
  health: OutcomeHealthView;
  focused?: boolean;
};

/** Explains what influences outcome success. */
export function OutcomeHealthPanel({ health, focused }: Props) {
  return (
    <Reveal delay={2}>
      <section
        id="outcome-health"
        aria-label="Outcome Health"
        className={cn(
          "scroll-mt-6",
          focused && "exs-entry-focus rounded-[var(--exs-radius)]",
        )}
        data-outcome-health="true"
      >
        <ExsSectionHeader
          label="Outcome Health"
          icon={EXECUTIVE_ICONS.organisation_health}
        />
        <article className="exs-card space-y-3 p-[var(--exs-space-5)]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="exs-label">Current state</p>
              <p className="exs-title mt-1 capitalize text-[length:1.05rem]">
                {health.currentState}
              </p>
            </div>
            <div className="text-right">
              <p className="exs-label inline-flex items-center gap-1">
                <ExsTrend trend={health.trend} severity={health.severity} />
                Trajectory
              </p>
              <p className="exs-title mt-1">{health.trajectory}</p>
            </div>
          </div>

          <p className="exs-body text-[length:0.85rem]">{health.explanation}</p>

          <div className="grid gap-3 sm:grid-cols-2">
            <ListBlock label="Primary drivers" items={health.drivers} />
            <ListBlock label="Risks" items={health.risks} />
            <ListBlock label="Opportunities" items={health.opportunities} />
            <div>
              <p className="exs-label mb-1">Recommended decisions</p>
              <ul className="space-y-1">
                {health.recommendedDecisions.map((d) => (
                  <li key={d.id}>
                    <ExsOpenLink href={d.href}>{`${d.title} →`}</ExsOpenLink>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="exs-value text-[length:1.1rem]">
            {health.confidence}%
            <span className="ml-1 exs-label font-normal">confidence</span>
          </p>
        </article>
      </section>
    </Reveal>
  );
}

function ListBlock({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <p className="exs-label mb-1">{label}</p>
      <ul className="space-y-0.5">
        {items.map((item) => (
          <li key={item} className="exs-body text-[length:0.8rem]">
            · {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
