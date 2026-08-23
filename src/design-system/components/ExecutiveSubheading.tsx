import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { ds } from "@/design-system/tokens";

type ExecutiveSubheadingProps = HTMLAttributes<HTMLParagraphElement> & {
  children: ReactNode;
};

export function ExecutiveSubheading({
  className,
  children,
  ...props
}: ExecutiveSubheadingProps) {
  return (
    <p className={cn(ds.type.subheading, className)} {...props}>
      {children}
    </p>
  );
}
