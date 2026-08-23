"use client";

import { useMemo } from "react";
import { EXECUTIVE_ICONS } from "@/experience/icons";
import { ExsOpenLink, ExsSectionHeader } from "@/experience/exs";
import { useExperienceData } from "@/experience/executive-brief/useExperienceData";
import { useDecisionsOptional } from "@/components/providers/DecisionProvider";
import {
  buildOutcomeImpact,
  resolveFocusOutcome,
  OutcomeImpactPanel,
} from "@/experience/outcomes-engine";
import {
  buildCouncilLearning,
  buildExecutiveCouncilView,
  CouncilLearningPanel,
} from "@/experience/executive-council";
import type { LoopImpactRecord } from "@/experience/executive-loop/types";

type Props = {
  impact: LoopImpactRecord;
};

/** Predicted vs actual — organisational + council learning for a decision. */
export function ImpactHistory({ impact }: Props) {
  const { strategicOutcomes, snapshot, mode } = useExperienceData();
  const decisionsCtx = useDecisionsOptional();
  const healthDiff = impact.actualHealthDelta - impact.predictedHealthDelta;
  const valueDiff = impact.actualValueAud - impact.predictedValueAud;

  const outcomeImpact = useMemo(() => {
    if (!snapshot) return null;
    const outcome = resolveFocusOutcome({
      outcomes: strategicOutcomes,
      snapshot,
    });
    if (!outcome) return null;
    return buildOutcomeImpact({
      outcome,
      loopImpact: impact,
      decisionTitle: impact.decisionTitle,
    });
  }, [strategicOutcomes, snapshot, impact]);

  const council = useMemo(() => {
    if (!snapshot) return null;
    return buildExecutiveCouncilView({
      snapshot,
      strategicOutcomes,
      decisions: decisionsCtx?.decisions ?? [],
      loopImpacts: [impact],
    });
  }, [snapshot, strategicOutcomes, decisionsCtx?.decisions, impact]);

  if (!snapshot || !council) {
    return (
      <section
        aria-label="Impact History"
        className="exs-card mt-6 space-y-3"
        data-impact-history="loading"
      >
        <ExsSectionHeader
          label="Impact History"
          icon={EXECUTIVE_ICONS.executive_value}
          className="mb-0"
        />
        <p className="exs-body text-[length:0.85rem]">
          {mode === "loading"
            ? "Preparing executive context…"
            : "Executive Snapshot unavailable."}
        </p>
      </section>
    );
  }

  const councilLearning =
    buildCouncilLearning(impact, council.consensus) ?? council.learning;

  return (
    <section
      aria-label="Impact History"
      className="exs-card mt-6 space-y-3"
      data-impact-history="true"
    >
      <ExsSectionHeader
        label="Impact History"
        icon={EXECUTIVE_ICONS.executive_value}
        className="mb-0"
      />
      <div className="flex items-start justify-between gap-3">
        <p className="exs-title text-[length:0.95rem]">{impact.decisionTitle}</p>
        <ExsOpenLink href="/knowledge?from=impact" className="shrink-0">
          Why trust this? →
        </ExsOpenLink>
      </div>
      <dl className="grid gap-3 sm:grid-cols-2">
        <Row
          label="Organisation Health"
          predicted={`+${impact.predictedHealthDelta}`}
          actual={`+${impact.actualHealthDelta}`}
          diff={
            healthDiff === 0
              ? "On prediction"
              : healthDiff > 0
                ? `+${healthDiff} vs predicted`
                : `${healthDiff} vs predicted`
          }
        />
        <Row
          label="Executive Value"
          predicted={`£${impact.predictedValueAud.toLocaleString()}`}
          actual={`£${impact.actualValueAud.toLocaleString()}`}
          diff={
            valueDiff === 0
              ? "On prediction"
              : `£${valueDiff.toLocaleString()} vs predicted`
          }
        />
        <Row
          label="Confidence"
          predicted={`${impact.confidenceBefore}%`}
          actual={`${impact.confidenceAfter}%`}
          diff={`+${impact.confidenceAfter - impact.confidenceBefore}`}
        />
        <Row
          label="Commercial"
          predicted={impact.commercialBefore}
          actual={impact.commercialAfter}
          diff="Improved"
        />
      </dl>
      {outcomeImpact ? (
        <OutcomeImpactPanel impact={outcomeImpact} embedded />
      ) : null}
      {councilLearning ? (
        <CouncilLearningPanel learning={councilLearning} embedded />
      ) : null}
      {council.agency.discussionLearning ? (
        <div className="border-t border-[var(--exs-divider)] pt-3">
          <p className="exs-label mb-1">Retained Council discussion</p>
          <ul className="space-y-0.5">
            {council.agency.discussionLearning.initialObservations
              .slice(0, 3)
              .map((line) => (
                <li key={line} className="exs-body text-[length:0.75rem]">
                  · {line}
                </li>
              ))}
          </ul>
          <p className="exs-body mt-2 text-[length:0.75rem]">
            {council.agency.discussionLearning.learning}
          </p>
        </div>
      ) : null}
    </section>
  );
}

function Row({
  label,
  predicted,
  actual,
  diff,
}: {
  label: string;
  predicted: string;
  actual: string;
  diff: string;
}) {
  return (
    <div>
      <dt className="exs-label">{label}</dt>
      <dd className="exs-body mt-1 text-[length:0.8rem]">
        Predicted {predicted}
        <span className="mx-1.5 text-[var(--exs-text-muted)]">→</span>
        Actual {actual}
      </dd>
      <dd className="exs-label mt-0.5 normal-case">{diff}</dd>
    </div>
  );
}
