"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import {
  PRIMARY_NAV,
  isPrimaryNavActive,
} from "@/lib/navigation/primary-nav";
import { EXECUTIVE_ICONS } from "@/experience/icons";
import { ExecutiveNavigationItem, ds } from "@/design-system";

type PrimaryNavProps = {
  variant?: "sidebar" | "mobile";
  className?: string;
};

const NAV_ICONS = {
  today: EXECUTIVE_ICONS.today,
  strategy: EXECUTIVE_ICONS.strategy,
  decisions: EXECUTIVE_ICONS.decisions,
  knowledge: EXECUTIVE_ICONS.knowledge,
  reports: EXECUTIVE_ICONS.reports,
  data: EXECUTIVE_ICONS.data,
  administration: EXECUTIVE_ICONS.administration,
} as const;

/** Primary navigation — architecture preserved; clearer active state + monochrome icons. */
export function PrimaryNav({
  variant = "sidebar",
  className,
}: PrimaryNavProps) {
  const pathname = usePathname() ?? "";

  if (variant === "mobile") {
    return (
      <nav
        aria-label="Primary"
        className={cn(
          "eos-glass fixed inset-x-0 bottom-0 z-40 border-0 border-t border-[var(--eos-elevation-floating-border)] lg:hidden",
          className,
        )}
      >
        <ul className="mx-auto flex max-w-3xl items-stretch justify-between gap-[var(--eos-space-xs)] px-[var(--eos-space-xs)] pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-[var(--eos-space-xs)]">
          {PRIMARY_NAV.map((item) => {
            const active = isPrimaryNavActive(pathname, item.href);
            const Icon = NAV_ICONS[item.id as keyof typeof NAV_ICONS];
            return (
              <li key={item.id} className="min-w-0 flex-1">
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  data-active={active ? "true" : "false"}
                  className={cn(
                    "eos-nav-link flex min-h-12 flex-col items-center justify-center gap-1 rounded-[var(--eos-radius-md)] px-[var(--eos-space-xs)] py-[var(--eos-space-xs)] text-center",
                    ds.type.label,
                    ds.focusRing,
                    active
                      ? "text-[var(--eos-color-text)] normal-case tracking-normal"
                      : "text-[var(--eos-color-text-secondary)] normal-case tracking-normal",
                  )}
                >
                  {Icon ? (
                    <Icon
                      className={cn(
                        "h-4 w-4",
                        active
                          ? "text-[var(--eos-color-text)]"
                          : "text-[var(--eos-color-text-muted)]",
                      )}
                      strokeWidth={active ? 2.25 : 1.75}
                      aria-hidden="true"
                    />
                  ) : (
                    <span
                      className={cn(
                        "h-0.5 w-4 rounded-full",
                        active
                          ? "bg-[var(--eos-color-navigation)]"
                          : "bg-transparent",
                      )}
                      aria-hidden="true"
                    />
                  )}
                  <span className="truncate text-[length:var(--eos-type-caption-size)] font-medium">
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    );
  }

  return (
    <nav
      aria-label="Primary"
      className={cn("flex flex-col gap-1", className)}
    >
      {PRIMARY_NAV.map((item) => {
        const Icon = NAV_ICONS[item.id as keyof typeof NAV_ICONS];
        return (
          <ExecutiveNavigationItem
            key={item.id}
            href={item.href}
            active={isPrimaryNavActive(pathname, item.href)}
            icon={Icon ? <Icon strokeWidth={1.75} /> : undefined}
          >
            {item.label}
          </ExecutiveNavigationItem>
        );
      })}
    </nav>
  );
}
