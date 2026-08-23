"use client";

import { Expandable } from "@/experience/motion/Expandable";
import { DecisionPath } from "@/experience/components/DecisionPath";
import { ExecutiveReviewControls } from "@/experience/components/ExecutiveReviewControls";
import type { SnapshotAction } from "@/lib/snapshot/types";

type TrustPanelProps = {
  action: SnapshotAction;
  tenantId: string;
};

/** Trust & explainability disclosure for an executive recommendation card. */
export function TrustPanel({ action, tenantId }: TrustPanelProps) {
  if (!action.explanationId) return null;

  return (
    <div className="mt-4 space-y-3 border-t border-[var(--eos-border)] pt-4">
      {action.whyWeBelieveThis ? (
        <div>
          <p className="ex-caption">Why ExecutiveOS believes this</p>
          <p className="ex-body mt-1 text-[var(--ex-text)]">
            {action.whyWeBelieveThis}
          </p>
        </div>
      ) : null}

      {action.confidenceExplanation ? (
        <div>
          <p className="ex-caption">Confidence explanation</p>
          <p className="ex-body mt-1 text-[var(--ex-text)]">
            {action.confidenceExplanation}
          </p>
          {action.confidenceReasons && action.confidenceReasons.length > 0 ? (
            <ul className="mt-2 space-y-1">
              {action.confidenceReasons.map((reason) => (
                <li
                  key={reason}
                  className="ex-body text-[length:0.85rem] text-[var(--ex-text-secondary)]"
                >
                  {reason}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {action.evidenceSummary && action.evidenceSummary.length > 0 ? (
        <div>
          <p className="ex-caption">Supporting evidence</p>
          <ul className="mt-2 space-y-1">
            {action.evidenceSummary.map((item) => (
              <li key={item} className="ex-body">
                · {item}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {action.memorySummary && action.memorySummary.length > 0 ? (
        <div>
          <p className="ex-caption">Relevant organisational memory</p>
          <ul className="mt-2 space-y-1">
            {action.memorySummary.map((item) => (
              <li key={item} className="ex-body">
                · {item}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {action.decisionPathLabels && action.decisionPathLabels.length > 0 ? (
        <Expandable
          summary={
            <span className="ex-heading text-sm">View decision path</span>
          }
        >
          <DecisionPath steps={action.decisionPathLabels} />
        </Expandable>
      ) : null}

      {action.alternativeSummary ? (
        <Expandable
          summary={
            <span className="ex-heading text-sm">
              Alternative interpretations
            </span>
          }
        >
          <p className="ex-body">{action.alternativeSummary}</p>
        </Expandable>
      ) : null}

      <ExecutiveReviewControls
        tenantId={tenantId}
        explanationId={action.explanationId}
        recommendationId={action.id}
      />
    </div>
  );
}
