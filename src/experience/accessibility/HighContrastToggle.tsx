"use client";

import { useEffect, useState } from "react";
import { ExperienceButton } from "@/experience/design-system/Button";

const STORAGE_KEY = "eos-contrast";

/** WCAG AA support — high contrast mode toggle. */
export function HighContrastToggle() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) === "high";
    setEnabled(stored);
    document.documentElement.setAttribute(
      "data-contrast",
      stored ? "high" : "normal",
    );
  }, []);

  function toggle() {
    const next = !enabled;
    setEnabled(next);
    document.documentElement.setAttribute(
      "data-contrast",
      next ? "high" : "normal",
    );
    window.localStorage.setItem(STORAGE_KEY, next ? "high" : "normal");
  }

  return (
    <ExperienceButton
      variant="ghost"
      size="sm"
      onClick={toggle}
      aria-pressed={enabled}
    >
      {enabled ? "Standard contrast" : "High contrast"}
    </ExperienceButton>
  );
}
