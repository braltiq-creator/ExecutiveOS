import Link from "next/link";
import { EXECUTIVE_ICONS } from "@/experience/icons";
import { ExsTrend } from "@/experience/exs";
import { Reveal } from "@/experience/motion/Reveal";
import type { SwOrgHealth } from "@/experience/strategy-workspace/types";

type Props = {
  health: SwOrgHealth;
  entryLabel: string;
};

export function StrategyHeader({ health, entryLabel }: Props) {
  const Icon = EXECUTIVE_ICONS.strategy;

  return (
    <Reveal delay={0}>
      <header className="space-y-3 border-b border-[var(--exs-divider)] pb-4">
        <nav aria-label="Breadcrumb" className="exs-label">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link
                href="/today"
                className="text-[var(--exs-nav)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--eos-ring)]"
              >
                Today
              </Link>
            </li>
            <li aria-hidden="true" className="text-[var(--exs-text-muted)]">
              →
            </li>
            <li aria-current="page">Strategy</li>
          </ol>
        </nav>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0 space-y-1">
            <p className="exs-label flex items-center gap-1.5">
              <Icon
                className="h-3.5 w-3.5"
                strokeWidth={1.75}
                aria-hidden="true"
              />
              Strategy Workspace
            </p>
            <h1 className="exs-title text-[length:1.45rem]">
              Organisation Health
            </h1>
            <p className="exs-body text-[length:0.8rem]">
              {entryLabel}
              <span className="mx-2 text-[var(--exs-text-muted)]">·</span>
              Updated {health.updatedLabel}
            </p>
          </div>

          <div className="text-right">
            <p className="exs-label">Current score</p>
            <p className="exs-value text-[length:2rem] leading-none">
              {health.score}
            </p>
            <p className="mt-1 flex items-center justify-end gap-1.5 text-[length:0.75rem] text-[var(--exs-text-secondary)]">
              <ExsTrend trend={health.trend} severity={health.severity} />
              <span>{health.confidence}% confidence</span>
            </p>
          </div>
        </div>
      </header>
    </Reveal>
  );
}

export function entryArrivalLabel(entry: string): string {
  switch (entry) {
    case "organisation_health":
      return "Arrived from Organisation Health";
    case "strategic_outcomes":
      return "Arrived from Strategic Outcomes";
    case "commercial_health":
      return "Arrived from Commercial Health";
    case "priority":
      return "Arrived from Executive Priorities";
    case "activity":
      return "Arrived from Activity Feed";
    default:
      return "Explaining organisational health";
  }
}
