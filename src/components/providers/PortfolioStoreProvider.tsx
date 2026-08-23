"use client";

import { useEffect, type ReactNode } from "react";
import { usePortfolioStore } from "@/store/portfolio-store";

/** Hydrate mock portfolio persistence once on the client. */
export function PortfolioStoreProvider({ children }: { children: ReactNode }) {
  const hydrate = usePortfolioStore((state) => state.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return children;
}
