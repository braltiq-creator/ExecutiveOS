import Link from "next/link";
import { ExperiencePage } from "@/experience/layouts/ExperiencePage";
import { ExperienceCardShell } from "@/experience/design-system/Card";
import { ExperienceBadge } from "@/experience/design-system/Badge";
import { ExperienceEmptyState } from "@/experience/design-system/EmptyState";

/**
 * Reports primary surface — V1 foundation.
 * Value narratives already ship at `/value`; board composition deferred (KI-001).
 */
export function ReportsFoundation() {
  return (
    <ExperiencePage width="brief" className="space-y-8 pb-16">
      <header className="space-y-3 pt-2">
        <ExperienceBadge tone="neutral">Reports</ExperienceBadge>
        <h1 className="ex-display">Leadership narrative</h1>
        <p className="ex-body max-w-xl">
          Outward board and ELT narratives composed from Intent, Outcomes,
          Decisions, and Actions — not a second portfolio.
        </p>
      </header>

      <ExperienceEmptyState
        title="Board packs compose next"
        description="Executive Value reporting is available now. Formal board and ELT packs will assemble from the same operating truth already on Today and Strategy."
        action={
          <div className="flex flex-wrap gap-3 pt-1">
            <Link
              href="/value"
              className="inline-flex min-h-9 items-center rounded-[var(--ex-radius)] bg-[var(--ex-accent)] px-3 text-sm font-medium text-white"
            >
              View Executive Value
            </Link>
            <Link
              href="/strategy"
              className="inline-flex min-h-9 items-center rounded-[var(--ex-radius)] border border-[var(--eos-border)] px-3 text-sm font-medium text-[var(--ex-text)]"
            >
              Open Strategy
            </Link>
          </div>
        }
      />

      <ExperienceCardShell className="space-y-2">
        <p className="ex-caption">V1 note</p>
        <p className="ex-body">
          Reports is certified as a foundation surface for Version 1. Prefer
          Strategy and Value for leadership-ready narrative today — see Known
          Issues KI-001.
        </p>
      </ExperienceCardShell>
    </ExperiencePage>
  );
}
