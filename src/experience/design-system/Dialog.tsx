"use client";

import { useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { ExperienceButton } from "@/experience/design-system/Button";

type ExperienceDialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
};

/** Accessible dialog shell — focus trap light (Escape + overlay). */
export function ExperienceDialog({
  open,
  onClose,
  title,
  children,
  className,
}: ExperienceDialogProps) {
  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-[var(--eos-overlay)]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ex-dialog-title"
        className={cn(
          "relative z-10 w-full max-w-lg ex-surface p-6 shadow-[var(--eos-shadow-3)]",
          className,
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 id="ex-dialog-title" className="ex-heading">
            {title}
          </h2>
          <ExperienceButton variant="ghost" size="sm" onClick={onClose}>
            Close
          </ExperienceButton>
        </div>
        {children}
      </div>
    </div>
  );
}
