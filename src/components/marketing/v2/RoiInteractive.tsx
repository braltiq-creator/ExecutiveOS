"use client";

import { useState } from "react";
import { MkIcon } from "@/components/marketing/v2/MkIcon";
import { Reveal } from "@/components/marketing/v2/Reveal";
import type { ExecutiveIconId } from "@/experience/icons/executiveIcons";
import { ROI_ANCHORS } from "@/components/marketing/content";

const OUTCOMES: Array<{
  id: string;
  label: string;
  title: string;
  body: string;
  icon: ExecutiveIconId;
}> = [
  {
    id: "revenue",
    label: "Revenue Protected",
    title: "Commercial confidence",
    body: "Shared overnight picture so commitments are challenged before they become surprises.",
    icon: "commercial_health",
  },
  {
    id: "cost",
    label: "Cost Savings",
    title: ROI_ANCHORS[0].title,
    body: ROI_ANCHORS[0].body,
    icon: "executive_value",
  },
  {
    id: "capital",
    label: "Working Capital",
    title: "Capital released from fog",
    body: "Inventory and ageing made legible as executive judgement — not warehouse theatre.",
    icon: "value",
  },
  {
    id: "risk",
    label: "Risk Reduced",
    title: "Stakes before the meeting",
    body: "Material risks surfaced for judgement — not buried until quarterly review.",
    icon: "critical_risks",
  },
  {
    id: "confidence",
    label: "Decision Confidence",
    title: "Confidence Through Clarity",
    body: "Explainable stakes, alternatives, and unknowns — authority stays with the executive.",
    icon: "priority_decisions",
  },
  {
    id: "hours",
    label: "Hours Returned",
    title: ROI_ANCHORS[1].title,
    body: ROI_ANCHORS[1].body,
    icon: "today",
  },
];

export function RoiInteractive() {
  const [active, setActive] = useState(OUTCOMES[0].id);
  const current = OUTCOMES.find((o) => o.id === active) ?? OUTCOMES[0];

  return (
    <div className="mk-v2-roi mk-v3-roi">
      <div className="mk-v3-roi-grid" role="tablist" aria-label="Business outcomes">
        {OUTCOMES.map((item, index) => (
          <Reveal key={item.id} delayMs={index * 50}>
            <button
              type="button"
              role="tab"
              aria-selected={active === item.id}
              className={`mk-v3-roi-card ${active === item.id ? "is-active" : ""}`}
              onClick={() => setActive(item.id)}
            >
              <MkIcon id={item.icon} size={20} />
              <strong>{item.label}</strong>
            </button>
          </Reveal>
        ))}
      </div>
      <Reveal key={current.id}>
        <article className="mk-v2-roi-panel mk-v3-glass">
          <p className="mk-card-meta">Business outcome</p>
          <h3 className="mk-h3">{current.title}</h3>
          <p className="mk-body">{current.body}</p>
          <p className="mk-v2-kpi-note">
            Anchors for conversation — not guarantees. Focus is outcomes, not
            feature lists.
          </p>
        </article>
      </Reveal>
    </div>
  );
}
