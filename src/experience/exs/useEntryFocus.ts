"use client";

import { useEffect, useState } from "react";

/** Scroll to entry section and briefly highlight — shared workspace pattern. */
export function useEntryFocus(sectionId: string) {
  const [active, setActive] = useState(true);

  useEffect(() => {
    const el = document.getElementById(sectionId);
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "start",
    });
    setActive(true);
    const id = window.setTimeout(() => setActive(false), 2400);
    return () => window.clearTimeout(id);
  }, [sectionId]);

  return active;
}
