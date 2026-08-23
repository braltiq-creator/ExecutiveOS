import { EXECUTIVE_ICONS } from "@/experience/icons";
import { ExsSectionHeader } from "@/experience/exs";
import { Reveal } from "@/experience/motion/Reveal";
import type { IntelligenceScore } from "@/experience/intelligence-engine/types";
import { cn } from "@/lib/utils/cn";

type Props = {
  score: IntelligenceScore;
  focused?: boolean;
};

/**
 * Full intelligence diagnostics — Knowledge / Intelligence workspace only.
 * Not shown on Today Mission Control.
 */
export function IntelligenceDiagnostics({ score, focused }: Props) {
  return (
    <Reveal delay={3}>
      <section
        id="intelligence-diagnostics"
        aria-label="Intelligence Diagnostics"
        className={cn(
          "scroll-mt-6",
          focused && "exs-entry-focus rounded-[var(--exs-radius)]",
        )}
        data-intelligence-diagnostics="true"
      >
        <ExsSectionHeader
          label="Intelligence Diagnostics"
          icon={EXECUTIVE_ICONS.executive_intelligence}
        />
        <article className="exs-card space-y-3 p-[var(--exs-space-5)]">
          <p className="exs-value text-[length:2rem] leading-none">
            {score.overall}
            <span className="ml-2 exs-label font-normal">
              Executive Intelligence
            </span>
          </p>
          <dl className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            <Metric label="Confidence" value={`${score.confidence}%`} />
            <Metric
              label="Evidence coverage"
              value={`${score.evidenceCoverage}%`}
            />
            <Metric
              label="Evidence freshness"
              value={`${score.evidenceFreshness}%`}
            />
            <Metric
              label="Recommendation quality"
              value={`${score.recommendationQuality}%`}
            />
            <Metric label="Data quality" value={`${score.dataQuality}%`} />
          </dl>
          <p className="exs-body text-[length:0.85rem]">{score.explanation}</p>
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
