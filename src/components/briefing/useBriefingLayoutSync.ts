"use client";

import { useEffect } from "react";
import {
  useExecutiveBriefing,
  type BriefingLayoutMode,
} from "@/components/providers/ExecutiveBriefingProvider";

function resolveMode(width: number, boardMode: boolean): BriefingLayoutMode {
  if (boardMode) return "board";
  if (width < 640) return "mobile";
  if (width < 1024) return "tablet";
  if (width < 1280) return "laptop";
  return "desktop";
}

/** Keeps briefing layout mode aligned with viewport unless Board Mode is on. */
export function useBriefingLayoutSync() {
  const { boardMode, setLayoutMode } = useExecutiveBriefing();

  useEffect(() => {
    function update() {
      setLayoutMode(resolveMode(window.innerWidth, boardMode));
    }

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [boardMode, setLayoutMode]);
}
