"use client";

import { useEffect, useState } from "react";
import { Reveal } from "@/experience/motion/Reveal";
import { dayPartLabel } from "@/experience/executive-brief/briefCopy";
import { EXECUTIVE_ICONS } from "@/experience/icons";

type Props = {
  name: string;
  /** Number for demo; string for evidence-safe snapshot states. */
  health: number | string;
  refreshedLabel: string;
  asOf: string;
  /** When false, show name as the title without "Good morning …". */
  useGreeting?: boolean;
};

export function MissionHeader({
  name,
  health,
  refreshedLabel,
  asOf,
  useGreeting = true,
}: Props) {
  const [now, setNow] = useState(() => formatClock(new Date(asOf)));
  const HealthIcon = EXECUTIVE_ICONS.organisation_health;

  useEffect(() => {
    const tick = () => setNow(formatClock(new Date()));
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <Reveal delay={0}>
      <header className="mc-header flex flex-wrap items-end justify-between gap-3 border-b border-[var(--exs-divider)] pb-2.5">
        <div className="min-w-0 space-y-0.5">
          <p className="exs-label">Executive Command Centre</p>
          <h1 className="exs-title text-[length:1.3rem] tracking-tight">
            {useGreeting ? `${dayPartLabel(asOf)} ${name}` : name}
          </h1>
          <p className="exs-body text-[length:0.8rem]">
            <span className="tabular-nums text-[var(--exs-text)]">{now}</span>
            <span className="mx-2 text-[var(--exs-text-muted)]">·</span>
            Updated{" "}
            {refreshedLabel.replace(/^Updated\s+/i, "").toLowerCase()}
          </p>
        </div>
        <div className="text-right">
          <p className="exs-label inline-flex items-center gap-1.5">
            <HealthIcon
              className="h-3 w-3 text-[var(--exs-text-muted)]"
              strokeWidth={1.75}
              aria-hidden="true"
            />
            Organisation Health
          </p>
          <p
            className={
              typeof health === "number"
                ? "exs-value text-[length:1.75rem] leading-none"
                : "exs-title mt-0.5 max-w-[11rem] text-right text-[length:0.85rem] leading-snug"
            }
          >
            {health}
          </p>
        </div>
      </header>
    </Reveal>
  );
}

function formatClock(date: Date): string {
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
