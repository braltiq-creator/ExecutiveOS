import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type ResponsiveGridProps = {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4 | 5;
  gap?: "sm" | "md" | "lg";
  className?: string;
};

const columnMap = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4",
  5: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
} as const;

const gapMap = {
  sm: "gap-3",
  md: "gap-4",
  lg: "gap-6",
} as const;

export function ResponsiveGrid({
  children,
  columns = 3,
  gap = "md",
  className,
}: ResponsiveGridProps) {
  return (
    <div className={cn("grid", columnMap[columns], gapMap[gap], className)}>
      {children}
    </div>
  );
}
