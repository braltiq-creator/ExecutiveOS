"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { LoopImpactRecord } from "@/experience/executive-loop/types";
import { clearPendingCeremony } from "@/experience/executive-loop/store";
import { EXECUTIVE_ICONS } from "@/experience/icons";

const STEPS = [
  "Decision Approved",
  "Organisation recalculating",
  "Executive Value updating",
  "Organisation Health recalculated",
  "Confidence updated",
] as const;

type Props = {
  impact: LoopImpactRecord;
};

/**
 * After-approval ceremony — then return to Today naturally.
 */
export function LoopCeremony({ impact }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const Icon = EXECUTIVE_ICONS.organisation_health;

  useEffect(() => {
    if (step >= STEPS.length - 1) {
      const id = window.setTimeout(() => {
        clearPendingCeremony();
        router.push("/today?loop=1");
      }, 900);
      return () => window.clearTimeout(id);
    }
    const id = window.setTimeout(() => setStep((s) => s + 1), 700);
    return () => window.clearTimeout(id);
  }, [step, router]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="exs-card mt-6 space-y-4 p-[var(--exs-space-5)]"
      data-loop-ceremony="true"
    >
      <p className="exs-label flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
        Executive Operating Loop
      </p>
      <h3 className="exs-title text-[length:1.2rem]">
        {impact.decisionTitle}
      </h3>
      <p className="exs-body">
        You changed the organisation. Health {impact.healthBefore} →{" "}
        {impact.healthAfter}.
      </p>
      <ol className="space-y-2">
        {STEPS.map((label, index) => (
          <li
            key={label}
            className={
              index <= step
                ? "exs-body text-[var(--exs-text)]"
                : "exs-body text-[var(--exs-text-muted)]"
            }
          >
            <span aria-hidden="true" className="mr-2">
              {index < step ? "✓" : index === step ? "●" : "○"}
            </span>
            {label}
          </li>
        ))}
      </ol>
      <p className="exs-label">Returning to Command Centre…</p>
    </div>
  );
}
