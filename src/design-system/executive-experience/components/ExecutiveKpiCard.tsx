"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { ds } from "@/design-system/tokens";
import { clampConfidence } from "../colour";
import type { ExdsSemanticTone, ExdsTrendDirection } from "../types";
import { MiniSparkline } from "./micro/MiniSparkline";
import { MovementIndicator } from "./micro/MovementIndicator";

type ExecutiveKpiCardProps = {
  title: string;
  value: ReactNode;
  href: string;
  icon?: LucideIcon;
  trend?: ExdsTrendDirection;
  trendLabel?: string;
  sparkline?: number[];
  confidence?: number;
  timestamp?: string;
  tone?: ExdsSemanticTone;
  invertTrend?: boolean;
  className?: string;
};

/**
 * Rich Executive KPI card.
 * Icon · Title · Value · Trend · Sparkline · Confidence · Timestamp · Open →
 */
export function ExecutiveKpiCard({
  title,
  value,
  href,
  icon: Icon,
  trend = "flat",
  trendLabel,
  sparkline,
  confidence,
  timestamp,
  tone,
  invertTrend = false,
  className,
}: ExecutiveKpiCardProps) {
  const conf =
    confidence === undefined ? undefined : clampConfidence(confidence);

  return (
    <Link
      href={href}
      className={cn(
        "exds-interactive exds-focus-ring group flex h-full flex-col justify-between",
        "rounded-[var(--exds-card-radius)] border border-[var(--exds-card-border)]",
        "bg-[var(--exds-card-bg)] p-[var(--eos-space-lg)] backdrop-blur-[18px]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          {Icon ? (
            <Icon
              className="h-4 w-4 shrink-0 text-[var(--eos-color-text-muted)]"
              strokeWidth={1.75}
              aria-hidden="true"
            />
          ) : null}
          <p className={cn(ds.type.label, "truncate normal-case tracking-normal")}>
            {title}
          </p>
        </div>
        {timestamp ? (
          <span className="eos-type-caption shrink-0 tabular-nums">{timestamp}</span>
        ) : null}
      </div>

      <div className="mt-[var(--eos-space-md)] flex items-end justify-between gap-3">
        <p className={cn(ds.type.metric, "text-[length:1.35rem] exds-soft-counter")}>
          {value}
        </p>
        {sparkline && sparkline.length > 0 ? (
          <MiniSparkline values={sparkline} trend={trend} tone={tone} />
        ) : null}
      </div>

      <div className="mt-[var(--eos-space-md)] flex items-center justify-between gap-2">
        <MovementIndicator
          direction={trend}
          label={trendLabel}
          invert={invertTrend}
        />
        <div className="flex items-center gap-2">
          {conf !== undefined ? (
            <span className="eos-type-caption tabular-nums">{conf}%</span>
          ) : null}
          <span className="eos-type-caption text-[var(--exds-intelligence)] opacity-80 transition-opacity group-hover:opacity-100">
            Open →
          </span>
        </div>
      </div>
    </Link>
  );
}
