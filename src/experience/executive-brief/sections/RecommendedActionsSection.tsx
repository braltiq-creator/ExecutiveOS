import { Reveal } from "@/experience/motion/Reveal";
import { ExperienceEmptyState } from "@/experience/design-system/EmptyState";
import { SnapshotCta } from "@/experience/executive-brief/SnapshotCta";
import type { SnapshotAction } from "@/lib/snapshot/types";

type Props = {
  actions: SnapshotAction[];
  delay?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
};

/**
 * Ranked awareness checklist — never completed from Today.
 * Open Workspace continues execution elsewhere.
 */
export function RecommendedActionsSection({ actions, delay = 8 }: Props) {
  const items = actions.slice(0, 5);

  return (
    <Reveal delay={delay}>
      <section
        id="recommended-actions"
        aria-labelledby="recommended-actions-heading"
        className="ex-snapshot-block"
      >
        <p className="ex-caption mb-2">Where should I go next?</p>
        <h2 id="recommended-actions-heading" className="sr-only">
          Recommended actions
        </h2>

        {items.length === 0 ? (
          <ExperienceEmptyState
            title="No actions required right now"
            description="Protect focus on the lead judgement."
            action={
              <SnapshotCta href="/decisions">Open Workspace</SnapshotCta>
            }
          />
        ) : (
          <ol className="divide-y divide-[var(--eos-border)] rounded-[var(--ex-radius)] border border-[var(--eos-border)] bg-[var(--ex-surface)] shadow-[var(--eos-shadow-1)]">
            {items.map((action, index) => (
              <li key={action.id} className="space-y-2 px-4 py-3">
                <div className="grid gap-2 sm:grid-cols-[2rem_1fr]">
                  <span className="ex-caption tabular-nums">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 space-y-1">
                    <p className="ex-heading text-sm">{action.title}</p>
                    <p className="ex-body text-[length:0.8rem] text-[var(--ex-text)]">
                      <span className="ex-caption mr-2">Expected value</span>
                      {action.expectedImpact ?? action.expectedOutcome}
                    </p>
                    <p className="ex-body text-[length:0.8rem]">
                      <span className="ex-caption mr-2">Owner</span>
                      Executive
                    </p>
                    <SnapshotCta href={action.href}>Open Workspace</SnapshotCta>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </Reveal>
  );
}
