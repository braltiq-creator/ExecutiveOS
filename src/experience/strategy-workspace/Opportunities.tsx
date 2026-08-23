import { EXECUTIVE_ICONS } from "@/experience/icons";
import { ExsOpenLink, ExsSectionHeader } from "@/experience/exs";
import { Reveal } from "@/experience/motion/Reveal";
import type { SwOpportunity } from "@/experience/strategy-workspace/types";

type Props = {
  opportunities: SwOpportunity[];
};

export function Opportunities({ opportunities }: Props) {
  return (
    <Reveal delay={5}>
      <section
        id="strategic-opportunities"
        aria-label="Strategic Opportunities"
        className="scroll-mt-6"
      >
        <ExsSectionHeader
          label="Strategic Opportunities"
          icon={EXECUTIVE_ICONS.executive_value}
        />
        {opportunities.length === 0 ? (
          <article className="exs-card">
            <p className="exs-title text-[length:1rem]">No ranked opportunities</p>
            <p className="exs-body mt-1">
              Opportunities appear when recommendations align to outcomes.
            </p>
          </article>
        ) : (
          <ol className="space-y-2">
            {opportunities.map((item, index) => (
              <li key={item.id}>
                <article className="exs-card">
                  <header className="flex items-start justify-between gap-3">
                    <p className="exs-label">#{index + 1}</p>
                    <ExsOpenLink href={item.href}>
                      Open Opportunity →
                    </ExsOpenLink>
                  </header>
                  <h3 className="exs-title mt-1 text-[length:0.95rem]">
                    {item.title}
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[length:0.75rem] text-[var(--exs-text-secondary)]">
                    <span>{item.expectedValue}</span>
                    <span>{item.confidence}% confidence</span>
                  </div>
                  <p className="exs-body mt-2 text-[length:0.8rem]">
                    <span className="font-medium text-[var(--exs-text)]">
                      Recommended action.{" "}
                    </span>
                    {item.action}
                  </p>
                </article>
              </li>
            ))}
          </ol>
        )}
      </section>
    </Reveal>
  );
}
