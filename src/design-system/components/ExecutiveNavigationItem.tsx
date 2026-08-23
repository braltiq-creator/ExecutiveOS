import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { ds } from "@/design-system/tokens";

type ExecutiveNavigationItemProps = {
  href: string;
  active?: boolean;
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
};

/** Primary nav item — calm active state, optional monochrome icon. */
export function ExecutiveNavigationItem({
  href,
  active = false,
  children,
  icon,
  className,
}: ExecutiveNavigationItemProps) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      data-active={active ? "true" : "false"}
      className={cn(
        "eos-nav-link group inline-flex min-h-10 items-center gap-2.5",
        "rounded-[var(--eos-radius-md)] px-[var(--eos-space-md)]",
        "text-[length:var(--eos-type-body-size)] font-medium tracking-tight",
        ds.motion.navigation,
        ds.focusRing,
        active
          ? "bg-[color-mix(in_srgb,var(--eos-color-text)_6%,transparent)] text-[var(--eos-color-text)]"
          : "text-[var(--eos-color-text-secondary)] hover:bg-[color-mix(in_srgb,var(--eos-color-text)_3%,transparent)] hover:text-[var(--eos-color-text)]",
        className,
      )}
    >
      {icon ? (
        <span
          className={cn(
            "inline-flex h-4 w-4 shrink-0 items-center justify-center [&_svg]:h-4 [&_svg]:w-4",
            active
              ? "text-[var(--eos-color-text)]"
              : "text-[var(--eos-color-text-muted)] group-hover:text-[var(--eos-color-text-secondary)]",
          )}
          aria-hidden="true"
        >
          {icon}
        </span>
      ) : null}
      <span className="relative">
        {children}
        {active ? (
          <span
            className="absolute -bottom-1 left-0 h-px w-full bg-[var(--eos-color-text)]"
            aria-hidden="true"
          />
        ) : null}
      </span>
    </Link>
  );
}
