import { EXECUTIVE_ICONS } from "@/experience/icons";
import { ExsOpenLink, ExsSectionHeader } from "@/experience/exs";
import { Reveal } from "@/experience/motion/Reveal";
import type { DwPortfolioCard } from "@/experience/decision-workspace/types";
import { cn } from "@/lib/utils/cn";

type Props = {
  cards: DwPortfolioCard[];
  selectedId: string | null;
  focused?: boolean;
  onSelect: (id: string) => void;
};

export function DecisionPortfolio({
  cards,
  selectedId,
  focused,
  onSelect,
}: Props) {
  return (
    <Reveal delay={1}>
      <section
        id="decision-portfolio"
        aria-label="Decision Portfolio"
        className={cn(
          "scroll-mt-6",
          focused && "exs-entry-focus rounded-[var(--exs-radius)]",
        )}
      >
        <ExsSectionHeader
          label="Decision Portfolio"
          icon={EXECUTIVE_ICONS.decisions}
        />
        {cards.length === 0 ? (
          <article className="exs-card">
            <p className="exs-title text-[length:1rem]">No decisions waiting</p>
            <p className="exs-body mt-1">
              High-value judgements linked to Strategy will appear here.
            </p>
          </article>
        ) : (
          <ul className="grid gap-2 lg:grid-cols-2">
            {cards.map((card, index) => {
              const selected = card.id === selectedId;
              return (
                <li key={card.id}>
                  <article
                    className={cn(
                      "exs-card h-full cursor-pointer",
                      selected && "exs-entry-focus",
                    )}
                  >
                    <header className="flex items-start justify-between gap-3">
                      <button
                        type="button"
                        className="exs-label flex min-w-0 items-center gap-1.5 text-left"
                        onClick={() => onSelect(card.id)}
                      >
                        <EXECUTIVE_ICONS.decisions
                          className="h-3.5 w-3.5 shrink-0"
                          strokeWidth={1.75}
                          aria-hidden="true"
                        />
                        <span>#{index + 1}</span>
                      </button>
                      <ExsOpenLink href={card.href}>Open →</ExsOpenLink>
                    </header>
                    <button
                      type="button"
                      className="mt-2 w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--eos-ring)]"
                      onClick={() => onSelect(card.id)}
                    >
                      <h3 className="exs-title text-[length:0.95rem]">
                        {card.name}
                      </h3>
                      <dl className="mt-2 grid grid-cols-2 gap-2 text-[length:0.75rem]">
                        <div>
                          <dt className="exs-label">Expected value</dt>
                          <dd className="exs-body mt-0.5">{card.expectedValue}</dd>
                        </div>
                        <div>
                          <dt className="exs-label">Health impact</dt>
                          <dd className="exs-body mt-0.5">{card.healthImpact}</dd>
                        </div>
                        <div>
                          <dt className="exs-label">Confidence</dt>
                          <dd className="exs-body mt-0.5">{card.confidence}%</dd>
                        </div>
                        <div>
                          <dt className="exs-label">Cost of delay</dt>
                          <dd className="exs-body mt-0.5 line-clamp-2">
                            {card.costOfDelay}
                          </dd>
                        </div>
                      </dl>
                      <p className="exs-label mt-2 capitalize">{card.status}</p>
                    </button>
                  </article>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </Reveal>
  );
}
