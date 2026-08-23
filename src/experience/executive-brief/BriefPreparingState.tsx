/**
 * Morning briefing loading — intentional, never theatrical.
 * Disappears as soon as the route is ready (no artificial delay).
 */

const STEPS = [
  "Reviewing overnight changes",
  "Preparing today's priorities",
  "Analysing strategic outcomes",
  "Finalising executive recommendations",
] as const;

export function BriefPreparingState() {
  return (
    <div
      className="ex-canvas mx-auto w-full max-w-3xl space-y-8 py-10"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Preparing your Executive Brief"
    >
      <div className="space-y-3">
        <p className="ex-caption">Executive Brief</p>
        <h1 className="ex-display ex-display-hero">
          Preparing your Executive Brief
        </h1>
        <p className="ex-body max-w-md">
          ExecutiveOS is assembling today&apos;s judgements from overnight
          signals.
        </p>
      </div>

      <ul className="space-y-3" aria-hidden="true">
        {STEPS.map((step, index) => (
          <li
            key={step}
            className="flex items-center gap-3"
            style={{ opacity: 1 - index * 0.12 }}
          >
            <span className="ex-skeleton h-2 w-2 shrink-0 rounded-full" />
            <span className="ex-body text-[var(--ex-text-secondary)]">
              {step}
            </span>
          </li>
        ))}
      </ul>

      <div className="space-y-3 pt-4" aria-hidden="true">
        <div className="ex-skeleton h-10 w-2/3 max-w-md" />
        <div className="ex-skeleton h-24 w-full" />
        <div className="ex-skeleton h-16 w-full max-w-xl" />
      </div>

      <span className="sr-only">
        Preparing your Executive Brief. Reviewing overnight changes. Preparing
        today&apos;s priorities. Analysing strategic outcomes. Finalising
        executive recommendations.
      </span>
    </div>
  );
}
