import { ExperienceCardShell } from "@/experience/design-system/Card";
import { ExperienceIndicator } from "@/experience/design-system/Indicator";
import { ExperienceEmptyState } from "@/experience/design-system/EmptyState";
import { Reveal } from "@/experience/motion/Reveal";
import { SnapshotCta } from "@/experience/executive-brief/SnapshotCta";
import type { StrategicOutcome } from "@/strategy";
import type {
  SnapshotOutcome,
  SnapshotOutcomeStatus,
} from "@/lib/snapshot/types";

const statusTone: Record<
  SnapshotOutcomeStatus,
  "success" | "attention" | "critical" | "neutral"
> = {
  on_track: "success",
  watching: "neutral",
  at_risk: "attention",
  off_track: "critical",
};

type Props = {
  strategicOutcomes: StrategicOutcome[];
  snapshotOutcomes: SnapshotOutcome[];
  nextDecisionByOutcome?: Record<string, string>;
  delay?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
};

/** Max three — no expand. Depth lives in Strategy. */
export function StrategicOutcomesSection({
  strategicOutcomes,
  snapshotOutcomes,
  nextDecisionByOutcome = {},
  delay = 4,
}: Props) {
  const strategyVisible = strategicOutcomes.slice(0, 3);
  const snapshotVisible = snapshotOutcomes.slice(0, 3);

  return (
    <Reveal delay={delay}>
      <section
        id="strategic-outcomes"
        aria-labelledby="strategic-outcomes-heading"
        className="ex-snapshot-block"
      >
        <p className="ex-caption mb-2">Are outcomes on track?</p>
        <h2 id="strategic-outcomes-heading" className="sr-only">
          Strategic outcomes
        </h2>

        {strategyVisible.length > 0 ? (
          <ul className="space-y-2">
            {strategyVisible.map((outcome) => (
              <li key={outcome.id}>
                <ExperienceCardShell className="space-y-2 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="ex-heading text-base">{outcome.name}</p>
                    <ExperienceIndicator
                      tone={
                        outcome.currentHealth === "on_track" ||
                        outcome.currentHealth === "achieved"
                          ? "success"
                          : outcome.currentHealth === "at_risk"
                            ? "attention"
                            : outcome.currentHealth === "off_track"
                              ? "critical"
                              : "neutral"
                      }
                      label={outcome.currentHealth.replace(/_/g, " ")}
                    />
                  </div>
                  <p className="ex-body text-[length:0.85rem] text-[var(--ex-text)]">
                    Trajectory {outcome.strategicImportance} · Confidence{" "}
                    {outcome.confidence}%
                  </p>
                  <p className="ex-body text-[length:0.85rem]">
                    <span className="ex-caption mr-2">Next decision</span>
                    {nextDecisionByOutcome[outcome.id] ??
                      outcome.successMeasures[0] ??
                      "Review in Strategy"}
                  </p>
                  <SnapshotCta href="/strategy">Open Strategy</SnapshotCta>
                </ExperienceCardShell>
              </li>
            ))}
          </ul>
        ) : snapshotVisible.length > 0 ? (
          <ul className="space-y-2">
            {snapshotVisible.map((outcome) => (
              <li key={outcome.id}>
                <ExperienceCardShell className="space-y-2 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="ex-heading text-base">{outcome.name}</p>
                    <ExperienceIndicator
                      tone={statusTone[outcome.status]}
                      label={outcome.status.replace(/_/g, " ")}
                    />
                  </div>
                  <p className="ex-body text-[length:0.85rem] text-[var(--ex-text)]">
                    {outcome.momentumLabel} · Trajectory {outcome.trend}
                  </p>
                  <p className="ex-body text-[length:0.85rem]">
                    <span className="ex-caption mr-2">Next decision</span>
                    {outcome.movementLabel}
                  </p>
                  <SnapshotCta href={outcome.href}>Open Strategy</SnapshotCta>
                </ExperienceCardShell>
              </li>
            ))}
          </ul>
        ) : (
          <ExperienceEmptyState
            title="Outcomes settling in"
            description="Open Strategy when outcomes are ready to review."
            action={<SnapshotCta href="/strategy">Open Strategy</SnapshotCta>}
          />
        )}
      </section>
    </Reveal>
  );
}
