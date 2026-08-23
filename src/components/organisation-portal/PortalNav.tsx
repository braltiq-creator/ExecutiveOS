"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ORGANISATION_PORTAL_NAV,
  isPortalNavActive,
} from "@/organisation-portal";

export function PortalNav() {
  const pathname = usePathname() ?? "/organisation";

  return (
    <nav
      aria-label="Organisation portal"
      className="flex flex-wrap gap-2 border-b border-[var(--eos-border)] pb-4"
    >
      {ORGANISATION_PORTAL_NAV.map((item) => {
        const active = isPortalNavActive(item.href, pathname);
        return (
          <Link
            key={item.id}
            href={item.href}
            className={
              active
                ? "rounded-full bg-[var(--ex-text)] px-3 py-1.5 text-sm text-[var(--ex-canvas)]"
                : "rounded-full border border-[var(--eos-border)] px-3 py-1.5 text-sm text-[var(--ex-text)] transition-colors hover:bg-[var(--ex-surface)]"
            }
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
