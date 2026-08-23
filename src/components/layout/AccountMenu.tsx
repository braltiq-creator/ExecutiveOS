"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { useSession } from "@/components/providers/SessionProvider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { ACCOUNT_MENU_NAV } from "@/lib/navigation/primary-nav";
import { HighContrastToggle } from "@/experience/accessibility";

type AccountMenuProps = {
  className?: string;
};

export function AccountMenu({ className }: AccountMenuProps) {
  const session = useSession();
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("light");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem("eos-theme");
    const next = stored === "dark" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
  }, []);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!ref.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    window.localStorage.setItem("eos-theme", next);
  }

  return (
    <div ref={ref} className={cn("relative", className)}>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        onClick={() => setOpen((value) => !value)}
        className="gap-2"
      >
        <span
          aria-hidden
          className="inline-flex size-6 items-center justify-center rounded-full bg-surface-inset text-[10px] font-semibold text-foreground"
        >
          {session.profile.initials}
        </span>
        <span className="hidden max-w-[9rem] truncate sm:inline">
          {session.profile.preferredName}
        </span>
      </Button>
      {open ? (
        <div
          role="menu"
          aria-label="Account"
          className="absolute right-0 z-40 mt-2 w-64 rounded-[var(--eos-radius-lg)] border border-border bg-surface-raised py-1 shadow-[var(--eos-shadow-2)]"
        >
          <div className="border-b border-border px-3 py-3">
            <p className="text-sm font-medium text-foreground">
              {session.profile.fullName}
            </p>
            <p className="mt-0.5 text-xs text-muted">{session.profile.title}</p>
            <p className="mt-1 text-xs text-secondary">{session.company.name}</p>
          </div>
          {ACCOUNT_MENU_NAV.map((item) => (
            <Link
              key={item.id}
              role="menuitem"
              href={item.href}
              onClick={() => setOpen(false)}
              className="block px-3 py-2.5 text-sm text-secondary transition-colors hover:bg-surface-inset hover:text-foreground focus-visible:bg-surface-inset focus-visible:outline-none"
            >
              {item.label}
            </Link>
          ))}
          <button
            type="button"
            role="menuitem"
            onClick={toggleTheme}
            className="block w-full px-3 py-2.5 text-left text-sm text-secondary transition-colors hover:bg-surface-inset hover:text-foreground focus-visible:bg-surface-inset focus-visible:outline-none"
          >
            {theme === "dark" ? "Use light appearance" : "Use dark appearance"}
          </button>
          <div className="px-3 py-2">
            <HighContrastToggle />
          </div>
          <div className="border-t border-border px-3 py-2">
            <SignOutButton variant="secondary" />
          </div>
        </div>
      ) : null}
    </div>
  );
}
