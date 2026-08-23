import { ExperienceCardShell } from "@/experience/design-system/Card";
import { ExperienceEmptyState } from "@/experience/design-system/EmptyState";
import { Reveal } from "@/experience/motion/Reveal";
import { SnapshotCta } from "@/experience/executive-brief/SnapshotCta";
import type { SnapshotAction, SnapshotDecision } from "@/lib/snapshot/types";

type Props = {
  decisions: SnapshotDecision[];
  actions: SnapshotAction[];
  delay?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
};

/** Max three — detail belongs in Decisions. */
export function PriorityDecisionsSection({
  decisions,
  actions,
  delay = 5,
}: Props) {
  const items = decisions.slice(0, 3).map((decision, index) => {
    const related =
      actions.find(
        (a) =>
          a.title
            .toLowerCase()
            .includes(decision.title.slice(0, 12).toLowerCase()) ||
          decision.title
            .toLowerCase()
            .includes(a.title.slice(0, 12).toLowerCase()),
      ) ?? actions[index];
    return { decision, related };
  });

  return (
    <Reveal delay={delay}>
      <section
        id="priority-decisions"
        aria-labelledby="priority-decisions-heading"
        className="ex-snapshot-block"
      >
        <p className="ex-caption mb-2">What requires a decision?</p>
        <h2 id="priority-decisions-heading" className="sr-only">
          Priority decisions
        </h2>

        {items.length === 0 ? (
          <ExperienceEmptyState
            title="No priority decisions right now"
            description="Continue in Decisions when a call is ready."
            action={<SnapshotCta href="/decisions">Open Decision</SnapshotCta>}
          />
        ) : (
          <ul className="space-y-2">
            {items.map(({ decision, related }) => (
              <li key={decision.id}>
                <ExperienceCardShell className="space-y-2 p-4">
                  <p className="ex-heading text-base">{decision.title}</p>
                  <p className="ex-body text-[length:0.85rem] text-[var(--ex-text)]">
                    <span className="ex-caption mr-2">Why now</span>
                    {related?.why ?? decision.decisionTimeLabel}
                  </p>
                  <p className="ex-body text-[length:0.85rem]">
                    <span className="ex-caption mr-2">Business impact</span>
                    {related?.expectedImpact ?? decision.businessImpact}
                  </p>
                  <p className="ex-body text-[length:0.85rem]">
                    <span className="ex-caption mr-2">Cost of delay</span>
                    {related?.potentialRisk ??
                      "Deferred judgement increases overnight risk"}
                  </p>
                  <SnapshotCta href={decision.href}>Open Decision</SnapshotCta>
                </ExperienceCardShell>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Reveal>
  );
}
