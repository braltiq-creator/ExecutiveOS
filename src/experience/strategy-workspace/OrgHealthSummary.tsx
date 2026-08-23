import { EXECUTIVE_ICONS } from "@/experience/icons";
import { ExsSectionHeader, ExsTrend } from "@/experience/exs";
import { Reveal } from "@/experience/motion/Reveal";
import type { SwOrgHealth } from "@/experience/strategy-workspace/types";
import { cn } from "@/lib/utils/cn";

type Props = {
  health: SwOrgHealth;
  focused?: boolean;
};

export function OrgHealthSummary({ health, focused }: Props) {
  return (
    <Reveal delay={1}>
      <section
        id="organisation-health"
        aria-label="Organisation Health"
        className={cn(
          "scroll-mt-6",
          focused && "exs-entry-focus rounded-[var(--exs-radius)]",
        )}
      >
        <ExsSectionHeader
          label="Organisation Health"
          icon={EXECUTIVE_ICONS.organisation_health}
        />
        <article className="exs-card gap-4 p-[var(--exs-space-5)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="exs-label">Current score</p>
              <p className="exs-value text-[length:2.5rem]">{health.score}</p>
              <p className="mt-1 flex items-center gap-1.5 text-[length:0.8rem]">
                <ExsTrend trend={health.trend} severity={health.severity} />
                <span className="text-[var(--exs-text-secondary)]">
                  {health.confidence}% confidence
                </span>
              </p>
            </div>
            <div className="min-w-[12rem] flex-1">
              <p className="exs-label mb-2">Historical trend</p>
              <Sparkline values={health.history} />
            </div>
          </div>

          <div className="space-y-2">
            <p className="exs-title text-[length:1rem]">{health.summary}</p>
            <p className="exs-body">
              <span className="font-medium text-[var(--exs-text)]">Why it moved. </span>
              {health.whyMoved}
            </p>
            <p className="exs-label normal-case">
              Organisation Health is a derived indicator of Outcome Portfolio
              progress — not the destination.
            </p>
          </div>

          <div>
            <p className="exs-label mb-2">Primary drivers</p>
            <ul className="grid gap-2 sm:grid-cols-3">
              {health.primaryDrivers.map((driver) => (
                <li
                  key={driver}
                  className={cn(
                    "rounded-[var(--exs-radius-sm)] border border-[var(--exs-border)] px-3 py-2 exs-body text-[length:0.8rem]",
                    focused && "exs-factor-chip",
                  )}
                >
                  {driver}
                </li>
              ))}
            </ul>
          </div>
        </article>
      </section>
    </Reveal>
  );
}

function Sparkline({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const span = Math.max(1, max - min);

  return (
    <div
      className="flex h-12 items-end gap-1"
      role="img"
      aria-label="Organisation Health trend"
    >
      {values.map((v, i) => (
        <span
          key={`${v}-${i}`}
          className="flex-1 rounded-sm bg-[color-mix(in_srgb,var(--exs-nav)_35%,transparent)]"
          style={{ height: `${18 + ((v - min) / span) * 70}%` }}
        />
      ))}
    </div>
  );
}
