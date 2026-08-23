"use client";

import { useMemo, useState, useTransition } from "react";
import {
  buildValidationSuite,
  submitExecutiveFeedback,
  type FeedbackKind,
} from "@/validation";

const FEEDBACK_OPTIONS: Array<{ kind: FeedbackKind; label: string }> = [
  { kind: "useful", label: "Useful" },
  { kind: "not_useful", label: "Not useful" },
  { kind: "incorrect", label: "Incorrect" },
  { kind: "missing_context", label: "Missing context" },
  { kind: "already_knew", label: "Already knew this" },
  { kind: "needs_investigation", label: "Needs investigation" },
];

type ValidationTrustStripProps = {
  tenantId?: string;
};

/**
 * Customer-facing trust strip — what ExecutiveOS knows and confidence.
 */
export function ValidationTrustStrip({
  tenantId = "tenant-northline",
}: ValidationTrustStripProps) {
  const [note, setNote] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const snapshot = useMemo(
    () =>
      buildValidationSuite({
        tenantId,
        asOf: new Date().toISOString(),
      }),
    [tenantId],
  );

  return (
    <section
      aria-label="Executive understanding"
      className="mb-6 rounded-xl border border-[var(--eos-border)] bg-[var(--eos-surface-solid)] px-5 py-4 shadow-[var(--eos-shadow-1)]"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--eos-accent)]">
            Understanding
          </p>
          <p className="mt-1 text-sm leading-6 text-[var(--eos-text-secondary)]">
            ExecutiveOS understands your organisation at{" "}
            <span className="font-semibold text-[var(--eos-text)]">
              {snapshot.executiveIntelligenceScore.score}%
            </span>
            . {snapshot.executiveIntelligenceScore.explanation}
          </p>
        </div>
        <p className="text-xs text-[var(--eos-text-muted)]">
          Coverage {snapshot.organisationCoverage.score}% · Learning{" "}
          {snapshot.learningTrend}
        </p>
      </div>

      {snapshot.outstandingValidationRequests.length > 0 ? (
        <div className="mt-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--eos-text-muted)]">
            Still needs validation
          </p>
          <ul className="mt-1 space-y-1">
            {snapshot.outstandingValidationRequests.slice(0, 3).map((req) => (
              <li
                key={req.id}
                className="text-xs leading-5 text-[var(--eos-text-secondary)]"
              >
                {req.label}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {FEEDBACK_OPTIONS.map((option) => (
          <button
            key={option.kind}
            type="button"
            disabled={pending}
            className="rounded-md border border-[var(--eos-border)] px-2.5 py-1 text-xs text-[var(--eos-text-secondary)] disabled:opacity-50"
            onClick={() => {
              startTransition(() => {
                submitExecutiveFeedback({
                  tenantId,
                  kind: option.kind,
                  subject: "Today briefing",
                });
                setNote(`Thanks — recorded “${option.label}”.`);
              });
            }}
          >
            {option.label}
          </button>
        ))}
      </div>
      {note ? (
        <p className="mt-2 text-xs text-[var(--eos-text-muted)]">{note}</p>
      ) : null}
    </section>
  );
}
