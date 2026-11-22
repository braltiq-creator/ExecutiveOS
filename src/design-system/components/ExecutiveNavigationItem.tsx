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

/** Primary nav item — OS rail active state with Executive Blue accent. */
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
        "eos-nav-link group relative inline-flex min-h-9 w-full items-center gap-2.5",
        "rounded-[var(--eos-radius-md)] px-2.5",
        "text-[length:0.8125rem] font-medium tracking-tight",
        ds.motion.navigation,
        ds.focusRing,
        active
          ? "bg-[color-mix(in_srgb,var(--eos-color-navigation)_12%,transparent)] text-[var(--eos-color-text)]"
          : "text-[var(--eos-color-text-secondary)] hover:bg-[color-mix(in_srgb,var(--eos-color-text)_4%,transparent)] hover:text-[var(--eos-color-text)]",
        className,
      )}
    >
      {active ? (
        <span
          className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-[var(--eos-color-navigation)]"
          aria-hidden="true"
        />
      ) : null}
      {icon ? (
        <span
          className={cn(
            "inline-flex h-4 w-4 shrink-0 items-center justify-center [&_svg]:h-4 [&_svg]:w-4",
            active
              ? "text-[var(--eos-color-navigation)]"
              : "text-[var(--eos-color-text-muted)] group-hover:text-[var(--eos-color-text-secondary)]",
          )}
          aria-hidden="true"
        >
          {icon}
        </span>
      ) : null}
      <span>{children}</span>
    </Link>
  );
}
