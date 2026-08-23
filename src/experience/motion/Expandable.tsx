"use client";

import { useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type ExpandableProps = {
  summary: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
};

/** Progressive disclosure — keyboard accessible. */
export function Expandable({
  summary,
  children,
  defaultOpen = false,
  className,
}: ExpandableProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <div className={cn("ex-expand border-b border-[var(--eos-border)]", className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "flex w-full items-center justify-between gap-4 py-3 text-left",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--eos-ring)] focus-visible:ring-offset-2",
        )}
      >
        <span className="min-w-0 flex-1">{summary}</span>
        <span className="ex-caption shrink-0">
          {open ? "Hide" : "Show"}
        </span>
      </button>
      {open ? (
        <div id={panelId} className="ex-motion pb-4">
          {children}
        </div>
      ) : null}
    </div>
  );
}
