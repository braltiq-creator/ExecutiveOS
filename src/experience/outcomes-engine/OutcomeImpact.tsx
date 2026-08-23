import { EXECUTIVE_ICONS } from "@/experience/icons";
import { ExsOpenLink, ExsSectionHeader } from "@/experience/exs";
import { Reveal } from "@/experience/motion/Reveal";
import type { OutcomeImpactView } from "@/experience/outcomes-engine/types";

type Props = {
  impact: OutcomeImpactView;
  /** Embed inside Operating Loop without outer Reveal delay. */
  embedded?: boolean;
};

/**
 * Predicted vs actual outcome improvement — strengthens the Operating Loop.
 */
export function OutcomeImpactPanel({ impact, embedded = false }: Props) {
  const body = (
    <section
      aria-label="Outcome Impact"
      className={embedded ? "mt-4 space-y-2" : undefined}
      data-outcome-impact="true"
    >
      {!embedded ? (
        <ExsSectionHeader
          label="Outcome Impact"
          icon={EXECUTIVE_ICONS.strategic_outcomes}
        />
      ) : (
        <ExsSectionHeader
          label="Outcome Progress"
          icon={EXECUTIVE_ICONS.strategic_outcomes}
          className="mb-0"
        />
      )}
      <article
        className={
          embedded
            ? "space-y-2 border-t border-[var(--exs-divider)] pt-3"
            : "exs-card space-y-3 p-[var(--exs-space-5)]"
        }
      >
        <div className="flex flex-wrap items-start justify-between gap-2">
          <p className="exs-title text-[length:0.9rem]">{impact.outcomeName}</p>
          <ExsOpenLink href={impact.href} className="shrink-0">
            Open Outcome →
          </ExsOpenLink>
        </div>
        <dl className="grid gap-2 sm:grid-cols-2">
          <Row label="Predicted improvement" value={impact.predictedImprovement} />
          <Row label="Actual improvement" value={impact.actualImprovement} />
          <Row label="Variance" value={impact.variance} />
        </dl>
        <p className="exs-body text-[length:0.8rem]">
          <span className="font-medium text-[var(--exs-text)]">Learning. </span>
          {impact.learning}
        </p>
      </article>
    </section>
  );

  if (embedded) return body;
  return <Reveal delay={3}>{body}</Reveal>;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="exs-label">{label}</dt>
      <dd className="exs-body mt-0.5 text-[length:0.8rem]">{value}</dd>
    </div>
  );
}
