import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type ExperiencePageProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  /** Narrow reading column for executive brief surfaces */
  width?: "brief" | "wide";
};

export function ExperiencePage({
  children,
  className,
  width = "brief",
  ...props
}: ExperiencePageProps) {
  return (
    <div
      className={cn(
        "ex-canvas mx-auto w-full",
        width === "brief" ? "max-w-3xl" : "max-w-5xl",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
