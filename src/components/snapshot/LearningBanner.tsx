"use client";

import type { LearningMaturity } from "@/onboarding";

type LearningBannerProps = {
  maturity: LearningMaturity;
};

/**
 * Shown during the first ~30 days while ExecutiveOS is learning.
 * Hides automatically once maturity exceeds the configured threshold.
 */
export function LearningBanner({ maturity }: LearningBannerProps) {
  if (!maturity.showLearningBanner) return null;

  return (
    <section
      aria-label="Learning progress"
      className="mb-6 rounded-xl border border-[var(--eos-border)] bg-[var(--eos-surface-solid)] px-5 py-4 shadow-[var(--eos-shadow-1)]"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--eos-accent)]">
            Learning
          </p>
          <p className="mt-1 text-sm leading-6 text-[var(--eos-text-secondary)]">
            ExecutiveOS is still learning your organisation — day{" "}
            {maturity.daysActive + 1} of the first month.
          </p>
        </div>
        <p className="text-xs text-[var(--eos-text-muted)]">
          Overall maturity {Math.round(
            (maturity.discoveryConfidence +
              maturity.organisationCoverage +
              maturity.executiveProfileConfidence) /
              3,
          )}
          %
        </p>
      </div>

      <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Stat label="Discovery confidence" value={`${maturity.discoveryConfidence}%`} />
        <Stat
          label="Organisation coverage"
          value={`${maturity.organisationCoverage}%`}
        />
        <Stat
          label="Connected systems"
          value={String(maturity.connectedSystems.length)}
        />
        <Stat
          label="Knowledge Graph growth"
          value={`+${maturity.knowledgeGraphGrowth}`}
        />
        <Stat
          label="Executive profile"
          value={`${maturity.executiveProfileConfidence}%`}
        />
      </dl>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--eos-text-muted)]">
        {label}
      </dt>
      <dd className="mt-1 font-display text-base font-semibold tracking-tight text-[var(--eos-text)]">
        {value}
      </dd>
    </div>
  );
}
