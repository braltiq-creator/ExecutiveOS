"use client";

import { useState, useTransition } from "react";
import {
  recordExecutiveReview,
  REVIEW_VERDICT_LABELS,
  type ExecutiveReviewVerdict,
} from "@/trust";
import { ExperienceButton } from "@/experience/design-system/Button";
import { ExperienceBadge } from "@/experience/design-system/Badge";

const VERDICTS = Object.keys(REVIEW_VERDICT_LABELS) as ExecutiveReviewVerdict[];

type ExecutiveReviewControlsProps = {
  tenantId: string;
  explanationId: string;
  recommendationId: string;
};

/** Capture executive feedback for continuous learning. */
export function ExecutiveReviewControls({
  tenantId,
  explanationId,
  recommendationId,
}: ExecutiveReviewControlsProps) {
  const [selected, setSelected] = useState<ExecutiveReviewVerdict | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function submit(verdict: ExecutiveReviewVerdict) {
    setSelected(verdict);
    startTransition(() => {
      recordExecutiveReview({
        tenantId,
        explanationId,
        recommendationId,
        verdict,
        recordedBy: "executive",
      });
      setSaved(true);
    });
  }

  return (
    <div
      className="space-y-2 border-t border-[var(--eos-border)] pt-4"
      onClick={(event) => event.preventDefault()}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
        }
      }}
    >
      <p className="ex-caption">Executive review</p>
      <div className="flex flex-wrap gap-2">
        {VERDICTS.map((verdict) => (
          <ExperienceButton
            key={verdict}
            variant={selected === verdict ? "primary" : "secondary"}
            size="sm"
            disabled={pending}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              submit(verdict);
            }}
          >
            {REVIEW_VERDICT_LABELS[verdict]}
          </ExperienceButton>
        ))}
      </div>
      {saved && selected ? (
        <ExperienceBadge tone="success">
          Recorded: {REVIEW_VERDICT_LABELS[selected]}
        </ExperienceBadge>
      ) : (
        <p className="ex-body text-[length:0.8rem] text-[var(--ex-text-muted)]">
          Your feedback strengthens organisational learning.
        </p>
      )}
    </div>
  );
}
