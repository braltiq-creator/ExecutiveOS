"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type EvidenceLabTab = {
  id: string;
  index: string;
  label: string;
  /** Executive question this instrument answers. */
  question?: string;
  content: ReactNode;
};

type Props = {
  tabs: EvidenceLabTab[];
  className?: string;
  heading?: string;
  subheading?: string;
};

/**
 * Phase 66/67 — Evidence Lab: investigate layer; one instrument at a time.
 * Instruments remain in DOM (hidden when inactive). Calculations unchanged.
 */
export function EvidenceLab({
  tabs,
  className,
  heading = "Investigate the signal",
  subheading = "Evidence instruments — one at a time",
}: Props) {
  const available = tabs.filter((t) => t.content != null);
  const [activeId, setActiveId] = useState(available[0]?.id ?? "");
  const active = available.find((t) => t.id === activeId) ?? available[0];

  if (available.length === 0) return null;

  return (
    <section
      aria-label="Evidence Lab"
      data-evidence-lab="true"
      data-cc-layer="investigate"
      className={cn("space-y-4", className)}
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p
            className="exds-editorial-label"
            style={{ color: "var(--exds-intelligence)" }}
          >
            Evidence
          </p>
          <p className="mt-1 text-[length:1.05rem] font-semibold tracking-tight">
            {heading}
          </p>
          <p className="eos-type-caption mt-1">{subheading}</p>
        </div>
      </div>

      <div
        role="tablist"
        aria-label="Evidence instruments"
        className="flex flex-wrap gap-2 border-b pb-3"
        style={{ borderColor: "var(--exds-electric-border)" }}
        data-evidence-lab-nav="true"
      >
        {available.map((tab) => {
          const selected = tab.id === active?.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`evidence-tab-${tab.id}`}
              aria-controls={`evidence-panel-${tab.id}`}
              aria-selected={selected}
              tabIndex={selected ? 0 : -1}
              data-evidence-tab={tab.id}
              onClick={() => setActiveId(tab.id)}
              className={cn(
                "exds-focus-ring max-w-[14rem] px-3 py-2 text-left transition-colors",
              )}
              style={{
                color: selected
                  ? "var(--exds-electric, var(--exds-intelligence))"
                  : "var(--eos-color-text-muted)",
                borderBottom: selected
                  ? "2px solid var(--exds-electric, var(--exds-intelligence))"
                  : "2px solid transparent",
              }}
            >
              <span className="eos-type-caption font-semibold uppercase tracking-[0.08em]">
                <span className="tabular-nums">{tab.index}</span> {tab.label}
              </span>
              {tab.question ? (
                <span className="mt-0.5 block text-[length:0.7rem] font-medium leading-snug normal-case tracking-normal opacity-80">
                  {tab.question}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {available.map((tab) => {
        const selected = tab.id === active?.id;
        return (
          <div
            key={tab.id}
            role="tabpanel"
            id={`evidence-panel-${tab.id}`}
            aria-labelledby={`evidence-tab-${tab.id}`}
            hidden={!selected}
            data-evidence-lab-panel={tab.id}
            data-evidence-lab-active={selected ? "true" : "false"}
            className="min-w-0"
          >
            {tab.content}
          </div>
        );
      })}
    </section>
  );
}
