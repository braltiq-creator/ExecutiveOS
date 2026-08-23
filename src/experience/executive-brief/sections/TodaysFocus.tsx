import { Reveal } from "@/experience/motion/Reveal";
import { ExperienceCardShell } from "@/experience/design-system/Card";
import { SnapshotCta } from "@/experience/executive-brief/SnapshotCta";
import {
  focusQuestion,
  focusWorkspaceHref,
  type BriefFocusArea,
} from "@/experience/executive-brief/briefFocus";

type TodaysFocusProps = {
  focus: BriefFocusArea;
  answer: string;
  why: string;
  delay?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
};

/** Single strategic focus — opens the relevant Level Two workspace. */
export function TodaysFocus({
  focus,
  answer,
  why,
  delay = 2,
}: TodaysFocusProps) {
  const href = focusWorkspaceHref(focus);
  const cta =
    focus === "Growth"
      ? "View Value Analysis"
      : focus === "Risk"
        ? "Open Decision"
        : focus === "People"
          ? "Open Workspace"
          : "Open Strategy";

  return (
    <Reveal delay={delay}>
      <section
        id="todays-focus"
        aria-label="Today's focus"
        className="ex-snapshot-block"
        data-brief-focus={focus.toLowerCase()}
      >
        <p className="ex-caption mb-2">Today&apos;s focus</p>
        <ExperienceCardShell className="space-y-2 p-4">
          <p className="ex-caption normal-case tracking-normal text-[var(--ex-text-muted)]">
            {focusQuestion(focus)}
          </p>
          <p className="ex-heading text-base">{focus}</p>
          <p className="ex-body text-[var(--ex-text)]">{answer}</p>
          <p className="ex-body text-[length:0.85rem]">{why}</p>
          <SnapshotCta href={href}>{cta}</SnapshotCta>
        </ExperienceCardShell>
      </section>
    </Reveal>
  );
}
