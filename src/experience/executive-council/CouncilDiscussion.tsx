import { EXECUTIVE_ICONS } from "@/experience/icons";
import { ExsOpenLink, ExsSectionHeader } from "@/experience/exs";
import { Reveal } from "@/experience/motion/Reveal";
import type {
  AgencyConsensus,
  CouncilCollaboration,
  CouncilDiscussionLearning,
  CouncilObservation,
} from "@/experience/executive-council/types";

type DiscussionProps = {
  observations: CouncilObservation[];
  collaborations: CouncilCollaboration[];
  consensus: AgencyConsensus;
  learning?: CouncilDiscussionLearning | null;
};

/**
 * Active Council discussion — observations evolve through peer responses.
 */
export function CouncilDiscussionPanel({
  observations,
  collaborations,
  consensus,
  learning,
}: DiscussionProps) {
  return (
    <Reveal delay={3}>
      <section
        id="council-discussion"
        aria-label="Council Discussion"
        className="scroll-mt-6 space-y-4"
        data-council-discussion="true"
      >
        <ExsSectionHeader
          label="Council Discussion"
          icon={EXECUTIVE_ICONS.people_health}
        />

        <div>
          <p className="exs-label mb-1.5">Initial observations</p>
          {observations.length === 0 ? (
            <article className="exs-card">
              <p className="exs-body text-[length:0.8rem]">
                Council monitoring is quiet — no material observation raised.
              </p>
            </article>
          ) : (
            <ul className="space-y-2">
              {observations.map((obs) => (
                <li key={obs.id}>
                  <article className="exs-card">
                    <header className="flex items-start justify-between gap-2">
                      <p className="exs-label">
                        {obs.raisedBy} · {obs.urgencyLabel}
                      </p>
                      <p className="exs-label tabular-nums normal-case">
                        {obs.confidence}%
                      </p>
                    </header>
                    <p className="exs-title mt-1 text-[length:0.9rem]">
                      {obs.headline}
                    </p>
                    <p className="exs-body mt-1 text-[length:0.75rem]">
                      {obs.reasoning}
                    </p>
                    <p className="exs-body mt-1 text-[length:0.75rem]">
                      <span className="font-medium text-[var(--exs-text)]">
                        Impact.{" "}
                      </span>
                      {obs.businessImpact}
                    </p>
                    <p className="exs-label mt-1 normal-case">
                      Next · {obs.recommendedNextStep}
                    </p>
                  </article>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <p className="exs-label mb-1.5">Peer responses</p>
          <ul className="space-y-1.5">
            {collaborations.map((c) => (
              <li key={c.id}>
                <article className="exs-card py-2">
                  <p className="exs-label">
                    {c.fromShortTitle} → {c.toShortTitle} · {c.stanceLabel}
                  </p>
                  <p className="exs-body mt-1 text-[length:0.78rem]">{c.note}</p>
                </article>
              </li>
            ))}
          </ul>
        </div>

        <article className="exs-card space-y-2 p-[var(--exs-space-5)]">
          <p className="exs-label">Agency consensus</p>
          <p className="exs-title text-[length:0.95rem]">{consensus.consensus}</p>
          <p className="exs-body text-[length:0.8rem]">
            <span className="font-medium text-[var(--exs-text)]">
              Recommended judgement.{" "}
            </span>
            {consensus.recommendedJudgement}
          </p>
          <p className="exs-label normal-case">
            Confidence {consensus.confidence}% · Uncertainty ·{" "}
            {consensus.remainingUncertainty}
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            <List label="Agreement" items={consensus.agreementAreas} />
            <List label="Disagreement" items={consensus.disagreementAreas} />
            <List label="Trade-offs" items={consensus.tradeOffs} />
          </div>
        </article>

        {learning ? <DiscussionLearningInline learning={learning} /> : null}
      </section>
    </Reveal>
  );
}

function DiscussionLearningInline({
  learning,
}: {
  learning: CouncilDiscussionLearning;
}) {
  return (
    <article className="exs-card space-y-1.5">
      <p className="exs-label">Discussion learning</p>
      <p className="exs-body text-[length:0.8rem]">
        <span className="font-medium text-[var(--exs-text)]">Decision. </span>
        {learning.decisionTaken}
      </p>
      <p className="exs-body text-[length:0.8rem]">
        <span className="font-medium text-[var(--exs-text)]">Predicted. </span>
        {learning.predictedOutcome}
        <span className="mx-1.5 text-[var(--exs-text-muted)]">→</span>
        <span className="font-medium text-[var(--exs-text)]">Actual. </span>
        {learning.actualOutcome}
      </p>
      <p className="exs-body text-[length:0.8rem]">
        <span className="font-medium text-[var(--exs-text)]">Learning. </span>
        {learning.learning}
      </p>
      <p className="exs-label normal-case">
        Confidence adjustment {learning.confidenceAdjustment}
      </p>
    </article>
  );
}

function List({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <p className="exs-label mb-1">{label}</p>
      <ul className="space-y-0.5">
        {items.map((item) => (
          <li key={item} className="exs-body text-[length:0.75rem]">
            · {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

type BriefObsProps = {
  observations: CouncilObservation[];
  judgementCount: number;
};

/**
 * Proactive Executive Brief content — highest-priority Council observations.
 */
export function CouncilProactiveObservations({
  observations,
  judgementCount,
}: BriefObsProps) {
  const areas =
    judgementCount === 1 ? "1 Area" : `${Math.max(1, judgementCount)} Areas`;

  return (
    <div data-council-proactive="true">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <ExsSectionHeader
          label="Executive Brief"
          icon={EXECUTIVE_ICONS.pulse}
          className="mb-0"
        />
        <p className="exs-title text-[length:0.85rem]">
          Today&apos;s judgement required in{" "}
          <span className="tabular-nums">{areas}</span>
        </p>
      </div>
      {observations.length === 0 ? (
        <p className="exs-body mt-2 text-[length:0.8rem]">
          Council monitoring is calm — no high-priority observation raised.
        </p>
      ) : (
        <ul className="mt-1.5 space-y-1">
          {observations.map((obs) => (
            <li key={obs.id}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="exs-label">
                    {obs.raisedBy} · {obs.urgencyLabel}
                  </p>
                  <p className="exs-title truncate text-[length:0.85rem]">
                    {obs.headline}
                  </p>
                  <p className="exs-body line-clamp-1 text-[length:0.72rem]">
                    {obs.businessImpact}
                    <span className="mx-1.5 text-[var(--exs-text-muted)]">
                      ·
                    </span>
                    Confidence {obs.confidence}%
                  </p>
                </div>
                <ExsOpenLink
                  href={obs.discussionHref}
                  className="shrink-0"
                >
                  Open Discussion →
                </ExsOpenLink>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
