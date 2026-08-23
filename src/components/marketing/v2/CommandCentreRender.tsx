"use client";

import { useEffect, useState } from "react";
import { MkIcon } from "@/components/marketing/v2/MkIcon";

type CommandCentreRenderProps = {
  variant?: "hero" | "showcase";
  className?: string;
  /** When true, runs one-shot reveal choreography (hero only). */
  choreography?: boolean;
};

const INSIGHTS = [
  "Regional demand shifted overnight — ranked for judgement.",
  "Plant capacity crossed the frozen horizon.",
  "Working capital trapped in ageing mix.",
] as const;

function useCountUp(target: number, active: boolean, duration = 1400) {
  const [value, setValue] = useState(active ? 0 : target);

  useEffect(() => {
    if (!active) {
      setValue(target);
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(target);
      return;
    }
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) ** 3;
      setValue(Math.round(target * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, target, duration]);

  return value;
}

/** Premium product render — marketing quality, not a screenshot dump. */
export function CommandCentreRender({
  variant = "hero",
  className = "",
  choreography = false,
}: CommandCentreRenderProps) {
  const [ready, setReady] = useState(!choreography);
  const health = useCountUp(82, choreography && ready, 1600);
  const valueHours = useCountUp(42, choreography && ready, 1700);

  useEffect(() => {
    if (!choreography) {
      setReady(true);
      return;
    }
    const id = window.setTimeout(() => setReady(true), 180);
    return () => window.clearTimeout(id);
  }, [choreography]);

  return (
    <div
      className={`mk-v2-render mk-v3-render ${variant === "showcase" ? "mk-v2-render-lg" : ""} ${choreography ? "is-choreographed" : ""} ${ready ? "is-ready" : ""} ${className}`}
      aria-label="Executive Command Centre product render"
      data-variant={variant}
    >
      <div className="mk-v3-render-aura" aria-hidden="true" />

      <div className="mk-v2-render-chrome">
        <span />
        <span />
        <span />
        <p>Executive Command Centre</p>
      </div>

      <div className="mk-v2-render-body">
        <header className="mk-v2-render-brief mk-v3-stage" data-stage="1">
          <div>
            <p className="mk-v2-render-kicker">Executive Brief</p>
            <h3>Before your first meeting</h3>
            <p>Three items require judgement — ranked against outcomes.</p>
          </div>
          <div className="mk-v2-render-badge">
            <MkIcon id="pulse" size={16} />
            Morning ready
          </div>
        </header>

        <div className="mk-v2-render-grid">
          <article
            className="mk-v2-render-card mk-v2-span-2 mk-v3-glass mk-v3-stage"
            data-stage="2"
          >
            <div className="mk-v2-render-card-head">
              <MkIcon id="organisation_health" size={16} />
              <span>Organisation Health</span>
            </div>
            <div className="mk-v2-health-row">
              <div>
                <strong>{health}</strong>
                <span>Stable with pressure</span>
              </div>
              <div
                className="mk-v2-meter"
                style={{ ["--mk-fill" as string]: `${health}%` }}
              />
            </div>
          </article>

          <article
            className="mk-v2-render-card mk-v3-glass mk-v3-stage"
            data-stage="3"
          >
            <div className="mk-v2-render-card-head">
              <MkIcon id="executive_value" size={16} />
              <span>Executive Value</span>
            </div>
            <p className="mk-v2-render-metric">
              <strong>{(valueHours / 10).toFixed(1)}h</strong>
              <span>returned / week</span>
            </p>
          </article>

          <article
            className="mk-v2-render-card mk-v3-glass mk-v3-stage"
            data-stage="4"
          >
            <div className="mk-v2-render-card-head">
              <MkIcon id="people_health" size={16} />
              <span>Executive Council</span>
            </div>
            <div className="mk-v2-council-dots mk-v3-avatars">
              {["CEO", "CFO", "COO", "CRO", "CSO"].map((role, index) => (
                <span
                  key={role}
                  className="mk-v3-avatar"
                  style={{ ["--i" as string]: index }}
                >
                  {role}
                </span>
              ))}
            </div>
          </article>

          <article
            className="mk-v2-render-card mk-v2-span-2 mk-v3-glass mk-v3-stage"
            data-stage="5"
          >
            <div className="mk-v2-render-card-head">
              <MkIcon id="priority_decisions" size={16} />
              <span>Judgement Queue</span>
            </div>
            <ul className="mk-v2-decision-list">
              <li>
                <em>01</em>
                <span>Protect West fill without breaking Plant 2 capacity</span>
              </li>
              <li>
                <em>02</em>
                <span>Release ageing capital before next board pack</span>
              </li>
            </ul>
          </article>

          <article
            className="mk-v2-render-card mk-v2-span-2 mk-v3-glass mk-v3-stage"
            data-stage="6"
          >
            <div className="mk-v2-render-card-head">
              <MkIcon id="executive_intelligence" size={16} />
              <span>Overnight insights</span>
            </div>
            <ul className="mk-v3-insight-list">
              {INSIGHTS.map((insight, index) => (
                <li
                  key={insight}
                  className="mk-v3-insight-item"
                  style={{ ["--i" as string]: index }}
                >
                  {insight}
                </li>
              ))}
            </ul>
          </article>

          <article
            className="mk-v2-render-card mk-v2-span-2 mk-v3-glass mk-v3-stage"
            data-stage="7"
          >
            <div className="mk-v2-render-card-head">
              <MkIcon id="strategic_outcomes" size={16} />
              <span>Business Outcomes</span>
            </div>
            <p className="mk-v2-insight">
              Clarity before the meeting. Judgement prepared. Authority stays
              with you.
            </p>
          </article>
        </div>
      </div>
    </div>
  );
}
