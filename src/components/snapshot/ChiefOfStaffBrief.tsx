"use client";

import { ExecutiveSummary } from "@/design-system";

type ChiefOfStaffBriefProps = {
  brief: string;
};

/** Trusted advisor voice — never ChatGPT, never a report. */
export function ChiefOfStaffBrief({ brief }: ChiefOfStaffBriefProps) {
  return (
    <ExecutiveSummary size="supporting" className="max-w-prose">
      {brief}
    </ExecutiveSummary>
  );
}
