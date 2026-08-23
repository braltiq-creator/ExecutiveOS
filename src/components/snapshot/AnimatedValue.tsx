"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";

type AnimatedValueProps = {
  value: string;
  numericValue: number | null;
  className?: string;
};

/** Smooth numeric settle — motion communicates change, not decoration. */
export function AnimatedValue({
  value,
  numericValue,
  className,
}: AnimatedValueProps) {
  const [display, setDisplay] = useState(value);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(media.matches);
    const onChange = () => setReduced(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (reduced || numericValue === null || !Number.isFinite(numericValue)) {
      setDisplay(value);
      return;
    }

    const suffix = value.replace(/^[\d.]+/, "");
    const prefersCount = Number.isInteger(numericValue) && numericValue <= 40;
    if (!prefersCount) {
      setDisplay(value);
      return;
    }

    let frame = 0;
    const frames = 12;
    const start = 0;
    let raf = 0;

    const tick = () => {
      frame += 1;
      const progress = frame / frames;
      const eased = 1 - (1 - progress) ** 3;
      const current = Math.round(start + (numericValue - start) * eased);
      setDisplay(`${current}${suffix}`);
      if (frame < frames) raf = window.requestAnimationFrame(tick);
    };

    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [value, numericValue, reduced]);

  return <span className={cn("eos-metric-value tabular-nums", className)}>{display}</span>;
}
