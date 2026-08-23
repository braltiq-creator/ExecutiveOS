"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { clampConfidence, EXDS_TONE_VAR } from "../colour";
import type { ExdsSemanticTone } from "../types";

export type ExecutiveJudgementEvidence = {
  id: string;
  text: string;
};

export type ExecutiveJudgementStripItem = {
  id: string;
  label: string;
  value: string;
  tone?: ExdsSemanticTone;
  caption?: string;
  detail?: string;
  role?: string;
};

type ExecutiveJudgementPanelProps = {
  label?: string;
  /** Large scannable statement — preferred over judgement when set. */
  headline?: string;
  judgement: string;
  /** One supporting sentence under the headline. */
  support?: string;
  evidence?: ExecutiveJudgementEvidence[];
  evidenceStrip?: ExecutiveJudgementStripItem[];
  requiresJudgement: string;
  confidence?: number;
  /** Prefer "Judgement confidence" over a generic label when set. */
  confidenceLabel?: string;
  potentialImpact?: string;
  actionHref?: string;
  actionLabel?: string;
  className?: string;
  children?: ReactNode;
};

/**
 * Dark high-value judgement panel — visual, 5-second read.
 * Selective dark surface on the light executive canvas.
 */
export function ExecutiveJudgementPanel({
  label = "Executive judgement",
  headline,
  judgement,
  support,
  evidence = [],
  evidenceStrip = [],
  requiresJudgement,
  confidence,
  confidenceLabel = "Confidence",
  actionHref = "/today",
  actionLabel = "Open judgement →",
  className,
  children,
}: ExecutiveJudgementPanelProps) {
  const conf =
    confidence === undefined ? undefined : clampConfidence(confidence);
  const primary = headline?.trim() || judgement;
  const secondary = support?.trim();
  const strip =
    evidenceStrip.length > 0
      ? evidenceStrip
      : evidence.slice(0, 3).map((e) => ({
          id: e.id,
          label: "Evidence",
          value: e.text.slice(0, 28),
          tone: "intelligence" as ExdsSemanticTone,
          role: undefined as string | undefined,
          caption: undefined as string | undefined,
          detail: undefined as string | undefined,
        }));

  return (
    <section
      aria-label="Executive judgement panel"
      data-exds-judgement-panel="true"
      className={cn(
        "exds-reveal-up overflow-hidden rounded-[calc(var(--exds-card-radius)+4px)]",
        "border bg-[var(--exds-judgement-bg)]",
        "px-[var(--eos-space-xl)] py-[var(--eos-space-xl)] text-[var(--exds-judgement-fg)]",
        className,
      )}
      style={{
        borderColor: "var(--exds-electric-border)",
        boxShadow: "var(--exds-electric-glow)",
      }}
    >
      <p
        className="exds-editorial-label"
        style={{ color: "var(--exds-judgement-accent)" }}
      >
        {label}
      </p>

      <p
        className="mt-4 max-w-4xl font-semibold tracking-[-0.02em]"
        style={{
          fontSize: "clamp(1.35rem, 2.2vw, 1.85rem)",
          lineHeight: 1.15,
          color: "var(--exds-judgement-fg)",
        }}
      >
        {primary}
      </p>

      {secondary ? (
        <p
          className="mt-3 max-w-3xl text-[length:0.95rem] leading-snug"
          style={{ color: "var(--exds-judgement-muted)" }}
        >
          {secondary}
        </p>
      ) : null}

      {strip.length > 0 ? (
        <ul
          className="mt-7 grid gap-4 border-y py-5 sm:grid-cols-2 lg:grid-cols-4"
          style={{ borderColor: "var(--exds-electric-border)" }}
          aria-label="Evidence strip"
          data-evidence-hierarchy="true"
        >
          {strip.slice(0, 4).map((item, index) => (
            <li
              key={item.id}
              className="min-w-0"
              data-evidence-role={"role" in item ? item.role : undefined}
            >
              <p
                className="exds-editorial-label tabular-nums"
                style={{ color: "var(--exds-judgement-muted)" }}
              >
                {String(index + 1).padStart(2, "0")}
              </p>
              <p
                className="mt-1 tabular-nums text-[length:1.45rem] font-semibold tracking-tight"
                style={{ color: EXDS_TONE_VAR[item.tone ?? "intelligence"] }}
              >
                {item.value}
              </p>
              <p
                className="eos-type-caption mt-1"
                style={{ color: "var(--exds-judgement-fg)" }}
              >
                {item.label}
              </p>
              {("caption" in item ? item.caption : undefined) ? (
                <p
                  className="eos-type-caption mt-1"
                  style={{ color: "var(--exds-judgement-accent)" }}
                >
                  {item.caption}
                </p>
              ) : null}
              {("detail" in item ? item.detail : undefined) ? (
                <p
                  className="eos-type-caption mt-0.5"
                  style={{ color: "var(--exds-judgement-muted)" }}
                >
                  {item.detail}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
        {conf !== undefined ? (
          <div>
            <p
              className="exds-editorial-label"
              style={{ color: "var(--exds-judgement-muted)" }}
            >
              {confidenceLabel}
            </p>
            <p
              className="mt-1 tabular-nums text-[length:1.65rem] font-semibold tracking-tight"
              style={{ color: "var(--exds-judgement-accent)" }}
            >
              {conf}
              <span className="ml-0.5 text-[length:0.85rem] font-medium opacity-70">
                %
              </span>
            </p>
          </div>
        ) : (
          <span />
        )}
        <Link
          href={actionHref}
          className="exds-focus-ring exds-interactive inline-flex items-center rounded-[var(--eos-radius-sm)] border px-4 py-2.5 text-[length:0.75rem] font-semibold tracking-[0.08em] uppercase"
          style={{
            borderColor: "var(--exds-judgement-accent)",
            color: "var(--exds-judgement-accent)",
          }}
        >
          {actionLabel}
        </Link>
      </div>

      <div
        className="mt-6 rounded-[var(--eos-radius-sm)] border px-4 py-4"
        style={{
          borderColor: "color-mix(in srgb, var(--exds-judgement-accent) 55%, transparent)",
          background:
            "color-mix(in srgb, var(--exds-judgement-accent) 12%, transparent)",
        }}
      >
        <p
          className="exds-editorial-label"
          style={{ color: "var(--exds-judgement-accent)" }}
        >
          What requires your judgement?
        </p>
        <p
          className="mt-2 max-w-2xl text-[length:1.05rem] font-medium leading-snug"
          style={{ color: "var(--exds-judgement-fg)" }}
        >
          {requiresJudgement}
        </p>
      </div>

      {children}
    </section>
  );
}
