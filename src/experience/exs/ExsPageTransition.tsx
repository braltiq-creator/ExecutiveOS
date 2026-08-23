"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type Props = {
  children: ReactNode;
  className?: string;
};

/**
 * Subtle zoom/focus on module change — dive deeper, never hard cut.
 */
export function ExsPageTransition({ children, className }: Props) {
  const pathname = usePathname() ?? "";

  return (
    <div key={pathname} className={cn("exs-page", className)}>
      {children}
    </div>
  );
}
