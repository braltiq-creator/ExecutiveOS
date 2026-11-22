"use client";

import { useEffect } from "react";

/** Applies stored theme preference; defaults to dark graphite executive OS. */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const stored = window.localStorage.getItem("eos-theme");
    const theme = stored === "light" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", theme);
  }, []);

  return children;
}
