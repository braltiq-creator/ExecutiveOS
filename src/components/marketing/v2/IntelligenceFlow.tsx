"use client";

import { useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/marketing/v2/Reveal";

const SYSTEMS = [
  "Microsoft 365",
  "Dynamics",
  "Salesforce",
  "Simpro",
  "ERP",
] as const;

const STAGES = [
  {
    title: "Executive Intelligence",
    body: "Overnight change ranked against outcomes",
  },
  {
    title: "Domain Advisors",
    body: "Specialist evidence and challenge — not Council seats",
  },
  {
    title: "Executive Council",
    body: "CEO · CFO · COO · CRO · CSO — role-consistent judgement",
  },
  {
    title: "Executive Recommendation",
    body: "Stakes clear · dissent preserved · you decide",
  },
  {
    title: "Business Outcomes",
    body: "Clarity that compounds into results",
  },
] as const;

/** Centrepiece architecture — systems → intelligence → advisors → council → outcomes. */
export function IntelligenceFlow() {
  const ref = useRef<HTMLDivElement>(null);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDrawn(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setDrawn(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`mk-v2-flow mk-v3-flow ${drawn ? "is-drawn" : ""}`}
      aria-label="Executive Intelligence architecture"
    >
      <Reveal>
        <p className="mk-v2-council-label">Systems of record</p>
        <div className="mk-v2-flow-systems">
          {SYSTEMS.map((system) => (
            <span key={system}>{system}</span>
          ))}
        </div>
      </Reveal>

      <div className="mk-v3-flow-connector" aria-hidden="true">
        <i />
      </div>

      <div className="mk-v2-flow-stages mk-v3-flow-stages">
        {STAGES.map((stage, index) => (
          <Reveal key={stage.title} delayMs={index * 120}>
            <article
              className="mk-v2-flow-stage mk-v3-flow-stage"
              style={{ ["--i" as string]: index }}
            >
              <em>0{index + 1}</em>
              <h3>{stage.title}</h3>
              <p>{stage.body}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
