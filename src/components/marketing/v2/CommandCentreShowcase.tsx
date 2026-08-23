"use client";

import { useState } from "react";
import { CommandCentreRender } from "@/components/marketing/v2/CommandCentreRender";
import { MkIcon } from "@/components/marketing/v2/MkIcon";
import { Reveal } from "@/components/marketing/v2/Reveal";
import type { ExecutiveIconId } from "@/experience/icons/executiveIcons";

const CALLOUTS: Array<{
  id: string;
  label: string;
  body: string;
  icon: ExecutiveIconId;
  position: string;
}> = [
  {
    id: "brief",
    label: "Morning Brief",
    body: "What changed overnight — before email.",
    icon: "today",
    position: "mk-v2-pin-tl",
  },
  {
    id: "health",
    label: "Organisation Health",
    body: "Enterprise pulse, not a KPI wall.",
    icon: "organisation_health",
    position: "mk-v2-pin-tr",
  },
  {
    id: "value",
    label: "Executive Value",
    body: "Time and judgement returned.",
    icon: "executive_value",
    position: "mk-v2-pin-ml",
  },
  {
    id: "queue",
    label: "Judgement Queue",
    body: "Priority decisions ranked for you.",
    icon: "priority_decisions",
    position: "mk-v2-pin-mr",
  },
  {
    id: "council",
    label: "Executive Council",
    body: "Role-consistent perspectives ready.",
    icon: "people_health",
    position: "mk-v2-pin-bl",
  },
  {
    id: "timeline",
    label: "Activity Timeline",
    body: "Overnight movement, calmly sequenced.",
    icon: "activity",
    position: "mk-v2-pin-br",
  },
];

export function CommandCentreShowcase() {
  const [active, setActive] = useState(CALLOUTS[0].id);

  return (
    <div className="mk-v2-showcase mk-v3-showcase">
      <Reveal>
        <CommandCentreRender variant="showcase" />
      </Reveal>
      {CALLOUTS.map((pin, index) => (
        <Reveal
          key={pin.id}
          delayMs={120 + index * 90}
          className={`mk-v2-pin ${pin.position}`}
        >
          <button
            type="button"
            className={`mk-v2-pin-card mk-v3-pin-btn ${active === pin.id ? "is-active" : ""}`}
            onClick={() => setActive(pin.id)}
            aria-pressed={active === pin.id}
          >
            <MkIcon id={pin.icon} size={16} />
            <div>
              <strong>{pin.label}</strong>
              <span>{pin.body}</span>
            </div>
          </button>
        </Reveal>
      ))}
    </div>
  );
}
