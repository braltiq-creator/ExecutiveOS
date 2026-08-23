import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { ds, type DsElevation } from "@/design-system/tokens";

type ExecutiveSurfaceProps = HTMLAttributes<HTMLDivElement> & {
  elevation?: DsElevation;
  children: ReactNode;
};

/** Elevation primitive — canvas → modal. */
export function ExecutiveSurface({
  elevation = "surface",
  className,
  children,
  ...props
}: ExecutiveSurfaceProps) {
  return (
    <div className={cn(ds.elevation[elevation], className)} {...props}>
      {children}
    </div>
  );
}
