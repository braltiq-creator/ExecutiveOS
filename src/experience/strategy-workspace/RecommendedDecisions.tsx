import { EXECUTIVE_ICONS } from "@/experience/icons";
import { ExsOpenLink, ExsSectionHeader } from "@/experience/exs";
import { Reveal } from "@/experience/motion/Reveal";
import type { SwDecision } from "@/experience/strategy-workspace/types";
import { cn } from "@/lib/utils/cn";

type Props = {
  decisions: SwDecision[];
  focused?: boolean;
};

export function RecommendedDecisions({ decisions, focused }: Props) {
  return (
    <Reveal delay={6}>
      <section
        id="recommended-decisions"
        aria-label="Recommended Decisions"
        className={cn(
          "scroll-mt-6",
          focused && "exs-entry-focus rounded-[var(--exs-radius)]",
        )}
      >
        <ExsSectionHeader
          label="Recommended Decisions"
          icon={EXECUTIVE_ICONS.priority_decisions}
        />
        {decisions.length === 0 ? (
          <article className="exs-card">
            <p className="exs-title text-[length:1rem]">No decisions waiting</p>
            <p className="exs-body mt-1">
              Decisions that move Organisation Health will surface here.
            </p>
          </article>
        ) : (
          <ul className="space-y-2">
            {decisions.map((decision) => (
              <li key={decision.id}>
                <article className="exs-card">
                  <header className="flex items-start justify-between gap-3">
                    <h3 className="exs-title text-[length:0.95rem]">
                      {decision.title}
                    </h3>
                    <ExsOpenLink href={decision.href}>
                      Open Decision →
                    </ExsOpenLink>
                  </header>
                  <dl className="mt-2 grid gap-2 sm:grid-cols-3">
                    <div>
                      <dt className="exs-label">Expected improvement</dt>
                      <dd className="exs-body mt-0.5 text-[length:0.8rem]">
                        {decision.expectedImprovement}
                      </dd>
                    </div>
                    <div>
                      <dt className="exs-label">Confidence</dt>
                      <dd className="exs-body mt-0.5 text-[length:0.8rem]">
                        {decision.confidence}%
                      </dd>
                    </div>
                    <div>
                      <dt className="exs-label">Cost of delay</dt>
                      <dd className="exs-body mt-0.5 text-[length:0.8rem]">
                        {decision.costOfDelay}
                      </dd>
                    </div>
                  </dl>
                </article>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Reveal>
  );
}
