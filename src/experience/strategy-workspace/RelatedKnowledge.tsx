import { EXECUTIVE_ICONS } from "@/experience/icons";
import { ExsOpenLink, ExsSectionHeader } from "@/experience/exs";
import { Reveal } from "@/experience/motion/Reveal";
import type { SwKnowledge } from "@/experience/strategy-workspace/types";

type Props = {
  items: SwKnowledge[];
};

export function RelatedKnowledge({ items }: Props) {
  return (
    <Reveal delay={7}>
      <section
        id="related-knowledge"
        aria-label="Related Knowledge"
        className="scroll-mt-6"
      >
        <ExsSectionHeader
          label="Related Knowledge"
          icon={EXECUTIVE_ICONS.knowledge}
        />
        {items.length === 0 ? (
          <article className="exs-card">
            <p className="exs-title text-[length:1rem]">No supporting evidence yet</p>
            <p className="exs-body mt-1">
              Knowledge linked to strategy will appear as signals mature.
            </p>
          </article>
        ) : (
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.id}>
                <article className="exs-card flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="exs-label">{item.kind}</p>
                    <p className="exs-title mt-1 text-[length:0.9rem]">
                      {item.title}
                    </p>
                  </div>
                  <ExsOpenLink href={item.href} className="shrink-0">
                    Open Knowledge →
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
