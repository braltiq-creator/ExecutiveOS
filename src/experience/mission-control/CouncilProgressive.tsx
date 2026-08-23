"use client";

import { useState } from "react";
import { CouncilExperience } from "@/design-system/executive-experience";
import type { ExdsCouncilSeat } from "@/design-system/executive-experience/types";
import { cn } from "@/lib/utils/cn";

type Props = {
  seats: ExdsCouncilSeat[];
  framing?: string;
  className?: string;
};

function isCouncilEstablished(framing: string | undefined, seats: ExdsCouncilSeat[]) {
  if (framing && !/not yet established/i.test(framing)) return true;
  return seats.some(
    (s) =>
      s.position &&
      !/not yet established/i.test(s.position) &&
      (s.agreement ?? 0) > 0,
  );
}

/**
 * Phase 66/67 — Council space proportional to available intelligence.
 */
export function CouncilProgressive({ seats, framing, className }: Props) {
  const established = isCouncilEstablished(framing, seats);
  const [expanded, setExpanded] = useState(established);

  if (!established && !expanded) {
    return (
      <section
        aria-label="Executive Council"
        data-cc-council="true"
        data-council-progressive="collapsed"
        data-exds-council="dark"
        className={cn(
          "border-l-2 py-2 pl-4",
          className,
        )}
        style={{ borderColor: "var(--exds-electric-border)" }}
      >
        <p
          className="exds-editorial-label"
          style={{ color: "var(--exds-decision)" }}
        >
          Executive Council
        </p>
        <p className="mt-1 text-[length:0.95rem] font-semibold tracking-tight text-[var(--eos-color-text)]">
          Council position not yet established.
        </p>
        <p className="eos-type-caption mt-1 text-[var(--eos-color-text-muted)]">
          No seat-level judgement has been established for this snapshot.
        </p>
        <button
          type="button"
          className="exds-focus-ring mt-2 eos-type-caption font-semibold uppercase tracking-[0.08em]"
          style={{ color: "var(--exds-intelligence)" }}
          onClick={() => setExpanded(true)}
        >
          Open Council →
        </button>
      </section>
    );
  }

  return (
    <div
      data-cc-council="true"
      data-council-progressive="expanded"
      className={className}
    >
      <CouncilExperience seats={seats} framing={framing} variant="dark" />
    </div>
  );
}
