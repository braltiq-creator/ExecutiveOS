"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV } from "@/components/marketing/content";

function isActive(href: string, pathname: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MarketingNavLinks() {
  const pathname = usePathname() ?? "/";

  return (
    <nav className="mk-nav-links" aria-label="Primary">
      {NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="mk-nav-link"
          data-active={isActive(item.href, pathname)}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
