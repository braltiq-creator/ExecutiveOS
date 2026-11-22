/**
 * Cognitive switch — calm arrival into the intelligence environment.
 * Disappears as soon as the route is ready (no artificial delay).
 */

const STEPS = [
  "Disengaging from operational noise",
  "Reviewing what changed overnight",
  "Surfacing decisions that require judgement",
  "Preparing your briefing",
] as const;

export function BriefPreparingState() {
  return (
    <div
      className="ex-canvas mx-auto flex w-full max-w-2xl flex-col justify-center space-y-10 py-16"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Entering ExecutiveOS"
      data-cognitive-switch="true"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2.5">
          <span
            className="exs-intel-indicator inline-flex size-1.5 rounded-full bg-[var(--exs-intelligence,var(--eos-teal))]"
            data-live="true"
            aria-hidden="true"
          />
          <p className="eos-type-label tracking-[0.12em] text-[var(--exs-text-muted)]">
            ExecutiveOS
          </p>
        </div>
        <h1 className="font-display text-[length:clamp(1.65rem,3vw,2.15rem)] font-semibold tracking-[-0.03em] text-[var(--exs-text,var(--eos-text))]">
          You&apos;re here.
        </h1>
        <p className="max-w-md text-[length:0.95rem] leading-relaxed text-[var(--exs-text-secondary)]">
          Your organisation has been analysed. Preparing what matters —
          then we get to work.
        </p>
      </div>

      <ul className="space-y-3" aria-hidden="true">
        {STEPS.map((step, index) => (
          <li
            key={step}
            className="flex items-center gap-3"
            style={{ opacity: 1 - index * 0.14 }}
          >
            <span
              className="h-1 w-1 shrink-0 rounded-full bg-[var(--exs-nav,var(--eos-blue))]"
              aria-hidden="true"
            />
            <span className="text-[length:0.875rem] text-[var(--exs-text-secondary)]">
              {step}
            </span>
          </li>
        ))}
      </ul>

      <div className="space-y-3 pt-2" aria-hidden="true">
        <div className="ex-skeleton h-3 w-24 rounded-sm" />
        <div className="ex-skeleton h-12 w-full max-w-lg rounded-[var(--eos-radius-md)]" />
        <div className="ex-skeleton h-20 w-full rounded-[var(--eos-radius-md)]" />
      </div>

      <span className="sr-only">
        Entering ExecutiveOS. Preparing your executive briefing from available
        intelligence.
      </span>
    </div>
  );
}
