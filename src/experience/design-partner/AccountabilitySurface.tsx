"use client";

import { cn } from "@/lib/utils/cn";

type Row = {
  decisionId: string;
  decisionLabel: string;
  statusLabel: string;
  actionLabel: string | null;
  owner: string | null;
  due: string | null;
  lastChange: string;
  requiresAttention: boolean;
  overdue: boolean;
};

type Props = {
  rows: Row[];
  className?: string;
};

/**
 * Phase 65 — Lightweight accountability (editorial, not a task dashboard).
 */
export function AccountabilitySurface({ rows, className }: Props) {
  if (rows.length === 0) {
    return (
      <section
        aria-label="Accountability"
        data-accountability="true"
        className={cn("space-y-2", className)}
      >
        <p className="exds-editorial-label" style={{ color: "var(--exds-decision)" }}>
          Accountability
        </p>
        <p className="eos-type-supporting">
          No decisions recorded for this snapshot yet.
        </p>
      </section>
    );
  }

  return (
    <section
      aria-label="Accountability"
      data-accountability="true"
      className={cn("space-y-4", className)}
    >
      <p className="exds-editorial-label" style={{ color: "var(--exds-decision)" }}>
        Accountability
      </p>
      <ul className="space-y-4">
        {rows.map((row) => (
          <li
            key={row.decisionId}
            className="border-b pb-4"
            style={{ borderColor: "var(--exds-electric-border)" }}
          >
            <p className="exds-editorial-label">Decision</p>
            <p className="mt-1 text-[length:1rem] font-semibold tracking-tight">
              {row.decisionLabel}
            </p>
            <dl className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="exds-editorial-label">Status</dt>
                <dd className="eos-type-supporting mt-0.5">{row.statusLabel}</dd>
              </div>
              <div>
                <dt className="exds-editorial-label">Action</dt>
                <dd className="eos-type-supporting mt-0.5">
                  {row.actionLabel ?? "Action not yet created."}
                </dd>
              </div>
              <div>
                <dt className="exds-editorial-label">Owner</dt>
                <dd className="eos-type-supporting mt-0.5">
                  {row.owner ?? "Owner not yet assigned"}
                </dd>
              </div>
              <div>
                <dt className="exds-editorial-label">Due</dt>
                <dd className="eos-type-supporting mt-0.5">
                  {row.due ?? "Due date not yet assigned"}
                </dd>
              </div>
            </dl>
            <p className="eos-type-caption mt-3">Last change · {row.lastChange}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
