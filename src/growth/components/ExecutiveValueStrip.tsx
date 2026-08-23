"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  computeExecutiveValueScore,
  synthesiseValueEstimates,
  listValueEstimates,
} from "@/growth/executive-value";
import { ExperienceCardShell } from "@/experience/design-system/Card";
import { ExperienceBadge } from "@/experience/design-system/Badge";
import { ConfidenceBar } from "@/experience/motion/ConfidenceBar";

type ExecutiveValueStripProps = {
  organizationId: string;
};

/** Home-screen value prominence — EVS + key value signals. */
export function ExecutiveValueStrip({
  organizationId,
}: ExecutiveValueStripProps) {
  const evs = useMemo(() => {
    if (listValueEstimates(organizationId).length === 0) {
      synthesiseValueEstimates({ organizationId });
    }
    return computeExecutiveValueScore({ organizationId });
  }, [organizationId]);

  return (
    <ExperienceCardShell className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <ExperienceBadge tone="success">Executive Value</ExperienceBadge>
          <p className="ex-heading mt-2 text-xl">
            ${evs.last30Days.toLocaleString()} this month
          </p>
          <p className="ex-body mt-1">
            EVS {evs.score} · {evs.trend} vs prior · Lifetime $
            {evs.lifetimeValue.toLocaleString()}
          </p>
        </div>
        <ConfidenceBar
          value={evs.confidence}
          className="w-32"
          label="Confidence"
        />
      </div>

      <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="This week" value={`$${evs.last7Days.toLocaleString()}`} />
        <Metric
          label="Revenue protected"
          value={`$${evs.breakdown.revenueProtected.toLocaleString()}`}
        />
        <Metric
          label="Cost savings"
          value={`$${evs.breakdown.costSavings.toLocaleString()}`}
        />
        <Metric
          label="Hours saved"
          value={`${evs.breakdown.executiveHoursSaved}h`}
        />
      </dl>

      {evs.topRecommendationByValue ? (
        <p className="ex-body">
          Top recommendation by value:{" "}
          <span className="text-[var(--ex-text)]">
            {evs.topRecommendationByValue.title}
          </span>{" "}
          (~${evs.topRecommendationByValue.valueAud.toLocaleString()})
        </p>
      ) : null}

      <Link
        href="/value"
        className="ex-body text-[var(--ex-accent)] underline-offset-4 hover:underline"
      >
        View value evidence and ROI report
      </Link>
    </ExperienceCardShell>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="ex-caption">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-[var(--ex-text)]">
        {value}
      </dd>
    </div>
  );
}
