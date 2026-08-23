import { BriefCard } from "@/components/dashboard/BriefCard";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import type { BriefSection, MorningBrief } from "@/lib/briefing/types";
import type { FeatureEntitlements } from "@/lib/features/types";
import { hasFeature } from "@/lib/features/types";
import { FeatureGate } from "@/lib/features/FeatureGate";

type BriefSectionBlockProps = {
  section: BriefSection;
  compact?: boolean;
  columns?: 1 | 2;
};

function BriefSectionBlock({
  section,
  compact = false,
  columns = 1,
}: BriefSectionBlockProps) {
  return (
    <section>
      <SectionHeader title={section.title} />
      {section.items.length > 0 ? (
        <div
          className={
            columns === 2
              ? "grid gap-4 sm:grid-cols-2"
              : "grid gap-4"
          }
        >
          {section.items.map((item) => (
            <BriefCard key={item.id} item={item} compact={compact} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 px-5 py-8">
          <p className="text-sm leading-6 text-zinc-600">{section.emptyMessage}</p>
        </div>
      )}
    </section>
  );
}

type MorningBriefProps = {
  brief: MorningBrief;
  entitlements?: FeatureEntitlements | null;
};

export function MorningBrief({ brief, entitlements = null }: MorningBriefProps) {
  const generatedDate = new Date(brief.generatedAt).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="space-y-10 lg:space-y-12">
      <section className="rounded-2xl border border-zinc-200/80 bg-white/90 p-6 shadow-sm backdrop-blur-sm sm:p-8">
        <p className="text-sm font-medium text-zinc-500">Executive Dashboard</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl lg:text-5xl">
          {brief.greeting}
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-zinc-600 sm:text-lg">
          {brief.jobTitle} at {brief.company}
        </p>
        <p className="mt-4 text-xs text-zinc-400">Brief generated {generatedDate}</p>
      </section>

      <BriefSectionBlock section={brief.brief} />

      <BriefSectionBlock section={brief.todaysCalendar} />

      <BriefSectionBlock section={brief.meetingPreparation} columns={2} />

      <BriefSectionBlock section={brief.calendarHealth} />

      {entitlements && hasFeature(entitlements, "enterprise_health_analytics") ? (
        <BriefSectionBlock section={brief.executiveHealth} columns={2} />
      ) : entitlements ? (
        <FeatureGate
          feature="enterprise_health_analytics"
          entitlements={entitlements}
        />
      ) : null}

      <section>
        <SectionHeader
          title="Today's Focus"
          description="Deterministic priorities based on your objectives, risks, and opportunities."
        />
        <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/50 p-6 sm:p-8">
          <h3 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">
            {brief.todaysFocus.headline}
          </h3>
          <ul className="mt-5 space-y-3">
            {brief.todaysFocus.priorities.map((priority) => (
              <li
                key={priority}
                className="flex items-start gap-3 text-sm leading-6 text-zinc-700 sm:text-base"
              >
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-zinc-900" />
                <span>{priority}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <BriefSectionBlock section={brief.strategicPriorities} columns={2} />

      <BriefSectionBlock section={brief.initiativeHealth} columns={2} />

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-8">
        <BriefSectionBlock section={brief.executiveMemory} compact />
        <BriefSectionBlock section={brief.risks} compact />
      </div>

      <BriefSectionBlock section={brief.opportunities} columns={2} />
    </div>
  );
}
