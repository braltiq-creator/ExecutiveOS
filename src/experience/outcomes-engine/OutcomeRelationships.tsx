import { EXECUTIVE_ICONS } from "@/experience/icons";
import { ExsOpenLink, ExsSectionHeader } from "@/experience/exs";
import { Reveal } from "@/experience/motion/Reveal";
import type { OutcomeRelation } from "@/experience/outcomes-engine/types";

type Props = {
  items: OutcomeRelation[];
};

/** Navigable links from an outcome to the rest of ExecutiveOS. */
export function OutcomeRelationships({ items }: Props) {
  if (items.length === 0) return null;

  return (
    <Reveal delay={3}>
      <section
        id="outcome-relationships"
        aria-label="Outcome Relationships"
        className="scroll-mt-6"
        data-outcome-relationships="true"
      >
        <ExsSectionHeader
          label="Outcome Relationships"
          icon={EXECUTIVE_ICONS.priorities}
        />
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <li key={item.id}>
              <article className="exs-card flex h-full flex-col justify-between gap-2">
                <div>
                  <p className="exs-label">{item.kind}</p>
                  <p className="exs-title mt-1 text-[length:0.85rem]">
                    {item.label}
                  </p>
                </div>
                <ExsOpenLink href={item.href}>Open →</ExsOpenLink>
              </article>
            </li>
          ))}
        </ul>
      </section>
    </Reveal>
  );
}
