"use client";

import { useEffect } from "react";

/** Applies stored theme preference; defaults to light premium executive aesthetic. */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const stored = window.localStorage.getItem("eos-theme");
    const theme = stored === "dark" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
  }, []);

  return children;
}
