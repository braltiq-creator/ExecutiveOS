"use client";

import Link from "next/link";
import type { IntelligenceCenterData, InsightCategory } from "@/lib/intelligence-center/types";
import { INSIGHT_CATEGORY_LABELS } from "@/lib/intelligence-center/types";
import type { FeatureEntitlements } from "@/lib/features/types";
import { PriorityStrip } from "@/components/intelligence-center/PriorityStrip";
import { InsightCard } from "@/components/intelligence-center/InsightCard";
import { AdvisorInsightCard } from "@/components/intelligence-center/AdvisorInsightCard";
import { ExecutiveTimelinePanel } from "@/components/intelligence-center/ExecutiveTimelinePanel";
import { DigestPanel } from "@/components/intelligence-center/DigestPanel";

type IntelligenceCenterProps = {
  data: IntelligenceCenterData;
  entitlements?: FeatureEntitlements | null;
};

const CARD_SECTION_ORDER: InsightCategory[] = [
  "critical_attention",
  "strategic_opportunities",
  "recommended_decisions",
  "upcoming_risks",
  "delegated_actions",
  "people_issues",
  "meeting_preparation",
  "sales_highlights",
  "financial_highlights",
];

export function IntelligenceCenter({
  data,
  entitlements = null,
}: IntelligenceCenterProps) {
  const generatedDate = new Date(data.generatedAt).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const visibleSections = CARD_SECTION_ORDER.filter(
    (category) => data.cards[category].length > 0,
  );

  return (
    <div className="space-y-8 lg:space-y-10">
      <section className="relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm sm:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br from-zinc-100 to-transparent blur-2xl"
        />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
              Executive Intelligence Center
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
              {data.greeting}
            </h1>
            <p className="mt-3 text-sm text-zinc-600 sm:text-base">
              {data.jobTitle} · {data.company}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
              <p className="text-[10px] uppercase tracking-wider text-zinc-500">Health</p>
              <p className="text-2xl font-semibold text-zinc-900">{data.healthScore}</p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
              <p className="text-[10px] uppercase tracking-wider text-zinc-500">Insights</p>
              <p className="text-2xl font-semibold text-zinc-900">{data.insightCount}</p>
            </div>
            <Link
              href="/advisors"
              className="inline-flex items-center rounded-xl border border-zinc-900 bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
            >
              Ask Advisors
            </Link>
          </div>
        </div>
        <p className="relative mt-4 text-xs text-zinc-400">
          Intelligence refreshed {generatedDate}
          {entitlements ? ` · ${entitlements.plan.name} plan` : ""}
        </p>
      </section>

      <DigestPanel digest={data.digest} activeDigest={data.activeDigest} />

      {data.topInsights.length > 0 ? (
        <PriorityStrip insights={data.topInsights} />
      ) : null}

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
              Advisor Intelligence
            </p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-zinc-900">
              Specialist insights
            </h2>
          </div>
          <Link href="/advisors" className="text-xs font-medium text-zinc-600 hover:text-zinc-900">
            Open advisor team →
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {data.advisorSummaries.slice(0, 5).map((advisor) => (
            <AdvisorInsightCard key={advisor.agentId} advisor={advisor} />
          ))}
        </div>
      </section>

      {visibleSections.map((category) => (
        <section key={category}>
          <div className="mb-4">
            <h2 className="text-lg font-semibold tracking-tight text-zinc-900">
              {INSIGHT_CATEGORY_LABELS[category]}
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
            {data.cards[category].map((card) => (
              <InsightCard key={card.id} card={card} />
            ))}
          </div>
        </section>
      ))}

      <ExecutiveTimelinePanel timeline={data.timeline} />
    </div>
  );
}
