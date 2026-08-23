"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { ExsTrend } from "@/experience/exs/ExsTrend";
import type { McKpi } from "@/experience/mission-control/types";
import { cn } from "@/lib/utils/cn";

type Props = {
  kpi: McKpi;
  icon: LucideIcon;
};

/**
 * Standard EXS KPI card:
 * Icon · Label · Primary value · Status · Confidence · timestamp
 */
export function ExsKpiCard({ kpi, icon: Icon }: Props) {
  const prev = useRef(kpi.value);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (prev.current === kpi.value) return;
    prev.current = kpi.value;
    setFlash(true);
    const id = window.setTimeout(() => setFlash(false), 720);
    return () => window.clearTimeout(id);
  }, [kpi.value]);

  return (
    <Link
      href={kpi.href}
      className={cn(
        "exs-card mc-kpi-card h-full justify-between",
        flash && "mc-kpi-live",
        kpi.changed && "mc-kpi-changed",
      )}
    >
      <div className="flex items-start justify-between gap-1">
        <Icon
          className="h-3.5 w-3.5 shrink-0 text-[var(--exs-text-muted)]"
          strokeWidth={1.75}
          aria-hidden="true"
        />
        {kpi.updatedLabel ? (
          <span className="truncate text-[length:0.6rem] tabular-nums text-[var(--exs-text-muted)]">
            {kpi.updatedLabel}
          </span>
        ) : null}
      </div>
      <p className="exs-label mt-1.5 truncate">{kpi.label}</p>
      <p
        className={cn(
          "exs-value mt-0.5 truncate text-[length:1.2rem]",
          flash && "mc-kpi-value-flash",
        )}
      >
        {kpi.value}
      </p>
      <div className="mt-1 flex items-center justify-between gap-1">
        <p className="flex min-w-0 items-center gap-1 truncate text-[length:0.68rem] text-[var(--exs-text-secondary)]">
          <ExsTrend trend={kpi.trend} severity={kpi.severity} />
          <span className="truncate">{kpi.status}</span>
        </p>
        <p className="shrink-0 text-[length:0.62rem] tabular-nums text-[var(--exs-text-muted)]">
          {kpi.confidence}%
        </p>
      </div>
    </Link>
  );
}
