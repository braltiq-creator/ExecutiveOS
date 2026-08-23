"use client";

import Link from "next/link";
import { useState } from "react";
import { EXDS_TONE_VAR } from "@/design-system/executive-experience";
import {
  readinessLabel,
  type ExecutiveDecisionPaper as Paper,
} from "@/lib/decisions/decision-readiness";
import {
  commandCentreStatusLabel,
  deriveExecutiveSelectionState,
  type CommandCentreExecutionStatus,
} from "@/lib/decisions/decision-execution-linkage";
import type { Decision } from "@/lib/decisions/engine-types";
import { usePortfolioStore } from "@/store/portfolio-store";

type Props = {
  paper: Paper;
  compact?: boolean;
  /** When set, executive may select an option (Phase 61). */
  interactive?: boolean;
  liveDecision?: Decision | null;
  actor?: string;
};

const DEFAULT_ACTOR = "Executive";

/**
 * Phase 60/61 — Executive decision paper.
 * Frames options; executive selects; then actions may be created.
 */
export function ExecutiveDecisionPaperView({
  paper,
  compact = false,
  interactive = false,
  liveDecision = null,
  actor = DEFAULT_ACTOR,
}: Props) {
  const selectOption = usePortfolioStore((s) => s.selectDecisionOption);
  const createAction = usePortfolioStore((s) => s.createActionFromSelectedDecision);
  const assignAccountability = usePortfolioStore(
    (s) => s.assignActionAccountability,
  );
  const portfolio = usePortfolioStore((s) => s.portfolio);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [ownerDraft, setOwnerDraft] = useState("");
  const [dueDraft, setDueDraft] = useState("");

  const selectionState = liveDecision
    ? deriveExecutiveSelectionState(liveDecision)
    : "OPTION_IDENTIFIED";
  const selectedId = liveDecision?.selectedAlternativeId ?? null;
  const linkedAction =
    paper.decisionId
      ? portfolio.outcomes
          .flatMap((o) => o.pendingActions)
          .find((a) => a.decisionId === paper.decisionId)
      : undefined;
  const hasAction = Boolean(linkedAction);

  const executionStatus: CommandCentreExecutionStatus = hasAction
    ? "execution_underway"
    : selectionState === "OPTION_SELECTED"
      ? "decision_selected"
      : selectionState === "DECISION_APPROVED"
        ? "decision_approved"
        : selectionState === "DECISION_DEFERRED"
          ? "decision_deferred"
          : selectionState === "DECISION_REJECTED"
            ? "decision_rejected"
            : "decision_required";

  const headerLabel = commandCentreStatusLabel(executionStatus);

  function onSelect(alternativeId: string) {
    if (!paper.decisionId || !interactive) return;
    setError(null);
    setBusy(true);
    try {
      selectOption({
        decisionId: paper.decisionId,
        alternativeId,
        actor,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Selection failed");
    } finally {
      setBusy(false);
    }
  }

  function onCreateAction() {
    if (!paper.decisionId || !interactive) return;
    setError(null);
    setBusy(true);
    try {
      createAction({ decisionId: paper.decisionId, actor });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action creation failed");
    } finally {
      setBusy(false);
    }
  }

  function onAssignAccountability() {
    if (!linkedAction || !interactive) return;
    setError(null);
    setBusy(true);
    try {
      assignAccountability({
        actionId: linkedAction.id,
        owner: ownerDraft.trim() || null,
        dueDate: dueDraft.trim() || null,
        actor,
      });
      setOwnerDraft("");
      setDueDraft("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Accountability update failed");
    } finally {
      setBusy(false);
    }
  }

  const canCreateAction =
    interactive &&
    paper.decisionId &&
    (selectionState === "OPTION_SELECTED" ||
      selectionState === "DECISION_DEFERRED" ||
      selectionState === "DECISION_APPROVED") &&
    !hasAction;

  return (
    <article
      className="exds-reveal-up space-y-8 rounded-[calc(var(--exds-card-radius)+4px)] border bg-[var(--exds-card-bg)] px-[var(--eos-space-xl)] py-[var(--eos-space-xl)]"
      style={{ borderColor: "var(--exds-electric-border)" }}
      data-decision-paper="true"
      data-decision-readiness={paper.readiness}
      data-decision-module={paper.module}
      data-selection-state={selectionState}
      data-execution-status={executionStatus}
      aria-label="Executive decision paper"
    >
      <header className="space-y-3">
        <p
          className="exds-editorial-label"
          style={{ color: EXDS_TONE_VAR.decision }}
        >
          {headerLabel}
        </p>
        <p
          className="max-w-3xl font-semibold tracking-[-0.02em] text-[var(--eos-color-text)]"
          style={{ fontSize: "clamp(1.25rem, 2vw, 1.65rem)", lineHeight: 1.2 }}
        >
          {paper.decisionQuestion}
        </p>
        <p className="eos-type-caption text-[var(--eos-color-text-muted)]">
          {readinessLabel(paper.readiness)} · {paper.selectionMessage}
        </p>
        {selectedId && liveDecision?.selectedAlternativeLabel ? (
          <p
            className="text-[length:0.95rem] font-medium"
            style={{ color: EXDS_TONE_VAR.decision }}
            data-selected-option="true"
          >
            You decided: {liveDecision.selectedAlternativeLabel}
          </p>
        ) : null}
      </header>

      <Section title="Why now" body={paper.whyNow} />

      <EvidenceBlock
        title="Evidence"
        items={paper.primaryEvidence}
        empty="Primary supporting evidence not yet established."
      />

      <EvidenceBlock
        title="Counter-signals"
        items={paper.counterSignals}
        empty="No material counter-signals established."
        accent={EXDS_TONE_VAR.watching}
      />

      {!compact ? (
        <EvidenceBlock
          title="Operational implications"
          items={paper.operationalImplications}
          empty="Operational implications not yet established."
          accent={EXDS_TONE_VAR.attention}
        />
      ) : null}

      <section aria-label="Options">
        <p className="exds-editorial-label">Options</p>
        <p className="eos-type-caption mt-1 text-[var(--eos-color-text-muted)]">
          Options — not recommendations. ExecutiveOS does not select for you.
        </p>
        <ul className="mt-4 space-y-4">
          {paper.options.map((opt, i) => {
            const isSelected = selectedId === opt.id;
            return (
              <li
                key={opt.id}
                className="border-l-2 pl-4"
                style={{
                  borderColor: isSelected
                    ? "var(--exds-judgement-accent, var(--exds-electric))"
                    : "var(--exds-electric)",
                }}
                data-decision-option={opt.id}
                data-is-recommendation="false"
                data-option-selected={isSelected ? "true" : "false"}
              >
                <p className="text-[length:0.95rem] font-semibold text-[var(--eos-color-text)]">
                  {String.fromCharCode(65 + i)}. {opt.label}
                </p>
                <p className="eos-type-caption mt-1 text-[var(--eos-color-text-secondary)]">
                  {opt.summary}
                </p>
                <ul className="mt-2 space-y-1">
                  {opt.tradeOffs.map((t, ti) => (
                    <li
                      key={`${opt.id}-${ti}`}
                      className="eos-type-caption"
                      style={{
                        color:
                          t.polarity === "upside"
                            ? EXDS_TONE_VAR.improving
                            : EXDS_TONE_VAR.attention,
                      }}
                    >
                      {t.polarity === "upside" ? "+" : "−"} {t.text}
                    </li>
                  ))}
                </ul>
                {interactive && paper.decisionId && !selectedId ? (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => onSelect(opt.id)}
                    className="exds-focus-ring mt-3 inline-flex rounded-[var(--eos-radius-sm)] border px-3 py-2 text-[length:0.7rem] font-semibold tracking-[0.08em] uppercase"
                    style={{
                      borderColor: "var(--exds-judgement-accent, #e85d04)",
                      color: "var(--exds-judgement-accent, #e85d04)",
                    }}
                    data-executive-select="true"
                  >
                    Select this option
                  </button>
                ) : null}
                {isSelected ? (
                  <p
                    className="eos-type-caption mt-2 font-semibold"
                    style={{ color: EXDS_TONE_VAR.decision }}
                  >
                    Selected by executive
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-label="Missing evidence">
        <p className="exds-editorial-label">Missing evidence</p>
        <ul className="mt-3 space-y-2">
          {paper.missingEvidence.map((m) => (
            <li key={m.id}>
              <p className="text-[length:0.9rem] font-medium text-[var(--eos-color-text)]">
                {m.label}
              </p>
              <p className="eos-type-caption text-[var(--eos-color-text-muted)]">
                {m.presence.replaceAll("_", " ").toLowerCase()} ·{" "}
                {m.whyItWouldHelp}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <Section
        title="Executive judgement"
        body={paper.executiveJudgementRequired}
        accent={EXDS_TONE_VAR.decision}
      />

      {interactive ? (
        <section
          className="rounded-[var(--eos-radius-sm)] border px-4 py-4"
          style={{
            borderColor:
              "color-mix(in srgb, var(--exds-judgement-accent, #e85d04) 55%, transparent)",
            background:
              "color-mix(in srgb, var(--exds-judgement-accent, #e85d04) 10%, transparent)",
          }}
          aria-label="Executive decision"
          data-executive-decision="true"
        >
          <p
            className="exds-editorial-label"
            style={{ color: EXDS_TONE_VAR.decision }}
          >
            Executive decision
          </p>
          <p className="mt-2 text-[length:0.95rem] text-[var(--eos-color-text)]">
            {selectedId
              ? "Your selection is recorded. Creating an action is a separate executive step."
              : "Select an option above. Viewing this page does not record a decision."}
          </p>
          {canCreateAction ? (
            <button
              type="button"
              disabled={busy}
              onClick={onCreateAction}
              className="exds-focus-ring mt-4 inline-flex rounded-[var(--eos-radius-sm)] border px-4 py-2.5 text-[length:0.75rem] font-semibold tracking-[0.08em] uppercase"
              style={{
                borderColor: "var(--exds-electric)",
                color: "var(--exds-electric)",
              }}
              data-create-action="true"
            >
              Create follow-through action
            </button>
          ) : null}
          {hasAction && linkedAction ? (
            <div className="mt-4 space-y-3" data-action-accountability="true">
              <p className="eos-type-caption text-[var(--eos-color-text-muted)]">
                Execution underway · Owner:{" "}
                {linkedAction.recommendation.owner} · Due:{" "}
                {linkedAction.recommendation.deadline}
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="exds-editorial-label">Owner</span>
                  <input
                    type="text"
                    value={ownerDraft}
                    onChange={(e) => setOwnerDraft(e.target.value)}
                    placeholder="Assign"
                    className="mt-1 w-full rounded-[var(--eos-radius-sm)] border bg-transparent px-2 py-1.5 eos-type-supporting"
                    style={{ borderColor: "var(--exds-card-border)" }}
                    data-assign-owner="true"
                  />
                </label>
                <label className="block">
                  <span className="exds-editorial-label">Due</span>
                  <input
                    type="date"
                    value={dueDraft}
                    onChange={(e) => setDueDraft(e.target.value)}
                    className="mt-1 w-full rounded-[var(--eos-radius-sm)] border bg-transparent px-2 py-1.5 eos-type-supporting"
                    style={{ borderColor: "var(--exds-card-border)" }}
                    data-assign-due="true"
                  />
                </label>
              </div>
              <button
                type="button"
                disabled={busy || (!ownerDraft.trim() && !dueDraft.trim())}
                onClick={onAssignAccountability}
                className="exds-focus-ring inline-flex rounded-[var(--eos-radius-sm)] border px-3 py-2 text-[length:0.7rem] font-semibold tracking-[0.08em] uppercase"
                style={{
                  borderColor: "var(--exds-electric)",
                  color: "var(--exds-electric)",
                }}
                data-save-accountability="true"
              >
                Save accountability
              </button>
              <p className="eos-type-caption text-[var(--eos-color-text-muted)]">
                Leave blank to keep “not yet assigned”. ExecutiveOS does not invent
                owners or dates.
              </p>
            </div>
          ) : null}
          {error ? (
            <p className="eos-type-caption mt-2" style={{ color: EXDS_TONE_VAR.attention }}>
              {error}
            </p>
          ) : null}
        </section>
      ) : null}

      <section
        className="grid gap-4 border-t pt-6 sm:grid-cols-2"
        style={{ borderColor: "rgba(47,122,229,0.18)" }}
        aria-label="Confidence separation"
      >
        <ConfidenceLine
          label="Dataset confidence"
          value={paper.confidence.datasetLabel}
        />
        <ConfidenceLine
          label="Judgement confidence"
          value={paper.confidence.judgementLabel}
        />
        <ConfidenceLine
          label="Decision readiness"
          value={readinessLabel(paper.confidence.decisionReadiness)}
        />
        <ConfidenceLine
          label="Decision confidence"
          value={paper.confidence.decisionConfidenceLabel}
        />
        <ConfidenceLine label="Cost of delay" value={paper.costOfDelay} />
        <ConfidenceLine
          label="Executive value"
          value={paper.executiveValueStatus}
        />
        <ConfidenceLine label="Council" value={paper.councilStatus} />
        <ConfidenceLine
          label="Action confidence"
          value={
            hasAction
              ? "Action confidence not yet established."
              : "Not applicable until an action exists"
          }
        />
      </section>

      {!compact ? (
        <div className="pt-2">
          <Link
            href="/today"
            className="exds-focus-ring eos-type-caption font-semibold"
            style={{ color: "var(--exds-electric)" }}
          >
            ← Return to Command Centre
          </Link>
        </div>
      ) : null}
    </article>
  );
}

function Section({
  title,
  body,
  accent,
}: {
  title: string;
  body: string;
  accent?: string;
}) {
  return (
    <section>
      <p
        className="exds-editorial-label"
        style={accent ? { color: accent } : undefined}
      >
        {title}
      </p>
      <p className="mt-2 max-w-3xl text-[length:0.95rem] leading-snug text-[var(--eos-color-text-secondary)]">
        {body}
      </p>
    </section>
  );
}

function ConfidenceLine({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="exds-editorial-label text-[var(--eos-color-text-muted)]">
        {label}
      </p>
      <p className="mt-1 text-[length:0.9rem] font-medium text-[var(--eos-color-text)]">
        {value}
      </p>
    </div>
  );
}

function EvidenceBlock({
  title,
  items,
  empty,
  accent,
}: {
  title: string;
  items: Paper["primaryEvidence"];
  empty: string;
  accent?: string;
}) {
  return (
    <section>
      <p
        className="exds-editorial-label"
        style={accent ? { color: accent } : undefined}
      >
        {title}
      </p>
      {items.length === 0 ? (
        <p className="eos-type-caption mt-2 text-[var(--eos-color-text-muted)]">
          {empty}
        </p>
      ) : (
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <li key={item.id} data-evidence-role={item.role}>
              <p
                className="tabular-nums text-[length:1.25rem] font-semibold"
                style={{ color: accent ?? EXDS_TONE_VAR.intelligence }}
              >
                {item.value}
              </p>
              <p className="eos-type-caption mt-1 text-[var(--eos-color-text)]">
                {item.label}
              </p>
              {item.detail ? (
                <p className="eos-type-caption text-[var(--eos-color-text-muted)]">
                  {item.detail}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
