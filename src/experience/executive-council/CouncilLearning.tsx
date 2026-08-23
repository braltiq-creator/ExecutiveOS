import { EXECUTIVE_ICONS } from "@/experience/icons";
import { ExsSectionHeader } from "@/experience/exs";
import { Reveal } from "@/experience/motion/Reveal";
import type { CouncilLearning } from "@/experience/executive-council/types";

type Props = {
  learning: CouncilLearning;
  embedded?: boolean;
};

/** Auditable council learning from Operating Loop feedback. */
export function CouncilLearningPanel({ learning, embedded = false }: Props) {
  const body = (
    <section
      aria-label="Council Learning"
      className={embedded ? "mt-4 space-y-2" : "scroll-mt-6"}
      data-council-learning="true"
    >
      <ExsSectionHeader
        label="Council Learning"
        icon={EXECUTIVE_ICONS.activity}
        className={embedded ? "mb-0" : undefined}
      />
      <article
        className={
          embedded
            ? "space-y-2 border-t border-[var(--exs-divider)] pt-3"
            : "exs-card space-y-2 p-[var(--exs-space-5)]"
        }
      >
        <Row label="Original recommendation" value={learning.originalRecommendation} />
        <Row label="Decision taken" value={learning.decisionTaken} />
        <Row label="Predicted outcome" value={learning.predictedOutcome} />
        <Row label="Actual outcome" value={learning.actualOutcome} />
        <p className="exs-body text-[length:0.8rem]">
          <span className="font-medium text-[var(--exs-text)]">Learning. </span>
          {learning.learning}
        </p>
        <p className="exs-label normal-case">
          Confidence {learning.confidenceBefore}% → {learning.confidenceAfter}%{" "}
          ({learning.confidenceAdjustment})
        </p>
      </article>
    </section>
  );

  if (embedded) return body;
  return <Reveal delay={5}>{body}</Reveal>;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="exs-label">{label}</p>
      <p className="exs-body mt-0.5 text-[length:0.8rem]">{value}</p>
    </div>
  );
}
