import { ExperienceCardShell } from "@/experience/design-system/Card";
import { ExperienceEmptyState } from "@/experience/design-system/EmptyState";
import { Reveal } from "@/experience/motion/Reveal";
import { SnapshotCta } from "@/experience/executive-brief/SnapshotCta";
import type { SinceYesterdayUpdate } from "@/lib/snapshot/types";

type Props = {
  updates: SinceYesterdayUpdate[];
  delay?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
};

/** Max three — evidence lives in Knowledge. */
export function CriticalInsightsSection({ updates, delay = 6 }: Props) {
  const insights = updates.slice(0, 3);

  return (
    <Reveal delay={delay}>
      <section
        id="critical-insights"
        aria-labelledby="critical-insights-heading"
        className="ex-snapshot-block scroll-mt-6"
      >
        <p className="ex-caption mb-2">What changed?</p>
        <h2 id="critical-insights-heading" className="sr-only">
          Critical insights
        </h2>

        {insights.length === 0 ? (
          <ExperienceEmptyState
            title="A quiet night"
            description="No material overnight changes require attention."
            action={<SnapshotCta href="/knowledge">Open Insight</SnapshotCta>}
          />
        ) : (
          <ul className="space-y-2">
            {insights.map((update) => (
              <li key={update.id}>
                <ExperienceCardShell className="space-y-2 p-4">
                  <p className="ex-heading text-base leading-snug">
                    {update.sentence}
                  </p>
                  <p className="ex-body text-[length:0.85rem]">
                    <span className="ex-caption mr-2">Why it matters</span>
                    Material to today&apos;s lead judgement and next six hours.
                  </p>
                  <SnapshotCta href={update.href || "/knowledge"}>
                    Open Insight
                  </SnapshotCta>
                </ExperienceCardShell>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Reveal>
  );
}
