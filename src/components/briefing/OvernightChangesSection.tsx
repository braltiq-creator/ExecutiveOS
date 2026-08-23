"use client";

import { BriefingSection } from "@/components/briefing/BriefingSection";
import { SignalFrame } from "@/components/briefing/SignalFrame";
import { severityClass } from "@/components/briefing/status";
import { useIntelligence } from "@/components/providers/IntelligenceProvider";
import { cn } from "@/lib/utils/cn";

function formatTime(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function OvernightChangesSection() {
  const { intelligence } = useIntelligence();

  return (
    <BriefingSection
      id="overnight-changes"
      overline="Overnight Changes"
      title="What moved while you were away"
      description="Each change is tied to a strategic outcome and a next step."
    >
      <div className="grid gap-4">
        {intelligence.overnightChanges.map((change) => (
          <SignalFrame
            key={change.id}
            whatChanged={change.whatChanged}
            why={change.why}
            outcomeId={change.outcomeId}
            whatShouldHappenNext={change.whatShouldHappenNext}
            recommendation={change.recommendation}
            eyebrow={
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
                    severityClass(change.severity),
                  )}
                >
                  {change.severity}
                </span>
                <span className="font-mono text-xs text-muted">
                  {formatTime(change.occurredAt)}
                </span>
              </div>
            }
          />
        ))}
      </div>
    </BriefingSection>
  );
}
