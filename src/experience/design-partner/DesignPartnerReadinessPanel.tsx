"use client";

import type { DesignPartnerReadinessSummary } from "@/design-partner";
import { cn } from "@/lib/utils/cn";

type Props = {
  summary: DesignPartnerReadinessSummary;
  className?: string;
};

function Score({ label, value }: { label: string; value: number | null }) {
  return (
    <div>
      <p className="exds-editorial-label">{label}</p>
      <p className="mt-1 tabular-nums text-[length:1.25rem] font-semibold tracking-tight">
        {value == null ? "—" : `${value}%`}
      </p>
    </div>
  );
}

/**
 * Dataset readiness vs Executive Judgement readiness — never collapsed.
 */
export function DesignPartnerReadinessPanel({ summary, className }: Props) {
  return (
    <section
      aria-label="Data readiness"
      data-design-partner-readiness="true"
      className={cn(
        "rounded-[var(--exds-card-radius)] border p-[var(--eos-space-lg)]",
        className,
      )}
      style={{
        borderColor: "var(--exds-card-border)",
        background: "var(--exds-card-bg)",
      }}
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="exds-editorial-label">Dataset readiness</p>
          <p className="mt-1 tabular-nums text-[length:2rem] font-semibold tracking-tight">
            {summary.datasetReadiness}%
          </p>
        </div>
        <div>
          <p className="exds-editorial-label">Executive judgement readiness</p>
          <p
            className="mt-1 tabular-nums text-[length:2rem] font-semibold tracking-tight"
            style={{ color: "var(--exds-decision, var(--exds-attention))" }}
          >
            {summary.executiveJudgementReadiness}%
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Score label="Quality" value={summary.quality} />
        <Score label="Coverage" value={summary.coverage} />
        <Score label="Freshness" value={summary.freshness} />
        <Score label="Relationships" value={summary.relationships} />
        <Score label="Forecast completeness" value={summary.forecastCompleteness} />
        <Score label="Actual demand" value={summary.actualDemandCoverage} />
        <Score label="Capacity" value={summary.capacityCoverage} />
        <Score label="Inventory" value={summary.inventoryCoverage} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <List title="What we received" items={summary.whatWeReceived} />
        <List title="What we understood" items={summary.whatWeUnderstood} />
        <List title="What is missing" items={summary.whatIsMissing} />
        <List
          title="What we can confidently interpret"
          items={summary.whatWeCanInterpret}
        />
        <List
          title="What we cannot yet interpret"
          items={summary.whatWeCannotInterpret}
          className="lg:col-span-2"
        />
      </div>

      {summary.issues.length > 0 ? (
        <div className="mt-8 border-t pt-6" style={{ borderColor: "var(--exds-card-border)" }}>
          <p className="exds-editorial-label">Data quality issues</p>
          <ul className="mt-3 space-y-2">
            {summary.issues.map((issue) => (
              <li key={issue.id} className="eos-type-supporting">
                <span className="font-medium capitalize">{issue.severity}</span>
                {" · "}
                {issue.title}
                {issue.transformationNote
                  ? ` — ${issue.transformationNote}`
                  : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

function List({
  title,
  items,
  className,
}: {
  title: string;
  items: string[];
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="exds-editorial-label">{title}</p>
      <ul className="mt-2 space-y-1">
        {items.length === 0 ? (
          <li className="eos-type-caption">None recorded.</li>
        ) : (
          items.map((item) => (
            <li key={item} className="eos-type-supporting">
              {item}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
