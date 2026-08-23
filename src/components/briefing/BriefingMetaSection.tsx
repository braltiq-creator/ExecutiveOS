"use client";

import Link from "next/link";
import { BriefingSection } from "@/components/briefing/BriefingSection";
import { useExecutiveBriefing } from "@/components/providers/ExecutiveBriefingProvider";
import { isMockMode } from "@/lib/mock/mode";

/** Honesty layer — freshness, Trust gaps, session — never ransom. */
export function BriefingMetaSection() {
  const { briefing } = useExecutiveBriefing();
  const mock = isMockMode();

  return (
    <BriefingSection
      id="briefing-meta"
      overline="Meta"
      title="Briefing integrity"
      description="What this picture includes — and what it does not invent."
    >
      <dl className="grid max-w-2xl gap-5 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
            As of
          </dt>
          <dd className="mt-1.5 text-foreground">
            {new Intl.DateTimeFormat(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            }).format(new Date(briefing.summary.asOf))}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
            Session
          </dt>
          <dd className="mt-1.5 text-foreground">
            {mock ? "Mock operating picture" : "Connected session"}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
            Attention
          </dt>
          <dd className="mt-1.5 text-foreground">
            {briefing.summary.attentionCount} ranked items ·{" "}
            {briefing.summary.decisionsDueToday} decision
            {briefing.summary.decisionsDueToday === 1 ? "" : "s"} due
          </dd>
        </div>
        <div>
          <dt className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
            Trust
          </dt>
          <dd className="mt-1.5 text-secondary">
            Connectors optional.{" "}
            <Link
              href="/settings/integrations"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Review Trust Zone
            </Link>
          </dd>
        </div>
      </dl>
      <p className="mt-6 max-w-xl text-sm leading-6 text-secondary">
        Gaps stay named. Completeness is never fabricated for comfort.
      </p>
    </BriefingSection>
  );
}
