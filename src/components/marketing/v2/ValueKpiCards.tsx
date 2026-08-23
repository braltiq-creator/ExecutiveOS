"use client";

import { AnimatedStat } from "@/components/marketing/v2/AnimatedStat";
import { MkIcon } from "@/components/marketing/v2/MkIcon";
import { Reveal } from "@/components/marketing/v2/Reveal";
import type { ExecutiveIconId } from "@/experience/icons/executiveIcons";

const KPIS: Array<{
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  note: string;
  icon: ExecutiveIconId;
}> = [
  {
    label: "Revenue Protected",
    value: 2.4,
    prefix: "$",
    suffix: "M",
    decimals: 1,
    note: "Illustrative outcome anchor",
    icon: "commercial_health",
  },
  {
    label: "Working Capital Improved",
    value: 18,
    suffix: "%",
    note: "Capital released from fog",
    icon: "executive_value",
  },
  {
    label: "Executive Hours Returned",
    value: 4.2,
    suffix: "h",
    decimals: 1,
    note: "Per executive / week",
    icon: "today",
  },
  {
    label: "Forecast Confidence",
    value: 72,
    suffix: "%",
    note: "Hierarchy made explicit",
    icon: "strategic_outcomes",
  },
  {
    label: "Organisation Health",
    value: 82,
    note: "Stable with pressure",
    icon: "organisation_health",
  },
  {
    label: "Executive Value Generated",
    value: 11,
    suffix: "×",
    note: "Clarity vs assembly cost",
    icon: "value",
  },
];

export function ValueKpiCards() {
  return (
    <div className="mk-v2-kpi-grid">
      {KPIS.map((kpi, index) => (
        <Reveal key={kpi.label} delayMs={index * 70}>
          <article className="mk-v2-kpi">
            <div className="mk-v2-kpi-head">
              <MkIcon id={kpi.icon} size={18} />
              <span>{kpi.label}</span>
            </div>
            <p className="mk-v2-kpi-value">
              <AnimatedStat
                value={kpi.value}
                prefix={kpi.prefix}
                suffix={kpi.suffix}
                decimals={kpi.decimals}
              />
            </p>
            <p className="mk-v2-kpi-note">{kpi.note}</p>
          </article>
        </Reveal>
      ))}
    </div>
  );
}
