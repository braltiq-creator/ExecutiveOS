import Link from "next/link";
import { ExperiencePage } from "@/experience/layouts/ExperiencePage";
import { ExperienceCardShell } from "@/experience/design-system/Card";
import { ExperienceBadge } from "@/experience/design-system/Badge";
import { ExperienceEmptyState } from "@/experience/design-system/EmptyState";

/**
 * Knowledge primary surface — V1 foundation.
 * Engines exist (`knowledge-graph`, organisational memory); full explorer deferred (KI-001).
 */
export function KnowledgeFoundation() {
  return (
    <ExperiencePage width="brief" className="space-y-8 pb-16">
      <header className="space-y-3 pt-2">
        <ExperienceBadge tone="neutral">Knowledge</ExperienceBadge>
        <h1 className="ex-display">Institutional memory</h1>
        <p className="ex-body max-w-xl">
          Connected context for Understand and Learn — relationships, episodes,
          and lessons that ground today’s recommendations.
        </p>
      </header>

      <ExperienceEmptyState
        title="Explorer deepens next"
        description="The knowledge graph and organisational memory engines already power Today. This workspace will surface them for open exploration without leaving the executive path."
        action={
          <div className="flex flex-wrap gap-3 pt-1">
            <Link
              href="/admin/memory"
              className="inline-flex min-h-9 items-center rounded-[var(--ex-radius)] bg-[var(--ex-accent)] px-3 text-sm font-medium text-white"
            >
              Open memory admin
            </Link>
            <Link
              href="/today"
              className="inline-flex min-h-9 items-center rounded-[var(--ex-radius)] border border-[var(--eos-border)] px-3 text-sm font-medium text-[var(--ex-text)]"
            >
              Return to Today
            </Link>
          </div>
        }
      />

      <ExperienceCardShell className="space-y-2">
        <p className="ex-caption">V1 note</p>
        <p className="ex-body">
          Primary daily value remains the Executive Brief. Knowledge exploration
          is certified as a foundation surface for Version 1 — see Known Issues
          KI-001.
        </p>
      </ExperienceCardShell>
    </ExperiencePage>
  );
}
