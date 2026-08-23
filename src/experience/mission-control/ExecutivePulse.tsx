import { Reveal } from "@/experience/motion/Reveal";
import { EXECUTIVE_ICONS } from "@/experience/icons";
import { ExsSectionHeader } from "@/experience/exs";
import type { McPulse, McPulseSignal } from "@/experience/mission-control/types";
import { cn } from "@/lib/utils/cn";

type Props = {
  pulse: McPulse;
};

/** Permanent organisational orientation beneath the KPI bar. */
export function ExecutivePulse({ pulse }: Props) {
  return (
    <Reveal delay={2}>
      <section
        aria-label="Executive Pulse"
        className="mc-pulse rounded-[var(--exs-radius)] border border-[var(--exs-border)] bg-[var(--exs-surface)] px-3 py-2 shadow-[var(--exs-shadow-1)]"
      >
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          <ExsSectionHeader
            label="Executive Pulse"
            icon={EXECUTIVE_ICONS.pulse}
            className="mb-0"
          />
          {pulse.signals.map((signal) => (
            <PulseChip key={signal.id} signal={signal} />
          ))}
          <p className="ml-auto flex items-baseline gap-1.5 text-[length:0.7rem] text-[var(--exs-text-muted)]">
            <span>Overall Confidence</span>
            <span className="exs-value text-[length:0.95rem]">
              {pulse.confidence}%
            </span>
          </p>
        </div>
      </section>
    </Reveal>
  );
}

function PulseChip({ signal }: { signal: McPulseSignal }) {
  const mark =
    signal.mark === "up" ? "▲" : signal.mark === "down" ? "▼" : "●";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[length:0.75rem]",
        signal.severity === "positive" && "exs-trend-positive",
        signal.severity === "negative" && "exs-trend-negative",
        signal.severity === "warning" && "exs-trend-attention",
        signal.severity === "critical" && "exs-trend-critical",
        signal.severity === "neutral" && "exs-trend-neutral",
      )}
    >
      <span aria-hidden="true">{mark}</span>
      <span className="text-[var(--exs-text-secondary)]">{signal.text}</span>
    </span>
  );
}
