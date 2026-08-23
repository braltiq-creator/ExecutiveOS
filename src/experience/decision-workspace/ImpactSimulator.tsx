import { EXECUTIVE_ICONS } from "@/experience/icons";
import { ExsOpenLink, ExsSectionHeader, ExsTrend } from "@/experience/exs";
import { Reveal } from "@/experience/motion/Reveal";
import type { DwSimulator } from "@/experience/decision-workspace/types";
import { cn } from "@/lib/utils/cn";

type Props = {
  simulator: DwSimulator | null;
  focused?: boolean;
};

/** Centrepiece — predicted effect of approving the selected decision. */
export function ImpactSimulator({ simulator, focused }: Props) {
  return (
    <Reveal delay={3}>
      <section
        id="impact-simulator"
        aria-label="Decision Impact Simulator"
        className={cn(
          "scroll-mt-6",
          focused && "exs-entry-focus rounded-[var(--exs-radius)]",
        )}
      >
        <ExsSectionHeader
          label="Decision Impact Simulator"
          icon={EXECUTIVE_ICONS.organisation_health}
        />
        {!simulator ? (
          <article className="exs-card">
            <p className="exs-body">Select a decision to simulate impact.</p>
          </article>
        ) : (
          <article className="exs-card space-y-4 p-[var(--exs-space-5)]">
            <div>
              <p className="exs-label">Selected decision</p>
              <p className="exs-title mt-1 text-[length:1.05rem]">
                {simulator.decisionName}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <MetricPair
                label="Organisation Health"
                before={String(simulator.organisationHealth.before)}
                after={String(simulator.organisationHealth.after)}
                trend={simulator.organisationHealth.trend}
              />
              <MetricPair
                label="Commercial Health"
                before={simulator.commercialHealth.before}
                after={simulator.commercialHealth.after}
                trend={simulator.commercialHealth.trend}
              />
            </div>

            <dl className="grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="exs-label">Strategic outcome impact</dt>
                <dd className="exs-body mt-1">
                  {simulator.strategicOutcomeImpact}
                </dd>
              </div>
              <div>
                <dt className="exs-label">Executive value impact</dt>
                <dd className="exs-body mt-1">
                  {simulator.executiveValueImpact}
                </dd>
              </div>
            </dl>

            <div className="flex flex-wrap items-end justify-between gap-3 border-t border-[var(--exs-divider)] pt-3">
              <p className="exs-body max-w-2xl">
                <span className="font-medium text-[var(--exs-text)]">
                  Recommendation.{" "}
                </span>
                {simulator.recommendation}
              </p>
              <div className="flex flex-col items-end gap-2">
                <p className="exs-value text-[length:1.1rem]">
                  {simulator.confidence}%
                  <span className="ml-1 exs-label font-normal">confidence</span>
                </p>
                <ExsOpenLink href="/knowledge?from=simulator">
                  Why trust this? →
                </ExsOpenLink>
              </div>
            </div>
          </article>
        )}
      </section>
    </Reveal>
  );
}

function MetricPair({
  label,
  before,
  after,
  trend,
}: {
  label: string;
  before: string;
  after: string;
  trend: "up" | "down" | "flat";
}) {
  return (
    <div className="rounded-[var(--exs-radius-sm)] border border-[var(--exs-border)] px-3 py-3">
      <p className="exs-label">{label}</p>
      <p className="mt-2 flex items-center gap-2">
        <span className="exs-value text-[length:1.35rem] text-[var(--exs-text-muted)]">
          {before}
        </span>
        <span className="exs-label">→</span>
        <span className="exs-value text-[length:1.35rem]">{after}</span>
        <ExsTrend trend={trend} />
      </p>
      <p className="exs-label mt-1 normal-case">Before → After</p>
    </div>
  );
}
