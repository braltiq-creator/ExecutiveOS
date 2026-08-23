import {
  Brain,
  Gem,
  ShieldAlert,
  Target,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { Reveal } from "@/experience/motion/Reveal";
import { EXECUTIVE_ICONS } from "@/experience/icons";
import { ExsPriorityCard, ExsSectionHeader } from "@/experience/exs";
import type { McSnapshotCard } from "@/experience/mission-control/types";

type Props = {
  cards: McSnapshotCard[];
};

const PRIORITY_ICONS: Record<string, LucideIcon> = {
  lead: Brain,
  focus: Target,
  opportunity: Gem,
  recommendation: TrendingUp,
  risk: ShieldAlert,
};

/** Fixed left panel — Executive Priorities. Never scrolls. Max five. */
export function PrioritiesPanel({ cards }: Props) {
  return (
    <Reveal delay={3} className="flex min-h-0 min-w-0 flex-1 flex-col">
      <section
        aria-label="Executive Priorities"
        className="mc-priorities flex min-h-0 flex-1 flex-col"
      >
        <ExsSectionHeader
          label="Executive Priorities"
          icon={EXECUTIVE_ICONS.priorities}
        />
        <ul className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
          {cards.map((card) => (
            <li key={card.id} className="min-h-0 shrink">
              <ExsPriorityCard
                card={card}
                icon={PRIORITY_ICONS[card.id] ?? Target}
              />
            </li>
          ))}
        </ul>
      </section>
    </Reveal>
  );
}

/** @deprecated Use PrioritiesPanel */
export const SnapshotPanel = PrioritiesPanel;
