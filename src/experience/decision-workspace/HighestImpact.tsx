import { EXECUTIVE_ICONS } from "@/experience/icons";
import { ExsOpenLink, ExsSectionHeader } from "@/experience/exs";
import { Reveal } from "@/experience/motion/Reveal";
import type { DwPortfolioCard } from "@/experience/decision-workspace/types";
import { cn } from "@/lib/utils/cn";

type Props = {
  card: DwPortfolioCard | null;
  focused?: boolean;
  onFocus: (id: string) => void;
};

export function HighestImpact({ card, focused, onFocus }: Props) {
  return (
    <Reveal delay={2}>
      <section
        id="highest-impact"
        aria-label="Highest Impact Decision"
        className={cn(
          "scroll-mt-6",
          focused && "exs-entry-focus rounded-[var(--exs-radius)]",
        )}
      >
        <ExsSectionHeader
          label="Highest Impact Decision"
          icon={EXECUTIVE_ICONS.executive_value}
        />
        {!card ? (
          <article className="exs-card">
            <p className="exs-body">No decision ranked yet.</p>
          </article>
        ) : (
          <article className="exs-card p-[var(--exs-space-5)]">
            <header className="flex items-start justify-between gap-3">
              <p className="exs-label">Ranked #1 by organisational value</p>
              <ExsOpenLink href={card.href}>Open →</ExsOpenLink>
            </header>
            <button
              type="button"
              className="mt-2 w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--eos-ring)]"
              onClick={() => onFocus(card.id)}
            >
              <h3 className="exs-title text-[length:1.15rem]">{card.name}</h3>
              <p className="exs-body mt-2">
                <span className="font-medium text-[var(--exs-text)]">
                  Expected value.{" "}
                </span>
                {card.expectedValue}
              </p>
              <p className="exs-body mt-1">
                <span className="font-medium text-[var(--exs-text)]">
                  Organisation Health.{" "}
                </span>
                {card.healthImpact}
              </p>
              <p className="exs-body mt-1 text-[length:0.8rem]">
                {card.confidence}% confidence · Delay: {card.costOfDelay}
              </p>
            </button>
          </article>
        )}
      </section>
    </Reveal>
  );
}
