"use client";

import { useState } from "react";
import {
  recordDesignPartnerFeedback,
  recordWouldStartHere,
  type DesignPartnerFeedbackKind,
} from "@/design-partner";
import { cn } from "@/lib/utils/cn";

type Props = {
  organisationId: string;
  snapshotId?: string | null;
  decisionId?: string | null;
  screen?: string;
  className?: string;
};

const OPTIONS: Array<{ kind: DesignPartnerFeedbackKind; label: string }> = [
  { kind: "useful", label: "Useful" },
  { kind: "not_useful", label: "Not useful" },
  { kind: "missing", label: "Missing" },
  { kind: "incorrect", label: "Incorrect" },
  { kind: "would_start_here", label: "Would start here" },
  { kind: "would_not_start_here", label: "Would not start here" },
];

/**
 * Lightweight pilot feedback — not a survey platform.
 */
export function DesignPartnerFeedbackCapture({
  organisationId,
  snapshotId,
  decisionId,
  screen = "command_centre",
  className,
}: Props) {
  const [comment, setComment] = useState("");
  const [saved, setSaved] = useState<string | null>(null);

  function submit(kind: DesignPartnerFeedbackKind) {
    recordDesignPartnerFeedback({
      organisationId,
      kind,
      comment: comment || null,
      snapshotId,
      decisionId,
      screen,
    });
    if (kind === "would_start_here" || kind === "would_not_start_here") {
      recordWouldStartHere({
        organisationId,
        would: kind === "would_start_here",
        snapshotId,
        screen,
      });
    }
    setSaved(kind);
    setComment("");
  }

  return (
    <section
      aria-label="Pilot feedback"
      data-design-partner-feedback="true"
      className={cn(
        "rounded-[var(--exds-card-radius)] border p-[var(--eos-space-md)]",
        className,
      )}
      style={{
        borderColor: "var(--exds-card-border)",
        background: "var(--exds-card-bg)",
      }}
    >
      <p className="exds-editorial-label">Pilot feedback</p>
      <p className="eos-type-caption mt-1">
        Would you start your day here before email or Teams?
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {OPTIONS.map((opt) => (
          <button
            key={opt.kind}
            type="button"
            className="eos-type-caption rounded-[var(--eos-radius-sm)] border px-2.5 py-1.5"
            style={{
              borderColor: "var(--exds-electric-border)",
              color: "var(--eos-color-text)",
            }}
            onClick={() => submit(opt.kind)}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <label className="mt-3 block">
        <span className="sr-only">Optional comment</span>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={2}
          placeholder="Optional comment"
          className="mt-2 w-full rounded-[var(--eos-radius-sm)] border bg-transparent px-2 py-1.5 eos-type-supporting"
          style={{ borderColor: "var(--exds-card-border)" }}
        />
      </label>
      {saved ? (
        <p className="eos-type-caption mt-2" style={{ color: "var(--exds-intelligence)" }}>
          Recorded: {saved.replaceAll("_", " ")}
        </p>
      ) : null}
    </section>
  );
}
