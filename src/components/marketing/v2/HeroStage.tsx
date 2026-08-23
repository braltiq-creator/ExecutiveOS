"use client";

import { useEffect, useState } from "react";
import { MarketingCta } from "@/components/marketing/MarketingCta";
import { TrustStrip } from "@/components/marketing/TrustStrip";
import { CommandCentreRender } from "@/components/marketing/v2/CommandCentreRender";
import { HOME, SITE } from "@/components/marketing/content";

/**
 * Hero experience V3 — one-shot choreography (≈6s), never loops.
 * Messaging unchanged from commercial library.
 */
export function HeroStage() {
  const [phase, setPhase] = useState<"boot" | "play" | "done">("boot");
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    setReduced(prefersReduced);
    if (prefersReduced) {
      setPhase("done");
      return;
    }
    const start = window.setTimeout(() => setPhase("play"), 40);
    const done = window.setTimeout(() => setPhase("done"), 6200);
    return () => {
      window.clearTimeout(start);
      window.clearTimeout(done);
    };
  }, []);

  const stage = reduced || phase === "done" ? "done" : phase;

  return (
    <section className="mk-section mk-v3-hero" data-hero-phase={stage}>
      <div className="mk-v3-hero-glow" aria-hidden="true" />
      <div className="mk-split mk-v3-hero-split">
        <div className="mk-v3-hero-copy">
          <p className="mk-kicker mk-v3-hero-item" data-delay="0">
            {SITE.product}
          </p>
          <h1 className="mk-display mk-v3-hero-item" data-delay="1">
            {HOME.headline}
          </h1>
          <p className="mk-lead mk-v3-hero-item" data-delay="2">
            {HOME.subheadline}
          </p>
          <div className="mk-v3-hero-item" data-delay="3">
            <MarketingCta />
          </div>
          <p className="mk-v2-value-line mk-v3-hero-item" data-delay="4">
            Buy Executive Intelligence — not another integration project.
          </p>
          <div className="mk-v3-hero-item" data-delay="5">
            <TrustStrip />
          </div>
        </div>

        <div className="mk-v3-hero-visual">
          <CommandCentreRender variant="hero" choreography={stage !== "boot"} />
        </div>
      </div>
    </section>
  );
}
