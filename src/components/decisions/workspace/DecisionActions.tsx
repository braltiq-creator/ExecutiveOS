"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DecisionChapter } from "@/components/decisions/workspace/DecisionChapter";
import {
  DECISION_ACT_DESCRIPTIONS,
  DECISION_ACT_LABELS,
  type DecisionAct,
} from "@/lib/decisions/workspace";
import type { DecisionConsequence } from "@/lib/decisions/apply-decision-act";
import {
  ExecutiveBadge,
  ExecutiveButton,
  ExecutiveHeading,
  ExecutiveSummary,
  ds,
} from "@/design-system";
import { cn } from "@/lib/utils/cn";
import { usePortfolioStore } from "@/store/portfolio-store";
import {
  getImpactForDecision,
  ImpactHistory,
  LoopCeremony,
  recordLoopApproval,
  useExecutiveLoop,
} from "@/experience/executive-loop";

const PRIMARY_ACTS: DecisionAct[] = ["approve", "reject"];
const SECONDARY_ACTS: DecisionAct[] = [
  "delegate",
  "escalate",
  "defer",
  "more_information",
];

const ACTOR = "Alex Rivera, CEO";

type DecisionActionsProps = {
  decisionId: string;
  decisionTitle: string;
};

export function DecisionActions({
  decisionId,
  decisionTitle,
}: DecisionActionsProps) {
  const router = useRouter();
  const recordDecisionAct = usePortfolioStore(
    (state) => state.recordDecisionAct,
  );
  const loop = useExecutiveLoop();
  const [pending, setPending] = useState<DecisionAct | null>(null);
  const [consequence, setConsequence] = useState<DecisionConsequence | null>(
    null,
  );
  const [persistError, setPersistError] = useState<string | null>(null);
  const [signing, setSigning] = useState(false);
  const impact = getImpactForDecision(decisionId);

  function requestAct(act: DecisionAct) {
    setConsequence(null);
    setPersistError(null);
    setPending(act);
  }

  function cancel() {
    setPending(null);
    setSigning(false);
  }

  function confirm() {
    if (!pending) return;
    setSigning(true);
    setPersistError(null);
    const act = pending;
    window.setTimeout(() => {
      void (async () => {
        try {
          const result = await recordDecisionAct({
            decisionId,
            act,
            actor: ACTOR,
          });
          if (act === "approve") {
            recordLoopApproval({
              decisionId,
              decisionTitle,
              actor: ACTOR,
            });
          }
          setConsequence(result);
          setPending(null);
        } catch (error) {
          setConsequence(null);
          setPending(null);
          setPersistError(
            error instanceof Error
              ? error.message
              : "Unable to persist to Production. Your change was not saved.",
          );
        } finally {
          setSigning(false);
        }
      })();
    }, 650);
  }

  if (loop.pendingCeremony?.decisionId === decisionId) {
    return (
      <DecisionChapter
        id="decision-actions"
        overline="Decision"
        title="Bind judgement"
      >
        <LoopCeremony impact={loop.pendingCeremony} />
      </DecisionChapter>
    );
  }

  return (
    <DecisionChapter
      id="decision-actions"
      overline="Decision"
      title="Bind judgement"
    >
      <ExecutiveSummary className="max-w-2xl">
        These acts create organisational memory. Choose deliberately. Soft taps
        are for drafts — this is the record.
      </ExecutiveSummary>

      {persistError ? (
        <p
          role="alert"
          className="mt-[var(--eos-space-lg)] text-[length:0.95rem]"
          style={{ color: "var(--exds-attention)" }}
        >
          {persistError}
        </p>
      ) : null}

      {consequence ? (
        <div
          role="status"
          className={cn(
            "eos-decision-signed mt-[var(--eos-space-2xl)] max-w-2xl",
            "border-y border-[var(--eos-color-divider)] py-[var(--eos-space-2xl)]",
          )}
        >
          <ExecutiveBadge>Recorded</ExecutiveBadge>
          <ExecutiveHeading
            as="h3"
            size="l"
            className="mt-[var(--eos-space-lg)]"
          >
            {consequence.statusLabel}
          </ExecutiveHeading>
          <ExecutiveSummary className="mt-[var(--eos-space-md)]">
            {consequence.briefingImplication}
          </ExecutiveSummary>

          <dl className={cn(ds.spaceY.lg, "mt-[var(--eos-space-xl)]")}>
            <div>
              <dt className={ds.type.label}>Owner</dt>
              <dd
                className={cn(
                  ds.type.body,
                  "mt-[var(--eos-space-xs)] text-[var(--eos-color-text)]",
                )}
              >
                {consequence.actor}
              </dd>
            </div>
            <div>
              <dt className={ds.type.label}>Timestamp</dt>
              <dd
                className={cn(
                  ds.type.caption,
                  "mt-[var(--eos-space-xs)] font-mono",
                )}
              >
                {new Intl.DateTimeFormat(undefined, {
                  dateStyle: "full",
                  timeStyle: "short",
                }).format(new Date(consequence.recordedAt))}
              </dd>
            </div>
            {consequence.reviewDeadline ? (
              <div>
                <dt className={ds.type.label}>Review by</dt>
                <dd
                  className={cn(
                    ds.type.body,
                    "mt-[var(--eos-space-xs)] text-[var(--eos-color-text)]",
                  )}
                >
                  {consequence.reviewDeadline}
                </dd>
              </div>
            ) : null}
            {consequence.outcomeUpdates.length > 0 ? (
              <div>
                <dt className={ds.type.label}>Outcome movement</dt>
                <dd className={cn(ds.spaceY.sm, "mt-[var(--eos-space-sm)]")}>
                  {consequence.outcomeUpdates.map((update) => (
                    <p key={update.id} className={ds.type.supporting}>
                      <span className="text-[var(--eos-color-text)]">
                        {update.name}
                      </span>
                      {" — "}
                      {update.summary}
                    </p>
                  ))}
                </dd>
              </div>
            ) : null}
            {consequence.actionCreated ? (
              <div>
                <dt className={ds.type.label}>Action created</dt>
                <dd
                  className={cn(
                    ds.type.body,
                    "mt-[var(--eos-space-xs)] text-[var(--eos-color-text)]",
                  )}
                >
                  {consequence.actionCreated.label}
                </dd>
              </div>
            ) : null}
          </dl>

          <div
            className={cn(
              "mt-[var(--eos-space-2xl)] flex flex-wrap items-center",
              "gap-[var(--eos-space-lg)]",
            )}
          >
            <ExecutiveButton
              type="button"
              variant="primary"
              size="lg"
              onClick={() => router.push("/today?loop=1")}
            >
              Return to Today
            </ExecutiveButton>
            <Link
              href="/actions"
              className={cn(
                ds.type.body,
                "font-medium underline-offset-4 hover:text-[var(--eos-color-text)] hover:underline",
              )}
            >
              View Actions
            </Link>
          </div>
          {impact ? <ImpactHistory impact={impact} /> : null}
        </div>
      ) : pending ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="decision-sign-title"
          className={cn(
            "eos-decision-sign mt-[var(--eos-space-2xl)] max-w-2xl",
            "border-y border-[var(--eos-color-divider)] py-[var(--eos-space-2xl)]",
          )}
        >
          <ExecutiveBadge>Confirm</ExecutiveBadge>
          <ExecutiveHeading
            id="decision-sign-title"
            as="h3"
            size="l"
            className="mt-[var(--eos-space-lg)]"
          >
            {DECISION_ACT_LABELS[pending]}
          </ExecutiveHeading>
          <ExecutiveSummary className="mt-[var(--eos-space-lg)]">
            {DECISION_ACT_DESCRIPTIONS[pending]}
          </ExecutiveSummary>
          <p
            className={cn(
              ds.type.supporting,
              "mt-[var(--eos-space-lg)] text-[var(--eos-color-text)]",
            )}
          >
            Decision: {decisionTitle}
          </p>
          <div
            className={cn(
              "mt-[var(--eos-space-2xl)] flex flex-wrap",
              "gap-[var(--eos-space-md)]",
            )}
          >
            <ExecutiveButton
              type="button"
              variant={pending === "reject" ? "danger" : "primary"}
              size="lg"
              disabled={signing}
              onClick={confirm}
              className={cn(
                "min-w-[10rem] tracking-wide",
                pending === "approve" && "eos-sign-approve",
              )}
            >
              {signing ? "Recording…" : `Confirm ${DECISION_ACT_LABELS[pending]}`}
            </ExecutiveButton>
            <ExecutiveButton
              type="button"
              variant="ghost"
              size="lg"
              disabled={signing}
              onClick={cancel}
            >
              Cancel
            </ExecutiveButton>
          </div>
        </div>
      ) : (
        <div className={cn("mt-[var(--eos-space-2xl)]", ds.spaceY.xl)}>
          <div className="flex flex-wrap gap-[var(--eos-space-md)]">
            {PRIMARY_ACTS.map((act) => (
              <ExecutiveButton
                key={act}
                type="button"
                variant={act === "reject" ? "danger" : "primary"}
                size="lg"
                onClick={() => requestAct(act)}
                className="min-w-[8.5rem]"
              >
                {DECISION_ACT_LABELS[act]}
              </ExecutiveButton>
            ))}
          </div>
          <div>
            <ExecutiveBadge>Other acts</ExecutiveBadge>
            <ul
              className={cn(
                "mt-[var(--eos-space-lg)] flex flex-col",
                "gap-[var(--eos-space-md)] sm:flex-row sm:flex-wrap",
              )}
            >
              {SECONDARY_ACTS.map((act) => (
                <li key={act}>
                  <button
                    type="button"
                    onClick={() => requestAct(act)}
                    className={cn(
                      ds.type.body,
                      "text-left font-medium underline-offset-4",
                      "hover:text-[var(--eos-color-text)] hover:underline",
                      ds.focusRing,
                    )}
                  >
                    {DECISION_ACT_LABELS[act]}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          {impact ? <ImpactHistory impact={impact} /> : null}
        </div>
      )}
    </DecisionChapter>
  );
}
