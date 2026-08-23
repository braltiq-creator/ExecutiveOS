"use client";

import Link from "next/link";
import type { BusinessPulse } from "@/lib/snapshot/types";
import {
  ExecutiveBadge,
  ExecutiveHeading,
  ExecutiveSummary,
  ds,
} from "@/design-system";
import { cn } from "@/lib/utils/cn";

type BusinessPulseCardProps = {
  pulse: BusinessPulse;
};

/**
 * Visual anchor of Today — Control · Confidence · Calm.
 * Signature: The Meridian (judgement arc behind state).
 */
export function BusinessPulseCard({ pulse }: BusinessPulseCardProps) {
  return (
    <Link
      href={pulse.href}
      data-level={pulse.level}
      className={cn("eos-pulse group block", ds.focusRing)}
    >
      <div className="eos-pulse-surface" aria-hidden="true">
        <span className="eos-meridian" data-level={pulse.level} />
        <span className="eos-pulse-glow" data-level={pulse.level} />
      </div>

      <div className="eos-pulse-content relative">
        <ExecutiveBadge className="text-[var(--eos-color-primary)]">
          Business Pulse
        </ExecutiveBadge>

        <ExecutiveHeading
          as="h1"
          size="xl"
          className={cn(
            "eos-pulse-label mt-[var(--eos-space-md)]",
            "transition-opacity duration-[var(--eos-duration-normal)] group-hover:opacity-90",
          )}
        >
          {pulse.label}
        </ExecutiveHeading>

        <ExecutiveSummary className="eos-pulse-why mt-[var(--eos-space-lg)] max-w-xl">
          {pulse.why}
        </ExecutiveSummary>

        <dl
          className={cn(
            "eos-pulse-meta mt-[var(--eos-space-xl)] flex flex-wrap",
            "gap-x-[var(--eos-space-2xl)] gap-y-[var(--eos-space-xs)]",
          )}
        >
          <div className="flex items-baseline gap-[var(--eos-space-sm)]">
            <dt className={ds.type.label}>Confidence</dt>
            <dd
              className={cn(
                ds.type.caption,
                "tabular-nums text-[var(--eos-color-text-secondary)]",
              )}
            >
              {pulse.confidence}%
            </dd>
          </div>
          <div className="flex items-baseline gap-[var(--eos-space-sm)]">
            <dt className={ds.type.label}>AI</dt>
            <dd
              className={cn(
                ds.type.caption,
                "tabular-nums text-[var(--eos-color-ai)]",
              )}
            >
              {pulse.aiConfidence}%
            </dd>
          </div>
          <div className="flex items-baseline gap-[var(--eos-space-sm)]">
            <dt className={ds.type.label}>Refreshed</dt>
            <dd
              className={cn(
                ds.type.caption,
                "tabular-nums text-[var(--eos-color-text-muted)]",
              )}
            >
              {pulse.refreshedLabel}
            </dd>
          </div>
        </dl>
      </div>
    </Link>
  );
}
