"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { focusRing } from "@/components/ui/styles";
import {
  PRIMARY_NAV,
  UTILITY_NAV,
} from "@/lib/navigation/primary-nav";

const COMMAND_OPEN_EVENT = "eos:open-command-palette";

const NAV_ITEMS = [
  ...PRIMARY_NAV.map((item) => ({
    href: item.href,
    label: item.label,
    keywords: item.keywords,
    group: "Primary",
  })),
  ...UTILITY_NAV.map((item) => ({
    href: item.href,
    label: item.label,
    keywords: item.keywords,
    group: "Account",
  })),
];

export function openCommandPalette() {
  if (typeof document === "undefined") return;
  document.dispatchEvent(new CustomEvent(COMMAND_OPEN_EVENT));
}

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return NAV_ITEMS;
    return NAV_ITEMS.filter(
      (item) =>
        item.label.toLowerCase().includes(normalized) ||
        item.keywords.some((keyword) => keyword.includes(normalized)),
    );
  }, [query]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, open]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
      if (event.key === "Escape") {
        close();
      }
    }

    function handleOpen() {
      setOpen(true);
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener(COMMAND_OPEN_EVENT, handleOpen);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener(COMMAND_OPEN_EVENT, handleOpen);
    };
  }, [close]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center p-4 pt-[12vh]">
      <button
        type="button"
        aria-label="Close command palette"
        className="absolute inset-0 bg-[var(--eos-overlay)] backdrop-blur-[1px]"
        onClick={close}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="relative z-10 w-full max-w-xl overflow-hidden rounded-[var(--eos-radius-xl)] border border-border bg-surface-raised shadow-[var(--eos-shadow-3)]"
      >
        <label className="sr-only" htmlFor="command-palette-input">
          Search pages
        </label>
        <input
          id="command-palette-input"
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setActiveIndex((index) =>
                Math.min(index + 1, Math.max(filtered.length - 1, 0)),
              );
            }
            if (event.key === "ArrowUp") {
              event.preventDefault();
              setActiveIndex((index) => Math.max(index - 1, 0));
            }
            if (event.key === "Enter" && filtered[activeIndex]) {
              event.preventDefault();
              const target = filtered[activeIndex];
              close();
              router.push(target.href);
            }
          }}
          placeholder="Go to…"
          className={cn(
            "w-full border-b border-border bg-transparent px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted",
            focusRing,
          )}
        />
        <ul className="max-h-80 overflow-y-auto py-2" role="listbox">
          {filtered.map((item, index) => (
            <li key={`${item.group}-${item.href}`} role="option" aria-selected={index === activeIndex}>
              <Link
                href={item.href}
                onClick={close}
                className={cn(
                  "flex items-center justify-between px-4 py-2.5 text-sm transition-colors",
                  index === activeIndex
                    ? "bg-accent-muted text-foreground"
                    : "text-secondary hover:bg-surface-inset hover:text-foreground",
                )}
              >
                <span>{item.label}</span>
                <span className="text-[11px] uppercase tracking-wide text-muted">
                  {item.group}
                </span>
              </Link>
            </li>
          ))}
          {filtered.length === 0 ? (
            <li className="px-4 py-6 text-center text-sm text-secondary">
              No matching destinations
            </li>
          ) : null}
        </ul>
        <p className="border-t border-border px-4 py-2 text-[11px] text-muted">
          ⌘K to open · Esc to close · ↑↓ to move · Enter to go
        </p>
      </div>
    </div>
  );
}
