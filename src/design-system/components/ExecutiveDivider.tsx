import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type ExecutiveDividerProps = HTMLAttributes<HTMLHRElement> & {
  soft?: boolean;
};

/** Hairline divider — prefer whitespace when possible. */
export function ExecutiveDivider({
  soft = true,
  className,
  ...props
}: ExecutiveDividerProps) {
  return (
    <hr
      className={cn(
        "border-0 border-t",
        soft
          ? "border-[color:color-mix(in_srgb,var(--eos-color-divider)_60%,transparent)]"
          : "border-[var(--eos-color-divider)]",
        className,
      )}
      {...props}
    />
  );
}
